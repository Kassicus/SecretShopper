"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-full justify-start"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5 mr-3" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 mr-3" />
          <span>Dark Mode</span>
        </>
      )}
    </Button>
  );
}
