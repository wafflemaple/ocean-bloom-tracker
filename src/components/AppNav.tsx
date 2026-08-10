import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, CalendarDays, Home, LineChart, PenLine, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/log", label: "Log", icon: PenLine },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/insights", label: "Insights", icon: LineChart },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/profile", label: "You", icon: UserRound },
] as const;

export function AppNav() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/home" className="flex items-center gap-2">
            <span className="glow h-6 w-6 rounded-full bg-[image:var(--gradient-tide)]" />
            <span className="font-display text-2xl tracking-tight">Tidal</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors",
                  pathname.startsWith(to)
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <button
            onClick={signOut}
            className="ml-auto rounded-full border border-border px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground md:ml-2"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] transition-colors",
                pathname.startsWith(to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
