"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["stats"], queryFn: api.stats });
  if (!user) return null;
  return (
    <section className="space-y-6">
      <div><h1 className="text-3xl font-bold">Profile</h1><p className="text-sm text-slate-400">Your account and task statistics.</p></div>
      <Card className="flex flex-col gap-5 md:flex-row md:items-center">
        {user.avatar && <Image src={user.avatar} alt={user.name} width={88} height={88} className="rounded-2xl" />}
        <div><h2 className="text-2xl font-semibold">{user.name}</h2><p className="text-slate-400">{user.email}</p></div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-slate-400">Total tasks</p><p className="mt-2 text-3xl font-bold">{data?.total ?? 0}</p></Card>
        <Card><p className="text-sm text-slate-400">In progress</p><p className="mt-2 text-3xl font-bold">{data?.in_progress ?? 0}</p></Card>
        <Card><p className="text-sm text-slate-400">Completed</p><p className="mt-2 text-3xl font-bold">{data?.completed ?? 0}</p></Card>
      </div>
    </section>
  );
}
