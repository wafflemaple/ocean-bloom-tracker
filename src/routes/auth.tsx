import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import coveAsset from "@/assets/ocean-cove.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Tidal" },
      {
        name: "description",
        content: "Sign in or create your private Tidal account to track perimenopause symptoms.",
      },
      { property: "og:title", content: "Sign in · Tidal" },
      { property: "og:description", content: "Your private perimenopause tracker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  displayName: z.string().trim().max(60).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/home", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, displayName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: parsed.data.displayName || null },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSentConfirmation(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home", replace: true });
  }

  async function forgotPassword() {
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your email address first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your inbox.");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <img
        src={coveAsset.url}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[image:linear-gradient(180deg,oklch(0.16_0.05_245/72%)_0%,oklch(0.16_0.05_245/88%)_100%)]" />

      <div className="glass rise glow relative w-full max-w-md rounded-4xl p-8 sm:p-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-[image:var(--gradient-tide)]" />
          <span className="font-display text-xl">Tidal</span>
        </Link>

        <h1 className="mt-7 font-display text-4xl leading-tight">
          {mode === "signin" ? "Welcome back." : "Begin your record."}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Your tracking stays private to you."
            : "Set an email and password — everything you log is yours alone."}
        </p>

        {sentConfirmation ? (
          <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Open it to finish creating your
            account, then come back and sign in.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={60}
                  placeholder="What should we call you?"
                  className="mt-1.5 w-full rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
                />
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={72}
                placeholder="At least 8 characters"
                className="mt-1.5 w-full rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow flex w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-tide)] py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={google}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background/40 py-3.5 text-sm transition-colors hover:bg-secondary/50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.63 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.94S8.78 6.3 12 6.3c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 3.74 14.55 2.9 12 2.9 6.98 2.9 2.9 6.98 2.9 12S6.98 21.1 12 21.1c5.78 0 9.6-4.06 9.6-9.78 0-.66-.08-1.16-.25-1.62Z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setSentConfirmation(false);
            }}
            className="text-primary transition-opacity hover:opacity-80"
          >
            {mode === "signin" ? "Create an account" : "I already have an account"}
          </button>
          {mode === "signin" && (
            <button onClick={forgotPassword} className="text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
