"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { setSession } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: "popup"; auto_select?: boolean }) => void;
          prompt: () => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

export function LoginCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleCredential = async ({ credential }: { credential: string }) => {
      setLoading(true);
      try {
        const session = await api.googleAuth(credential);
        setSession(session.access_token, session.user);
        router.replace("/dashboard");
        toast.success("Welcome back");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Google sign-in failed");
      } finally {
        setLoading(false);
      }
    };
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: handleCredential,
        ux_mode: "popup",
        auto_select: false,
      });
      setReady(true);
    };
    document.body.appendChild(script);
    return () => script.remove();
  }, [router]);

  const signIn = () => {
    if (!window.google) return toast.error("Google Identity Services is still loading");
    window.google.accounts.id.prompt();
  };

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-300">
          <Chrome className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold">TaskFlow</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Sign in with Google to manage tasks, assignments, analytics, and team workflow.</p>
        <Button disabled={!ready || loading} onClick={signIn} className="mt-8 w-full">
          <Chrome className="h-4 w-4" /> {loading ? "Signing in..." : "Continue with Google"}
        </Button>
      </motion.section>
    </main>
  );
}
