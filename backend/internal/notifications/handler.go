package notifications

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"devforge/backend/internal/middleware"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Handler struct {
	db *mongo.Database
}

func NewHandler(db *mongo.Database) *Handler {
	return &Handler{db: db}
}

type ErrorResponse struct {
	Error string `json:"error"`
}

// Helper to create notifications from any backend package
func CreateNotification(ctx context.Context, db *mongo.Database, userID primitive.ObjectID, notifType NotificationType, message string) error {
	coll := db.Collection("notifications")
	notif := Notification{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Type:      notifType,
		Message:   message,
		Read:      false,
		CreatedAt: time.Now(),
	}
	_, err := coll.InsertOne(ctx, notif)
	return err
}

func (h *Handler) GetNotifications(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	coll := h.db.Collection("notifications")
	findOpts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(50)

	cursor, err := coll.Find(ctx, bson.M{"userId": userID}, findOpts)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch notifications"})
		return
	}

	var rawNotifs []Notification
	_ = cursor.All(ctx, &rawNotifs)

	result := make([]NotificationResponse, 0, len(rawNotifs))
	for _, n := range rawNotifs {
		result = append(result, n.ToResponse())
	}

	json.NewEncoder(w).Encode(result)
}

func (h *Handler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	notifIDStr := chi.URLParam(r, "id")
	notifID, err := primitive.ObjectIDFromHex(notifIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid notification ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	coll := h.db.Collection("notifications")
	filter := bson.M{"_id": notifID, "userId": userID}
	update := bson.M{"$set": bson.M{"read": true}}

	_, err = coll.UpdateOne(ctx, filter, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to update notification"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Notification marked as read",
		"id":      notifIDStr,
	})
}

func (h *Handler) MarkAllAsRead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	coll := h.db.Collection("notifications")
	filter := bson.M{"userId": userID, "read": false}
	update := bson.M{"$set": bson.M{"read": true}}

	res, err := coll.UpdateMany(ctx, filter, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to update notifications"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "All notifications marked as read",
		"count":   res.ModifiedCount,
	})
}
