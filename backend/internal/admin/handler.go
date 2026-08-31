package admin

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"devforge/backend/internal/projects"
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

func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	usersColl := h.db.Collection("users")
	projectsColl := h.db.Collection("projects")
	tasksColl := h.db.Collection("tasks")

	totalUsers, _ := usersColl.CountDocuments(ctx, bson.M{})
	totalProjects, _ := projectsColl.CountDocuments(ctx, bson.M{})
	activeProjects, _ := projectsColl.CountDocuments(ctx, bson.M{"status": "ACTIVE"})
	totalTasks, _ := tasksColl.CountDocuments(ctx, bson.M{})
	completedTasks, _ := tasksColl.CountDocuments(ctx, bson.M{"status": "COMPLETED"})

	stats := PlatformStats{
		TotalUsers:     totalUsers,
		TotalProjects:  totalProjects,
		TotalTasks:     totalTasks,
		CompletedTasks: completedTasks,
		ActiveProjects: activeProjects,
	}

	json.NewEncoder(w).Encode(stats)
}

func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	usersColl := h.db.Collection("users")
	cursor, err := usersColl.Find(ctx, bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch users"})
		return
	}

	var rawUsers []users.User
	_ = cursor.All(ctx, &rawUsers)

	result := make([]users.UserResponse, 0, len(rawUsers))
	for _, u := range rawUsers {
		result = append(result, u.ToResponse())
	}

	json.NewEncoder(w).Encode(result)
}

func (h *Handler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	targetUserIDStr := chi.URLParam(r, "id")
	targetUserID, err := primitive.ObjectIDFromHex(targetUserIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid user ID format"})
		return
	}

	var req UpdateRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request payload"})
		return
	}

	if req.Role != users.RoleAdmin && req.Role != users.RoleLeader && req.Role != users.RoleMember {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid role specified"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	usersColl := h.db.Collection("users")
	update := bson.M{
		"$set": bson.M{
			"role":      req.Role,
			"updatedAt": time.Now(),
		},
	}

	_, err = usersColl.UpdateOne(ctx, bson.M{"_id": targetUserID}, update)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to update user role"})
		return
	}

	var updatedUser users.User
	_ = usersColl.FindOne(ctx, bson.M{"_id": targetUserID}).Decode(&updatedUser)

	json.NewEncoder(w).Encode(updatedUser.ToResponse())
}

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	targetUserIDStr := chi.URLParam(r, "id")
	targetUserID, err := primitive.ObjectIDFromHex(targetUserIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid user ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	usersColl := h.db.Collection("users")
	_, err = usersColl.DeleteOne(ctx, bson.M{"_id": targetUserID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to delete user"})
		return
	}

	// Clean up user's memberships and unassign tasks
	membersColl := h.db.Collection("project_members")
	tasksColl := h.db.Collection("tasks")
	_, _ = membersColl.DeleteMany(ctx, bson.M{"userId": targetUserID})
	_, _ = tasksColl.UpdateMany(ctx, bson.M{"assignedTo": targetUserID}, bson.M{"$unset": bson.M{"assignedTo": ""}})

	json.NewEncoder(w).Encode(map[string]string{
		"message": "User deleted successfully",
		"id":      targetUserIDStr,
	})
}

func (h *Handler) ListProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	projectsColl := h.db.Collection("projects")
	cursor, err := projectsColl.Find(ctx, bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch projects"})
		return
	}

	var rawProjects []projects.Project
	_ = cursor.All(ctx, &rawProjects)

	usersColl := h.db.Collection("users")
	membersColl := h.db.Collection("project_members")
	tasksColl := h.db.Collection("tasks")

	result := make([]projects.ProjectResponse, 0, len(rawProjects))
	for _, p := range rawProjects {
		var leaderUser users.User
		_ = usersColl.FindOne(ctx, bson.M{"_id": p.LeaderID}).Decode(&leaderUser)
		leaderResp := leaderUser.ToResponse()

		memberCount, _ := membersColl.CountDocuments(ctx, bson.M{"projectId": p.ID})
		if memberCount == 0 {
			memberCount = 1
		}

		taskCount, _ := tasksColl.CountDocuments(ctx, bson.M{"projectId": p.ID})
		completedTasks, _ := tasksColl.CountDocuments(ctx, bson.M{"projectId": p.ID, "status": "COMPLETED"})

		result = append(result, p.ToResponse(&leaderResp, int(taskCount), int(completedTasks), int(memberCount)))
	}

	json.NewEncoder(w).Encode(result)
}

func (h *Handler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	projectIDStr := chi.URLParam(r, "id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid project ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	projectsColl := h.db.Collection("projects")
	_, err = projectsColl.DeleteOne(ctx, bson.M{"_id": projectID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to delete project"})
		return
	}

	membersColl := h.db.Collection("project_members")
	tasksColl := h.db.Collection("tasks")
	messagesColl := h.db.Collection("messages")

	_, _ = membersColl.DeleteMany(ctx, bson.M{"projectId": projectID})
	_, _ = tasksColl.DeleteMany(ctx, bson.M{"projectId": projectID})
	_, _ = messagesColl.DeleteMany(ctx, bson.M{"projectId": projectID})

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Project removed by administrator",
		"id":      projectIDStr,
	})
}
