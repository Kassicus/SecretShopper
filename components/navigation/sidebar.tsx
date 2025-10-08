"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Gift,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/family", label: "Family", icon: Users },
  { href: "/wishlist", label: "My Wishlist", icon: Gift },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b px-4 py-3 flex items-center justify-between bg-card/95 backdrop-blur-lg shadow-lg border-accent/20">
        <h1 className="text-xl font-bold text-primary">Secret Shopper</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="hover:bg-accent/20"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 border-r transition-transform duration-300 ease-in-out lg:translate-x-0 bg-card/95 backdrop-blur-xl shadow-2xl border-accent/20",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-accent/20 bg-accent/5">
            <div className="mb-3 p-3 rounded-xl bg-accent/10 border border-accent/30 inline-block shadow-md">
              <Gift className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">
              Secret Shopper
            </h1>
            {userName && (
              <p className="text-sm mt-2 text-muted-foreground font-medium">Welcome, <span className="text-foreground">{userName}</span></p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group relative overflow-hidden",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                      : "text-foreground hover:bg-accent/10 hover:shadow-md hover:scale-102"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full" />
                  )}
                  <div className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive
                      ? "bg-primary-foreground/20"
                      : "bg-accent/10 group-hover:bg-accent/20"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="relative z-10">{item.label}</span>
                  {!isActive && (
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme toggle & Sign out */}
          <div className="p-4 border-t border-accent/20 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-all hover:shadow-md group rounded-xl"
              onClick={handleSignOut}
            >
              <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-all mr-2">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
