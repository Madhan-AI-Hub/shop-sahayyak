import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getSupabase, signOut } from "@/services/finance";
import { APP_TITLE } from "@/config/constants";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/income", label: "Income" },
  { to: "/expense", label: "Expense" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = await getSupabase();
        supabase.auth.getUser().then(({ data }: any) => setEmail(data.user?.email ?? null));
        const { data: sub }: any = supabase.auth.onAuthStateChange((_event: any, session: any) => {
          setEmail(session?.user?.email ?? null);
        });
        return () => sub?.subscription?.unsubscribe?.();
      } catch {
        setEmail(null);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">
            {APP_TITLE}
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map(n => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`
              }>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {email ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">{email}</span>
                <Button variant="subtle" onClick={() => signOut()}>Logout</Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost"><Link to="/login">Login</Link></Button>
                <Button asChild variant="hero" size="pill"><Link to="/signup">Create account</Link></Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
      <footer className="border-t">
        <div className="container py-6 text-xs text-muted-foreground">© {new Date().getFullYear()} {APP_TITLE}</div>
      </footer>
    </div>
  );
}
