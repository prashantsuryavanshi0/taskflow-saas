import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none ring-emerald-300/30 transition focus:ring-4", props.className)} />;
}
