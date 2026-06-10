import type { DashboardStats, Task, TaskStatus, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type TaskPayload = {
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  due_date?: string | null;
  assigned_to?: string | null;
};

function token() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("taskflow_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(typeof body.error === "string" ? body.error : JSON.stringify(body.error));
  }
  return response.json();
}

export const api = {
  googleAuth: (credential: string) =>
    request<{ access_token: string; user: User }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  users: () => request<User[]>("/users"),
  tasks: (query = "") => request<Task[]>(`/tasks${query}`),
  createTask: (payload: TaskPayload) => request<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id: string, payload: Partial<TaskPayload>) =>
    request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTask: (id: string) => request<{ deleted: boolean }>(`/tasks/${id}`, { method: "DELETE" }),
  updateStatus: (id: string, status: TaskStatus) =>
    request<Task>(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  stats: () => request<DashboardStats>("/dashboard/stats"),
};
