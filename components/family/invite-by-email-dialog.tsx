"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Mail, CheckCircle2 } from "lucide-react";

const inviteEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type InviteEmailInput = z.infer<typeof inviteEmailSchema>;

interface InviteByEmailDialogProps {
  familyId: string;
  familyName: string;
}

export function InviteByEmailDialog({ familyId, familyName }: InviteByEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteEmailInput>({
    resolver: zodResolver(inviteEmailSchema),
  });

  const onSubmit = async (data: InviteEmailInput) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess(false);

      const response = await fetch(`/api/families/${familyId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to send invitation");
        return;
      }

      setSuccess(true);
      reset();

      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
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
          <Mail className="mr-2 h-4 w-4" />
          Invite by Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Invite by email</DialogTitle>
          <DialogDescription>
            Send an invitation to join {familyName} via email. They'll receive a link to sign up with your invite code.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 px-6 py-6">
            {success ? (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  Invitation sent successfully!
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    {...register("email")}
                    disabled={isLoading}
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="border-destructive/50">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>

          {!success && (
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
