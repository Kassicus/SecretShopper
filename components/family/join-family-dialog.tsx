"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinFamilySchema, type JoinFamilyInput } from "@/lib/validations/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus } from "lucide-react";

export function JoinFamilyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinFamilyInput>({
    resolver: zodResolver(joinFamilySchema),
  });

  const onSubmit = async (data: JoinFamilyInput) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/families/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to join family");
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Join Family
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Join a family</DialogTitle>
          <DialogDescription>
            Enter the invite code provided by a family admin to join.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 px-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="inviteCode" className="text-base">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="XXXX-XXXX"
                className="font-mono uppercase h-11"
                {...register("inviteCode")}
                disabled={isLoading}
                maxLength={9}
              />
              {errors.inviteCode && (
                <p className="text-sm text-destructive font-medium">
                  {errors.inviteCode.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="min-w-[140px]">
              {isLoading ? "Joining..." : "Join Family"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
