import * as React from "react";
import { cn } from "@/lib/utils";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("h-10 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none ring-emerald-300/30 focus:ring-4", props.className)} />;
}
