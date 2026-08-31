package admin

import (
	"devforge/backend/internal/users"
)

type PlatformStats struct {
	TotalUsers     int64 `json:"totalUsers"`
	TotalProjects  int64 `json:"totalProjects"`
	TotalTasks     int64 `json:"totalTasks"`
	CompletedTasks int64 `json:"completedTasks"`
	ActiveProjects int64 `json:"activeProjects"`
}

type UpdateRoleRequest struct {
	Role users.Role `json:"role"`
}
