package tasks

import (
	"time"

	"devforge/backend/internal/users"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TaskStatus string

const (
	StatusTodo       TaskStatus = "TODO"
	StatusInProgress TaskStatus = "IN_PROGRESS"
	StatusCompleted  TaskStatus = "COMPLETED"
)

type TaskPriority string

const (
	PriorityLow    TaskPriority = "LOW"
	PriorityMedium TaskPriority = "MEDIUM"
	PriorityHigh   TaskPriority = "HIGH"
)

type Task struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	Title       string              `bson:"title" json:"title"`
	Description string              `bson:"description" json:"description"`
	ProjectID   primitive.ObjectID  `bson:"projectId" json:"projectId"`
	AssignedTo  *primitive.ObjectID `bson:"assignedTo,omitempty" json:"assignedTo,omitempty"`
	Status      TaskStatus          `bson:"status" json:"status"`
	Priority    TaskPriority        `bson:"priority" json:"priority"`
	Deadline    time.Time           `bson:"deadline" json:"deadline"`
	CreatedAt   time.Time           `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time           `bson:"updatedAt" json:"updatedAt"`
}

type TaskResponse struct {
	ID          string              `json:"id"`
	Title       string              `json:"title"`
	Description string              `json:"description"`
	ProjectID   string              `json:"projectId"`
	AssignedTo  string              `json:"assignedTo,omitempty"`
	Assignee    *users.UserResponse `json:"assignee,omitempty"`
	Status      TaskStatus          `json:"status"`
	Priority    TaskPriority        `json:"priority"`
	Deadline    time.Time           `json:"deadline"`
	CreatedAt   time.Time           `json:"createdAt"`
	UpdatedAt   time.Time           `json:"updatedAt"`
}

type CreateTaskRequest struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	AssignedTo  string       `json:"assignedTo,omitempty"`
	Status      TaskStatus   `json:"status"`
	Priority    TaskPriority `json:"priority"`
	Deadline    string       `json:"deadline"`
}

type UpdateTaskRequest struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	AssignedTo  string       `json:"assignedTo,omitempty"`
	Status      TaskStatus   `json:"status"`
	Priority    TaskPriority `json:"priority"`
	Deadline    string       `json:"deadline"`
}

func (t *Task) ToResponse(assignee *users.UserResponse) TaskResponse {
	assignedToHex := ""
	if t.AssignedTo != nil && !t.AssignedTo.IsZero() {
		assignedToHex = t.AssignedTo.Hex()
	}

	return TaskResponse{
		ID:          t.ID.Hex(),
		Title:       t.Title,
		Description: t.Description,
		ProjectID:   t.ProjectID.Hex(),
		AssignedTo:  assignedToHex,
		Assignee:    assignee,
		Status:      t.Status,
		Priority:    t.Priority,
		Deadline:    t.Deadline,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}
