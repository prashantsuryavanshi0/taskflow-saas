"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api, type TaskPayload } from "@/services/api";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const schema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in_progress", "completed"]),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
});

export function TaskForm({ task, onSubmit, onCancel }: { task?: Task; onSubmit: (values: TaskPayload) => void; onCancel: () => void }) {
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: api.users });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      status: task?.status || "todo",
      due_date: task?.due_date ? task.due_date.slice(0, 16) : "",
      assigned_to: task?.assigned_to || "",
    },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        onSubmit({
          ...values,
          due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
          assigned_to: values.assigned_to || null,
        }),
      )}
    >
      <Input placeholder="Task title" {...form.register("title")} />
      <textarea className="min-h-28 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" placeholder="Description" {...form.register("description")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select {...form.register("priority")}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
        </Select>
        <Select {...form.register("status")}>
          <option value="todo">Todo</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="datetime-local" {...form.register("due_date")} />
        <Select {...form.register("assigned_to")}>
          <option value="">Unassigned</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </Select>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" onClick={onCancel} className="bg-white/10 text-white hover:bg-white/15">Cancel</Button>
        <Button type="submit">Save task</Button>
      </div>
    </form>
  );
}
