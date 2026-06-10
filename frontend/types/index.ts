export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  created_at: string;
};

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  created_by: string;
  assigned_to?: string | null;
  creator?: User | null;
  assignee?: User | null;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  recent_activity: Task[];
};
