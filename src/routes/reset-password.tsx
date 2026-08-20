import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password · Tidal" },
      { name: "description", content: "Choose a new password for your Tidal account." },
      { property: "og:title", content: "Set a new password · Tidal" },
      { property: "og:description", content: "Choose a new password for your Tidal account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.string().min(8, "At least 8 characters").max(72).safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated.");
      navigate({ to: "/home", replace: true });
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-[image:linear-gradient(180deg,oklch(0.16_0.05_245/78%)_0%,oklch(0.16_0.05_245/92%)_100%)]" />
      <div className="glass rise relative w-full max-w-md rounded-4xl p-8 sm:p-10">
        <h1 className="font-display text-4xl">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ready
            ? "Choose something you'll remember."
            : "Open the reset link from your email to continue."}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            maxLength={72}
            className="w-full rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading || !ready}
            className="glow w-full rounded-2xl bg-[image:var(--gradient-tide)] py-3.5 font-medium text-primary-foreground disabled:opacity-50"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
