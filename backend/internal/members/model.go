package members

import (
	"time"

	"devforge/backend/internal/users"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProjectMemberRole string

const (
	MemberRoleLeader ProjectMemberRole = "LEADER"
	MemberRoleMember ProjectMemberRole = "MEMBER"
)

type ProjectMember struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	ProjectID primitive.ObjectID `bson:"projectId" json:"projectId"`
	Role      ProjectMemberRole  `bson:"role" json:"role"`
	JoinedAt  time.Time          `bson:"joinedAt" json:"joinedAt"`
}

type MemberResponse struct {
	ID        string              `json:"id"`
	UserID    string              `json:"userId"`
	ProjectID string              `json:"projectId"`
	Role      ProjectMemberRole   `json:"role"`
	JoinedAt  time.Time           `json:"joinedAt"`
	User      *users.UserResponse `json:"user,omitempty"`
}

type AddMemberRequest struct {
	Email string `json:"email"`
}

func (m *ProjectMember) ToResponse(userResp *users.UserResponse) MemberResponse {
	return MemberResponse{
		ID:        m.ID.Hex(),
		UserID:    m.UserID.Hex(),
		ProjectID: m.ProjectID.Hex(),
		Role:      m.Role,
		JoinedAt:  m.JoinedAt,
		User:      userResp,
	}
}
