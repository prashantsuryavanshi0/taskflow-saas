"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CheckSquare, KanbanSquare, LogOut, UserCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/tasks/board", label: "Board", icon: KanbanSquare },
  { href: "/assigned", label: "Assigned", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, ready, logout } = useAuth(pathname !== "/login");
  if (!ready) return <div className="p-8 text-sm text-slate-300">Loading workspace...</div>;
  if (pathname === "/login") return <>{children}</>;
  if (!user) return null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="glass sticky top-0 z-20 flex h-auto items-center justify-between gap-4 border-x-0 border-t-0 p-4 lg:h-screen lg:flex-col lg:items-stretch">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">TaskFlow</Link>
        <nav className="flex flex-1 gap-2 overflow-x-auto lg:flex-col">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/8", active && "bg-white/10 text-white")}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-white/8">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 md:p-8">
        {children}
      </motion.main>
    </div>
  );
}
