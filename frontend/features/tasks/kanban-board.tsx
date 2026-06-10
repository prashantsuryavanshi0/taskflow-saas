"use client";

import { DndContext, type DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Task, TaskStatus } from "@/types";
import { Card } from "@/components/ui/card";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];
const statusIds = new Set<TaskStatus>(columns.map((column) => column.id));

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id, data: { task } });
  return (
    <motion.div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes} whileHover={{ scale: 1.02 }} className="cursor-grab rounded-xl border border-white/10 bg-slate-950/80 p-4 shadow-lg">
      <h3 className="font-medium">{task.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-400">{task.description || "No description"}</p>
      <div className="mt-4 flex items-center justify-between text-xs"><span className="rounded-full bg-emerald-300/15 px-2 py-1 text-emerald-200">{task.priority}</span><span className="text-slate-500">{task.assignee?.name || "Unassigned"}</span></div>
    </motion.div>
  );
}

function Column({ id, title, tasks }: { id: TaskStatus; title: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Card className={`min-h-[520px] ${isOver ? "ring-2 ring-emerald-300/50" : ""}`}>
      <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><span className="rounded-full bg-white/10 px-2 py-1 text-xs">{tasks.length}</span></div>
      <div ref={setNodeRef} className="space-y-3">
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </Card>
  );
}

export function KanbanBoard() {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks", "board"], queryFn: () => api.tasks() });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => api.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); queryClient.invalidateQueries({ queryKey: ["stats"] }); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update task"),
  });
  const onDragEnd = (event: DragEndEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    const target = event.over?.id;
    if (typeof target !== "string" || !statusIds.has(target as TaskStatus)) return;
    const status = target as TaskStatus;
    if (task && task.status !== status) {
      queryClient.setQueryData<Task[]>(["tasks", "board"], (old = []) => old.map((item) => item.id === task.id ? { ...item, status } : item));
      statusMutation.mutate({ id: task.id, status });
    }
  };

  return (
    <section className="space-y-5">
      <div><h1 className="text-3xl font-bold">Kanban Board</h1><p className="text-sm text-slate-400">Drag tasks between workflow stages. Updates are saved instantly.</p></div>
      {isLoading ? <Card>Loading board...</Card> : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-4 lg:grid-cols-3">
            {columns.map((column) => <Column key={column.id} {...column} tasks={tasks.filter((task) => task.status === column.id)} />)}
          </div>
        </DndContext>
      )}
    </section>
  );
}
