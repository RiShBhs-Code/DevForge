package tasks

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

type ErrorResponse struct {
	Error string `json:"error"`
}

// Helper: check if user is leader or admin or member of project
func (h *Handler) checkProjectAccess(ctx context.Context, projectID, userID primitive.ObjectID, userRole users.Role) (isLeaderOrAdmin bool, isMember bool, err error) {
	if userRole == users.RoleAdmin {
		return true, true, nil
	}

	projectsColl := h.db.Collection("projects")
	var proj struct {
		LeaderID primitive.ObjectID `bson:"leaderId"`
	}
	if err := projectsColl.FindOne(ctx, bson.M{"_id": projectID}).Decode(&proj); err != nil {
		return false, false, err
	}

	if proj.LeaderID == userID {
		return true, true, nil
	}

	membersColl := h.db.Collection("project_members")
	count, err := membersColl.CountDocuments(ctx, bson.M{"projectId": projectID, "userId": userID})
	if err != nil {
		return false, false, err
	}

	return false, count > 0, nil
}

// Helper: fetch user details for assignee
func (h *Handler) fetchAssignee(ctx context.Context, assigneeID *primitive.ObjectID) *users.UserResponse {
	if assigneeID == nil || assigneeID.IsZero() {
		return nil
	}
	usersColl := h.db.Collection("users")
	var u users.User
	if err := usersColl.FindOne(ctx, bson.M{"_id": *assigneeID}).Decode(&u); err == nil {
		resp := u.ToResponse()
		return &resp
	}
	return nil
}

func (h *Handler) GetProjectTasks(w http.ResponseWriter, r *http.Request) {
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

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	_, isMember, err := h.checkProjectAccess(ctx, projectID, userID, userRole)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Project not found"})
		return
	}
	if !isMember {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: not a project member"})
		return
	}

	tasksColl := h.db.Collection("tasks")
	filter := bson.M{"projectId": projectID}

	if statusQuery := r.URL.Query().Get("status"); statusQuery != "" {
		filter["status"] = strings.ToUpper(statusQuery)
	}

	cursor, err := tasksColl.Find(ctx, filter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch tasks"})
		return
	}

	var rawTasks []Task
	if err := cursor.All(ctx, &rawTasks); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to parse tasks"})
		return
	}

	result := make([]TaskResponse, 0, len(rawTasks))
	for _, t := range rawTasks {
		assigneeResp := h.fetchAssignee(ctx, t.AssignedTo)
		result = append(result, t.ToResponse(assigneeResp))
	}

	json.NewEncoder(w).Encode(result)
}

func (h *Handler) CreateTask(w http.ResponseWriter, r *http.Request) {
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

	isLeaderOrAdmin, _, err := h.checkProjectAccess(ctx, projectID, userID, userRole)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Project not found"})
		return
	}
	if !isLeaderOrAdmin {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: only project leader or admin can create tasks"})
		return
	}

	var req CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request payload"})
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	if req.Title == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Task title is required"})
		return
	}

	status := req.Status
	if status == "" {
		status = StatusTodo
	}

	priority := req.Priority
	if priority == "" {
		priority = PriorityMedium
	}

	var assignedToObj *primitive.ObjectID
	if strings.TrimSpace(req.AssignedTo) != "" {
		if obj, err := primitive.ObjectIDFromHex(strings.TrimSpace(req.AssignedTo)); err == nil {
			assignedToObj = &obj
		}
	}

	var deadline time.Time
	if req.Deadline != "" {
		if parsed, err := time.Parse(time.RFC3339, req.Deadline); err == nil {
			deadline = parsed
		} else if parsedDate, errDate := time.Parse("2006-01-02", req.Deadline); errDate == nil {
			deadline = parsedDate
		} else {
			deadline = time.Now().AddDate(0, 0, 7)
		}
	} else {
		deadline = time.Now().AddDate(0, 0, 7)
	}

	now := time.Now()
	task := Task{
		ID:          primitive.NewObjectID(),
		Title:       req.Title,
		Description: strings.TrimSpace(req.Description),
		ProjectID:   projectID,
		AssignedTo:  assignedToObj,
		Status:      status,
		Priority:    priority,
		Deadline:    deadline,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	tasksColl := h.db.Collection("tasks")
	_, err = tasksColl.InsertOne(ctx, task)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to create task"})
		return
	}

	assigneeResp := h.fetchAssignee(ctx, task.AssignedTo)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task.ToResponse(assigneeResp))
}

