import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Shield, Sun, User } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/password", label: "Password" },
  { to: "/units", label: "Units" },
  { to: "/bmi", label: "BMI" },
  { to: "/interest", label: "Interest" },
  { to: "/wordcount", label: "Word Count" },
] as const;

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { user, displayName, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/auth" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground shadow-[var(--shadow-soft)] transition-transform group-hover:scale-105" style={{ background: "var(--gradient-brand)" }}>
            <BrandLogo className="h-5 w-5" />
          </span>
          <span className="font-display text-base sm:text-lg font-bold tracking-tight">
            AFRIYIE <span className="text-primary">TOOLS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              activeProps={{ className: "px-3 py-1.5 rounded-md text-sm font-medium text-foreground bg-muted" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-2 pl-2 pr-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-primary-foreground text-xs font-bold" style={{ background: "var(--gradient-brand)" }}>
                    {(displayName || user.email || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                    {displayName || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{displayName || "Account"}</span>
                  <span className="text-xs text-muted-foreground font-normal truncate">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Shield className="h-4 w-4 mr-2" /> Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">
                <User className="h-4 w-4 mr-1.5" /> Sign in
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground whitespace-nowrap hover:text-foreground hover:bg-muted"
            activeProps={{ className: "px-3 py-1.5 rounded-md text-xs font-medium text-foreground bg-muted whitespace-nowrap" }}
            activeOptions={{ exact: l.to === "/" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
