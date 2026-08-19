package projects

import (
	"time"

	"devforge/backend/internal/users"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProjectStatus string

const (
	StatusPlanning  ProjectStatus = "PLANNING"
	StatusActive    ProjectStatus = "ACTIVE"
	StatusCompleted ProjectStatus = "COMPLETED"
	StatusArchived  ProjectStatus = "ARCHIVED"
)

type Project struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Status      ProjectStatus      `bson:"status" json:"status"`
	Deadline    time.Time          `bson:"deadline" json:"deadline"`
	LeaderID    primitive.ObjectID `bson:"leaderId" json:"leaderId"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type ProjectResponse struct {
	ID             string             `json:"id"`
	Title          string             `json:"title"`
	Description    string             `json:"description"`
	Status         ProjectStatus      `json:"status"`
	Deadline       time.Time          `json:"deadline"`
	LeaderID       string             `json:"leaderId"`
	Leader         *users.UserResponse `json:"leader,omitempty"`
	Progress       int                `json:"progress"`
	TaskCount      int                `json:"taskCount"`
	CompletedTasks int                `json:"completedTasks"`
	MemberCount    int                `json:"memberCount"`
	CreatedAt      time.Time          `json:"createdAt"`
	UpdatedAt      time.Time          `json:"updatedAt"`
}

type CreateProjectRequest struct {
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Status      ProjectStatus `json:"status"`
	Deadline    string        `json:"deadline"`
}

type UpdateProjectRequest struct {
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Status      ProjectStatus `json:"status"`
	Deadline    string        `json:"deadline"`
}

func (p *Project) ToResponse(leader *users.UserResponse, taskCount, completedTasks, memberCount int) ProjectResponse {
	progress := 0
	if taskCount > 0 {
		progress = (completedTasks * 100) / taskCount
	}

	return ProjectResponse{
		ID:             p.ID.Hex(),
		Title:          p.Title,
		Description:    p.Description,
		Status:         p.Status,
		Deadline:       p.Deadline,
		LeaderID:       p.LeaderID.Hex(),
		Leader:         leader,
		Progress:       progress,
		TaskCount:      taskCount,
		CompletedTasks: completedTasks,
		MemberCount:    memberCount,
		CreatedAt:      p.CreatedAt,
		UpdatedAt:      p.UpdatedAt,
	}
}
