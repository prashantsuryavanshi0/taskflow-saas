"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getStoredUser } from "@/store/auth-store";
import type { User } from "@/types";

export function useAuth(redirect = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setReady(true);
    if (redirect && !stored) router.replace("/login");
  }, [redirect, router]);

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  return { user, ready, logout };
}
