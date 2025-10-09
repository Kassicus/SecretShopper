"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/family", label: "Family", icon: Users },
  { href: "/wishlist", label: "My Wishlist", icon: Heart },
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-card border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">Secret Shopper</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="hover:bg-white/5"
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
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Using theme variables */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-[240px] transition-transform duration-300 ease-in-out lg:translate-x-0 bg-card",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="px-3 py-4 mb-4">
            <h1 className="text-lg font-semibold text-foreground">
              Secret Shopper
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium group",
                    isActive
                      ? "text-primary-foreground bg-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="pt-4 mt-4 space-y-1 border-t border-border">
            {userName && (
              <div className="px-3 py-2 mb-2">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm text-foreground font-medium truncate mt-0.5">{userName}</p>
              </div>
            )}
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
