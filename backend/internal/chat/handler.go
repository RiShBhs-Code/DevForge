package chat

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"devforge/backend/internal/middleware"
	"devforge/backend/internal/users"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Handler struct {
	db        *mongo.Database
	hub       *Hub
	jwtSecret string
}

func NewHandler(db *mongo.Database, hub *Hub, jwtSecret string) *Handler {
	return &Handler{
		db:        db,
		hub:       hub,
		jwtSecret: jwtSecret,
	}
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func (h *Handler) validateToken(r *http.Request) (string, users.Role, error) {
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		authHeader := r.Header.Get("Authorization")
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			tokenString = parts[1]
		}
	}

	if tokenString == "" {
		return "", "", http.ErrNoCookie
	}

	claims := &middleware.Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return "", "", err
	}

	return claims.UserID, claims.Role, nil
}

func (h *Handler) checkMembership(ctx context.Context, projectID, userID primitive.ObjectID, userRole users.Role) (bool, error) {
	if userRole == users.RoleAdmin {
		return true, nil
	}

	projectsColl := h.db.Collection("projects")
	var proj struct {
		LeaderID primitive.ObjectID `bson:"leaderId"`
	}
	if err := projectsColl.FindOne(ctx, bson.M{"_id": projectID}).Decode(&proj); err != nil {
		return false, err
	}

	if proj.LeaderID == userID {
		return true, nil
	}

	membersColl := h.db.Collection("project_members")
	count, err := membersColl.CountDocuments(ctx, bson.M{"projectId": projectID, "userId": userID})
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (h *Handler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	userIDStr, userRole, err := h.validateToken(r)
	if err != nil || userIDStr == "" {
		http.Error(w, `{"error":"Unauthorized WebSocket access"}`, http.StatusUnauthorized)
		return
	}

	projectIDStr := chi.URLParam(r, "id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	if err != nil {
		http.Error(w, `{"error":"Invalid project ID format"}`, http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	isMember, err := h.checkMembership(ctx, projectID, userID, userRole)
	if err != nil || !isMember {
		http.Error(w, `{"error":"Forbidden: not a project member"}`, http.StatusForbidden)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	client := &Client{
		hub:       h.hub,
		conn:      conn,
		send:      make(chan []byte, 256),
		UserID:    userIDStr,
		ProjectID: projectIDStr,
		db:        h.db,
	}

	h.hub.Register <- client

	go client.writePump()
	go client.readPump()
}

func (h *Handler) GetProjectMessages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDStr)
	userRole := middleware.GetRoleFromContext(r.Context())

	projectIDStr := chi.URLParam(r, "id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid project ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	isMember, err := h.checkMembership(ctx, projectID, userID, userRole)
	if err != nil || !isMember {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: not a project member"})
		return
	}

	messagesColl := h.db.Collection("messages")
	findOpts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}}).SetLimit(100)

	cursor, err := messagesColl.Find(ctx, bson.M{"projectId": projectID}, findOpts)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch messages"})
		return
	}

	var rawMessages []Message
	_ = cursor.All(ctx, &rawMessages)

	usersColl := h.db.Collection("users")
	result := make([]MessageResponse, 0, len(rawMessages))
	userCache := make(map[primitive.ObjectID]users.UserResponse)

	for _, msg := range rawMessages {
		uResp, ok := userCache[msg.SenderID]
		if !ok {
			var u users.User
			if err := usersColl.FindOne(ctx, bson.M{"_id": msg.SenderID}).Decode(&u); err == nil {
				uResp = u.ToResponse()
				userCache[msg.SenderID] = uResp
			}
		}
		result = append(result, msg.ToResponse(&uResp))
	}

	json.NewEncoder(w).Encode(result)
}
