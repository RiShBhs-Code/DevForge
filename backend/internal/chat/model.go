package chat

import (
	"time"

	"devforge/backend/internal/users"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProjectID primitive.ObjectID `bson:"projectId" json:"projectId"`
	SenderID  primitive.ObjectID `bson:"senderId" json:"senderId"`
	Content   string             `bson:"content" json:"content"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type MessageResponse struct {
	ID        string              `json:"id"`
	ProjectID string              `json:"projectId"`
	SenderID  string              `json:"senderId"`
	Sender    *users.UserResponse `json:"sender,omitempty"`
	Content   string              `json:"content"`
	CreatedAt time.Time           `json:"createdAt"`
}

type SendMessagePayload struct {
	Content string `json:"content"`
}

type WSMessage struct {
	Type    string      `json:"type"` // e.g. "message:new", "notification:new"
	Payload interface{} `json:"payload"`
}

func (m *Message) ToResponse(sender *users.UserResponse) MessageResponse {
	return MessageResponse{
		ID:        m.ID.Hex(),
		ProjectID: m.ProjectID.Hex(),
		SenderID:  m.SenderID.Hex(),
		Sender:    sender,
		Content:   m.Content,
		CreatedAt: m.CreatedAt,
	}
}
