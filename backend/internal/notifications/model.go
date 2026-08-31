package notifications

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NotificationType string

const (
	TypeMemberAdded   NotificationType = "MEMBER_ADDED"
	TypeTaskAssigned  NotificationType = "TASK_ASSIGNED"
	TypeTaskCompleted NotificationType = "TASK_COMPLETED"
	TypeChatMessage   NotificationType = "CHAT_MESSAGE"
	TypeSystem        NotificationType = "SYSTEM"
)

type Notification struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	Type      NotificationType   `bson:"type" json:"type"`
	Message   string             `bson:"message" json:"message"`
	Read      bool               `bson:"read" json:"read"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type NotificationResponse struct {
	ID        string           `json:"id"`
	UserID    string           `json:"userId"`
	Type      NotificationType `json:"type"`
	Message   string           `json:"message"`
	Read      bool             `json:"read"`
	CreatedAt time.Time        `json:"createdAt"`
}

func (n *Notification) ToResponse() NotificationResponse {
	return NotificationResponse{
		ID:        n.ID.Hex(),
		UserID:    n.UserID.Hex(),
		Type:      n.Type,
		Message:   n.Message,
		Read:      n.Read,
		CreatedAt: n.CreatedAt,
	}
}
