"use client";

import type { User } from "@/types";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("taskflow_user");
  return raw ? JSON.parse(raw) : null;
}

export function setSession(token: string, user: User) {
  localStorage.setItem("taskflow_token", token);
  localStorage.setItem("taskflow_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("taskflow_token");
  localStorage.removeItem("taskflow_user");
}
