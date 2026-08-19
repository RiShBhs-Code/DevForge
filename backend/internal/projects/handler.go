package projects

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"devforge/backend/internal/middleware"
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

type ProjectMemberRecord struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserID    primitive.ObjectID `bson:"userId"`
	ProjectID primitive.ObjectID `bson:"projectId"`
	Role      string             `bson:"role"` // LEADER, MEMBER
	JoinedAt  time.Time          `bson:"joinedAt"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func (h *Handler) CreateProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}

	leaderObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid user ID"})
		return
	}

	var req CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request payload"})
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	if req.Title == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Project title is required"})
		return
	}

	status := req.Status
	if status == "" {
		status = StatusPlanning
	}

	var deadline time.Time
	if req.Deadline != "" {
		parsed, err := time.Parse(time.RFC3339, req.Deadline)
		if err == nil {
			deadline = parsed
		} else {
			// Fallback parsing date string YYYY-MM-DD
			parsedDate, errDate := time.Parse("2006-01-02", req.Deadline)
			if errDate == nil {
				deadline = parsedDate
			} else {
				deadline = time.Now().AddDate(0, 1, 0)
			}
		}
	} else {
		deadline = time.Now().AddDate(0, 1, 0)
	}

	now := time.Now()
	project := Project{
		ID:          primitive.NewObjectID(),
		Title:       req.Title,
		Description: strings.TrimSpace(req.Description),
		Status:      status,
		Deadline:    deadline,
		LeaderID:    leaderObjID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	projectsColl := h.db.Collection("projects")
	_, err = projectsColl.InsertOne(ctx, project)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to create project"})
		return
	}

	// Insert leader as project member
	membersColl := h.db.Collection("project_members")
	_, _ = membersColl.InsertOne(ctx, ProjectMemberRecord{
		ID:        primitive.NewObjectID(),
		UserID:    leaderObjID,
		ProjectID: project.ID,
		Role:      "LEADER",
		JoinedAt:  now,
	})

	// Fetch leader user info for response
	usersColl := h.db.Collection("users")
	var leaderUser users.User
	_ = usersColl.FindOne(ctx, bson.M{"_id": leaderObjID}).Decode(&leaderUser)
	leaderResp := leaderUser.ToResponse()

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(project.ToResponse(&leaderResp, 0, 0, 1))
}

func (h *Handler) ListProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}

	userRole := middleware.GetRoleFromContext(r.Context())
	userObjID, _ := primitive.ObjectIDFromHex(userIDStr)

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	statusFilter := r.URL.Query().Get("status")
	if statusFilter != "" {
		filter["status"] = strings.ToUpper(statusFilter)
	}

	// If not admin, restrict to projects led by user or where user is member
	if userRole != users.RoleAdmin {
		membersColl := h.db.Collection("project_members")
		cursor, err := membersColl.Find(ctx, bson.M{"userId": userObjID})
		projectIDs := []primitive.ObjectID{}

		if err == nil {
			var memberRecords []ProjectMemberRecord
			_ = cursor.All(ctx, &memberRecords)
			for _, m := range memberRecords {
				projectIDs = append(projectIDs, m.ProjectID)
			}
		}

		filter["$or"] = []bson.M{
			{"leaderId": userObjID},
			{"_id": bson.M{"$in": projectIDs}},
		}
	}

	projectsColl := h.db.Collection("projects")
	cursor, err := projectsColl.Find(ctx, filter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch projects"})
		return
	}

	var rawProjects []Project
	if err := cursor.All(ctx, &rawProjects); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to parse projects"})
		return
	}

	// Populate response list with stats
	result := make([]ProjectResponse, 0, len(rawProjects))
	usersColl := h.db.Collection("users")
	membersColl := h.db.Collection("project_members")
	tasksColl := h.db.Collection("tasks")

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

func (h *Handler) GetProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	projectIDStr := chi.URLParam(r, "id")
	projectObjID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid project ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	projectsColl := h.db.Collection("projects")
	var project Project
	if err := projectsColl.FindOne(ctx, bson.M{"_id": projectObjID}).Decode(&project); err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Project not found"})
		return
	}

	usersColl := h.db.Collection("users")
	membersColl := h.db.Collection("project_members")
	tasksColl := h.db.Collection("tasks")

	var leaderUser users.User
	_ = usersColl.FindOne(ctx, bson.M{"_id": project.LeaderID}).Decode(&leaderUser)
	leaderResp := leaderUser.ToResponse()

	memberCount, _ := membersColl.CountDocuments(ctx, bson.M{"projectId": project.ID})
	if memberCount == 0 {
		memberCount = 1
	}

	taskCount, _ := tasksColl.CountDocuments(ctx, bson.M{"projectId": project.ID})
	completedTasks, _ := tasksColl.CountDocuments(ctx, bson.M{"projectId": project.ID, "status": "COMPLETED"})

	json.NewEncoder(w).Encode(project.ToResponse(&leaderResp, int(taskCount), int(completedTasks), int(memberCount)))
}

func (h *Handler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	userRole := middleware.GetRoleFromContext(r.Context())
	userObjID, _ := primitive.ObjectIDFromHex(userIDStr)

	projectIDStr := chi.URLParam(r, "id")
	projectObjID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid project ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	projectsColl := h.db.Collection("projects")
	var project Project
	if err := projectsColl.FindOne(ctx, bson.M{"_id": projectObjID}).Decode(&project); err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Project not found"})
		return
	}

	// Permission check: caller must be leader or admin
	if userRole != users.RoleAdmin && project.LeaderID != userObjID {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: only the project leader or admin can update this project"})
		return
	}

	var req UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request payload"})
		return
	}

	updateFields := bson.M{
		"updatedAt": time.Now(),
	}

	if strings.TrimSpace(req.Title) != "" {
		updateFields["title"] = strings.TrimSpace(req.Title)
	}
	if req.Description != "" {
		updateFields["description"] = strings.TrimSpace(req.Description)
	}
	if req.Status != "" {
		updateFields["status"] = req.Status
	}
	if req.Deadline != "" {
		if parsed, err := time.Parse(time.RFC3339, req.Deadline); err == nil {
			updateFields["deadline"] = parsed
		} else if parsedDate, errDate := time.Parse("2006-01-02", req.Deadline); errDate == nil {
			updateFields["deadline"] = parsedDate
		}
	}

	_, err = projectsColl.UpdateOne(ctx, bson.M{"_id": projectObjID}, bson.M{"$set": updateFields})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to update project"})
		return
	}

	var updatedProject Project
	_ = projectsColl.FindOne(ctx, bson.M{"_id": projectObjID}).Decode(&updatedProject)

	usersColl := h.db.Collection("users")
	membersColl := h.db.Collection("project_members")
	tasksColl := h.db.Collection("tasks")

	var leaderUser users.User
	_ = usersColl.FindOne(ctx, bson.M{"_id": updatedProject.LeaderID}).Decode(&leaderUser)
	leaderResp := leaderUser.ToResponse()

	memberCount, _ := membersColl.CountDocuments(ctx, bson.M{"projectId": updatedProject.ID})
	if memberCount == 0 {
		memberCount = 1
	}

	taskCount, _ := tasksColl.CountDocuments(ctx, bson.M{"projectId": updatedProject.ID})
	completedTasks, _ := tasksColl.CountDocuments(ctx, bson.M{"projectId": updatedProject.ID, "status": "COMPLETED"})

	json.NewEncoder(w).Encode(updatedProject.ToResponse(&leaderResp, int(taskCount), int(completedTasks), int(memberCount)))
}

func (h *Handler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	userRole := middleware.GetRoleFromContext(r.Context())
	userObjID, _ := primitive.ObjectIDFromHex(userIDStr)

	projectIDStr := chi.URLParam(r, "id")
	projectObjID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid project ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	projectsColl := h.db.Collection("projects")
	var project Project
	if err := projectsColl.FindOne(ctx, bson.M{"_id": projectObjID}).Decode(&project); err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Project not found"})
		return
	}

	// Permission check: caller must be leader or admin
	if userRole != users.RoleAdmin && project.LeaderID != userObjID {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: only the project leader or admin can delete this project"})
		return
	}

	_, err = projectsColl.DeleteOne(ctx, bson.M{"_id": projectObjID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to delete project"})
		return
	}

	// Cleanup members and tasks
	membersColl := h.db.Collection("project_members")
	tasksColl := h.db.Collection("tasks")
	_, _ = membersColl.DeleteMany(ctx, bson.M{"projectId": projectObjID})
	_, _ = tasksColl.DeleteMany(ctx, bson.M{"projectId": projectObjID})

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Project deleted successfully",
		"id":      projectIDStr,
	})
}
