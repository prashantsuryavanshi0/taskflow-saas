"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Clock3, ListChecks, Timer } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";

const colors = ["#34d399", "#38bdf8", "#f59e0b", "#fb7185"];

export function DashboardView() {
  const { data, isLoading } = useQuery({ queryKey: ["stats"], queryFn: api.stats });
  if (isLoading || !data) return <Card>Loading dashboard...</Card>;

  const statCards = [
    { label: "Total Tasks", value: data.total, icon: ListChecks },
    { label: "Pending", value: data.pending, icon: Clock3 },
    { label: "In Progress", value: data.in_progress, icon: Timer },
    { label: "Completed", value: data.completed, icon: CheckCircle2 },
  ];
  const statusData = Object.entries(data.by_status).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  const priorityData = Object.entries(data.by_priority).map(([name, value]) => ({ name, value }));

  return (
    <section className="space-y-6">
      <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-sm text-slate-400">Team throughput, priorities, and latest activity.</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card><item.icon className="mb-5 h-5 w-5 text-emerald-300" /><p className="text-sm text-slate-400">{item.label}</p><p className="mt-2 text-3xl font-bold">{item.value}</p></Card>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-80"><h2 className="mb-4 font-semibold">Tasks by Status</h2><ResponsiveContainer width="100%" height="85%"><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" allowDecimals={false} /><Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155" }} /><Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#34d399" /></BarChart></ResponsiveContainer></Card>
        <Card className="h-80"><h2 className="mb-4 font-semibold">Tasks by Priority</h2><ResponsiveContainer width="100%" height="85%"><PieChart><Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={100} label>{priorityData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155" }} /></PieChart></ResponsiveContainer></Card>
      </div>
      <Card>
        <h2 className="mb-4 font-semibold">Recent Activity</h2>
        <div className="space-y-3">
          {data.recent_activity.map((task) => <div key={task.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm"><span>{task.title}</span><span className="text-slate-400">{task.status.replace("_", " ")}</span></div>)}
          {data.recent_activity.length === 0 && <p className="text-sm text-slate-400">No recent activity yet.</p>}
        </div>
      </Card>
    </section>
  );
}
