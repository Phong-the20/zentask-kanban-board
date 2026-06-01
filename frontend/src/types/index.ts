export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  email: string;
  fullName: string;
  avatar: string | null;
  provider: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  email: string;
  fullName: string;
  avatar: string | null;
}

export interface Workspace {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  createdAt: string;
}

export interface Board {
  id: number;
  title: string;
  workspaceId: number;
  columnCount: number;
  createdAt: string;
}

export interface TaskColumn {
  id: number;
  name: string;
  positionIndex: number;
  boardId: number;
  taskCount: number;
  doneColumn: boolean;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  deadline: string | null;
  assigneeId: number | null;
  assigneeName: string | null;
  columnId: number;
  positionIndex: number;
  commentCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
}

export interface AttachmentResponse {
  id: number;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface WorkspaceMember {
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface ChartEntry {
  name: string;
  count: number;
}

export interface Analytics {
  totalTasks: number;
  completedPercentage: number;
  activeMembers: number;
  taskColumnData: ChartEntry[];
  priorityData: ChartEntry[];
}

export interface AcceptInviteResponse {
  message: string;
  workspaceName: string;
  workspaceId: number;
}
