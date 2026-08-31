package members

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"devforge/backend/internal/middleware"
	"devforge/backend/internal/notifications"
	"devforge/backend/internal/users"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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

// Helper: check if caller is project leader or admin
func (h *Handler) isLeaderOrAdmin(ctx context.Context, projectID, userID primitive.ObjectID, userRole users.Role) (bool, error) {
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

	return proj.LeaderID == userID, nil
}

func (h *Handler) GetProjectMembers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}

	projectIDStr := chi.URLParam(r, "id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid project ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Verify project exists
	projectsColl := h.db.Collection("projects")
	var proj struct {
		ID       primitive.ObjectID `bson:"_id"`
		LeaderID primitive.ObjectID `bson:"leaderId"`
	}
	if err := projectsColl.FindOne(ctx, bson.M{"_id": projectID}).Decode(&proj); err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Project not found"})
		return
	}

	membersColl := h.db.Collection("project_members")
	cursor, err := membersColl.Find(ctx, bson.M{"projectId": projectID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch members"})
		return
	}

	var rawMembers []ProjectMember
	_ = cursor.All(ctx, &rawMembers)

	// Ensure leader is present in the members list
	leaderPresent := false
	for _, m := range rawMembers {
		if m.UserID == proj.LeaderID {
			leaderPresent = true
			break
		}
	}
	if !leaderPresent {
		leaderMember := ProjectMember{
			ID:        primitive.NewObjectID(),
			UserID:    proj.LeaderID,
			ProjectID: projectID,
			Role:      MemberRoleLeader,
			JoinedAt:  time.Now(),
		}
		rawMembers = append([]ProjectMember{leaderMember}, rawMembers...)
	}

	usersColl := h.db.Collection("users")
	result := make([]MemberResponse, 0, len(rawMembers))
	for _, m := range rawMembers {
		var u users.User
		_ = usersColl.FindOne(ctx, bson.M{"_id": m.UserID}).Decode(&u)
		uResp := u.ToResponse()
		result = append(result, m.ToResponse(&uResp))
	}

	json.NewEncoder(w).Encode(result)
}

func (h *Handler) AddProjectMember(w http.ResponseWriter, r *http.Request) {
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

	allowed, err := h.isLeaderOrAdmin(ctx, projectID, userID, userRole)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Project not found"})
		return
	}
	if !allowed {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: only project leader or admin can add team members"})
		return
	}

	var req AddMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request payload"})
		return
	}

	targetEmail := strings.TrimSpace(strings.ToLower(req.Email))
	if targetEmail == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "User email is required"})
		return
	}

	usersColl := h.db.Collection("users")
	var targetUser users.User
	if err := usersColl.FindOne(ctx, bson.M{"email": targetEmail}).Decode(&targetUser); err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "No user found with the provided email"})
		return
	}

	membersColl := h.db.Collection("project_members")
	count, err := membersColl.CountDocuments(ctx, bson.M{"projectId": projectID, "userId": targetUser.ID})
	if err == nil && count > 0 {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "User is already a member of this project"})
		return
	}

	now := time.Now()
	newMember := ProjectMember{
		ID:        primitive.NewObjectID(),
		UserID:    targetUser.ID,
		ProjectID: projectID,
		Role:      MemberRoleMember,
		JoinedAt:  now,
	}

	_, err = membersColl.InsertOne(ctx, newMember)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to add project member"})
		return
	}

	// Fetch project title for notification
	projectsColl := h.db.Collection("projects")
	var proj struct {
		Title string `bson:"title"`
	}
	projTitle := "DevForge Project"
	if err := projectsColl.FindOne(ctx, bson.M{"_id": projectID}).Decode(&proj); err == nil && proj.Title != "" {
		projTitle = proj.Title
	}

	_ = notifications.CreateNotification(
		ctx,
		h.db,
		targetUser.ID,
		notifications.TypeMemberAdded,
		"You were added to "+projTitle+".",
	)

	targetUserResp := targetUser.ToResponse()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newMember.ToResponse(&targetUserResp))
}

func (h *Handler) RemoveProjectMember(w http.ResponseWriter, r *http.Request) {
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

	removeUserIDStr := chi.URLParam(r, "userId")
	removeUserID, err := primitive.ObjectIDFromHex(removeUserIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid user ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	allowed, err := h.isLeaderOrAdmin(ctx, projectID, userID, userRole)
	if err != nil || !allowed {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: only project leader or admin can remove members"})
		return
	}

	// Prevent removing leader
	projectsColl := h.db.Collection("projects")
	var proj struct {
		LeaderID primitive.ObjectID `bson:"leaderId"`
	}
	_ = projectsColl.FindOne(ctx, bson.M{"_id": projectID}).Decode(&proj)
	if proj.LeaderID == removeUserID {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Cannot remove the project leader from the project"})
		return
	}

	membersColl := h.db.Collection("project_members")
	_, err = membersColl.DeleteOne(ctx, bson.M{"projectId": projectID, "userId": removeUserID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to remove member"})
		return
	}

	// Unassign member's tasks in this project
	tasksColl := h.db.Collection("tasks")
	_, _ = tasksColl.UpdateMany(ctx, bson.M{"projectId": projectID, "assignedTo": removeUserID}, bson.M{"$unset": bson.M{"assignedTo": ""}})

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Project member removed successfully",
		"userId":  removeUserIDStr,
	})
}
