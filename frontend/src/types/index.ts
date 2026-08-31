export type UserRole = 'ADMIN' | 'LEADER' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  leaderId: string;
  leader?: User;
  progress: number;
  taskCount: number;
  completedTasks: number;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  status?: ProjectStatus;
  deadline?: string;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  deadline?: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo?: string;
  assignee?: User;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
}

export type ProjectMemberRole = 'LEADER' | 'MEMBER';

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectMemberRole;
  joinedAt: string;
  user?: User;
}

export interface AddMemberPayload {
  email: string;
}

export interface ApiError {
  error: string;
}
