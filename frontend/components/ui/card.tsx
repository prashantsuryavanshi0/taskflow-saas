import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div whileHover={{ y: -2 }} className={cn("glass rounded-2xl p-5 shadow-glow", className)}>
      {children}
    </motion.div>
  );
}
