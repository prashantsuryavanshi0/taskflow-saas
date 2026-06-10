"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, type TaskPayload } from "@/services/api";
import type { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TaskForm } from "./task-form";

export function TasksView({ assignedOnly = false }: { assignedOnly?: boolean }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("updated_at");
  const [editing, setEditing] = useState<Task | undefined>();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (assignedOnly) params.set("assigned", "me");
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("sort", sort);
    return `?${params.toString()}`;
  }, [assignedOnly, search, status, sort]);
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks", query], queryFn: () => api.tasks(query) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });
  const create = useMutation({ mutationFn: api.createTask, onSuccess: () => { invalidate(); setOpen(false); toast.success("Task created"); } });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskPayload> }) => api.updateTask(id, payload), onSuccess: () => { invalidate(); setOpen(false); setEditing(undefined); toast.success("Task updated"); } });
  const remove = useMutation({ mutationFn: api.deleteTask, onSuccess: () => { invalidate(); toast.success("Task deleted"); } });

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-3xl font-bold">{assignedOnly ? "Assigned Tasks" : "Tasks"}</h1><p className="text-sm text-slate-400">Search, filter, sort, create, edit, and delete work items.</p></div>
        {!assignedOnly && <Button onClick={() => { setEditing(undefined); setOpen(true); }}><Plus className="h-4 w-4" /> New task</Button>}
      </div>
      <Card className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><Input className="pl-9" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="todo">Todo</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}><option value="updated_at">Recently updated</option><option value="due_date">Due date</option></Select>
      </Card>
      <div className="grid gap-4">
        {isLoading && <Card>Loading tasks...</Card>}
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{task.title}</h3><span className="rounded-full bg-white/10 px-2 py-1 text-xs">{task.status.replace("_", " ")}</span><span className="rounded-full bg-emerald-300/15 px-2 py-1 text-xs text-emerald-200">{task.priority}</span></div>
                  <p className="mt-2 text-sm text-slate-400">{task.description || "No description"}</p>
                  <p className="mt-2 text-xs text-slate-500">Assigned to {task.assignee?.name || "nobody"}</p>
                </div>
                {!assignedOnly && <div className="flex gap-2"><Button className="bg-white/10 text-white hover:bg-white/15" onClick={() => { setEditing(task); setOpen(true); }}><Edit className="h-4 w-4" /></Button><Button className="bg-rose-400 text-slate-950 hover:bg-rose-300" onClick={() => remove.mutate(task.id)}><Trash2 className="h-4 w-4" /></Button></div>}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {!isLoading && tasks.length === 0 && <Card className="text-center text-slate-400">No tasks found.</Card>}
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70" />
          <Dialog.Content className="glass fixed left-1/2 top-1/2 w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6">
            <Dialog.Title className="mb-4 text-xl font-semibold">{editing ? "Edit task" : "Create task"}</Dialog.Title>
            <TaskForm task={editing} onCancel={() => setOpen(false)} onSubmit={(payload) => editing ? update.mutate({ id: editing.id, payload }) : create.mutate(payload)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