func (h *Handler) GetMyTasks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	tasksColl := h.db.Collection("tasks")
	filter := bson.M{"assignedTo": userID}

	if statusQuery := r.URL.Query().Get("status"); statusQuery != "" {
		filter["status"] = strings.ToUpper(statusQuery)
	}

	cursor, err := tasksColl.Find(ctx, filter)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to fetch assigned tasks"})
		return
	}

	var rawTasks []Task
	if err := cursor.All(ctx, &rawTasks); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to parse tasks"})
		return
	}

	result := make([]TaskResponse, 0, len(rawTasks))
	for _, t := range rawTasks {
		assigneeResp := h.fetchAssignee(ctx, t.AssignedTo)
		result = append(result, t.ToResponse(assigneeResp))
	}

	json.NewEncoder(w).Encode(result)
}

func (h *Handler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDStr)
	userRole := middleware.GetRoleFromContext(r.Context())

	taskIDStr := chi.URLParam(r, "id")
	taskID, err := primitive.ObjectIDFromHex(taskIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid task ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	tasksColl := h.db.Collection("tasks")
	var existingTask Task
	if err := tasksColl.FindOne(ctx, bson.M{"_id": taskID}).Decode(&existingTask); err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Task not found"})
		return
	}

	isLeaderOrAdmin, isMember, err := h.checkProjectAccess(ctx, existingTask.ProjectID, userID, userRole)
	if err != nil || !isMember {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: not a project member"})
		return
	}

	var req UpdateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request payload"})
		return
	}

	updateFields := bson.M{
		"updatedAt": time.Now(),
	}

	// Members can update task status and priority; Leaders/Admins can update all fields including assignment and title
	if isLeaderOrAdmin {
		if strings.TrimSpace(req.Title) != "" {
			updateFields["title"] = strings.TrimSpace(req.Title)
		}
		if req.Description != "" {
			updateFields["description"] = strings.TrimSpace(req.Description)
		}
		if req.AssignedTo != "" {
			if obj, err := primitive.ObjectIDFromHex(strings.TrimSpace(req.AssignedTo)); err == nil {
				updateFields["assignedTo"] = obj
			}
		}
		if req.Deadline != "" {
			if parsed, err := time.Parse(time.RFC3339, req.Deadline); err == nil {
				updateFields["deadline"] = parsed
			} else if parsedDate, errDate := time.Parse("2006-01-02", req.Deadline); errDate == nil {
				updateFields["deadline"] = parsedDate
			}
		}
	}

	if req.Status != "" {
		updateFields["status"] = req.Status
	}
	if req.Priority != "" {
		updateFields["priority"] = req.Priority
	}

	_, err = tasksColl.UpdateOne(ctx, bson.M{"_id": taskID}, bson.M{"$set": updateFields})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to update task"})
		return
	}

	var updatedTask Task
	_ = tasksColl.FindOne(ctx, bson.M{"_id": taskID}).Decode(&updatedTask)

	assigneeResp := h.fetchAssignee(ctx, updatedTask.AssignedTo)
	json.NewEncoder(w).Encode(updatedTask.ToResponse(assigneeResp))
}

func (h *Handler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := middleware.GetUserIDFromContext(r.Context())
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDStr)
	userRole := middleware.GetRoleFromContext(r.Context())

	taskIDStr := chi.URLParam(r, "id")
	taskID, err := primitive.ObjectIDFromHex(taskIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid task ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	tasksColl := h.db.Collection("tasks")
	var existingTask Task
	if err := tasksColl.FindOne(ctx, bson.M{"_id": taskID}).Decode(&existingTask); err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Task not found"})
		return
	}

	isLeaderOrAdmin, _, err := h.checkProjectAccess(ctx, existingTask.ProjectID, userID, userRole)
	if err != nil || !isLeaderOrAdmin {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Forbidden: only project leader or admin can delete tasks"})
		return
	}

	_, err = tasksColl.DeleteOne(ctx, bson.M{"_id": taskID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to delete task"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Task deleted successfully",
		"id":      taskIDStr,
	})
}
