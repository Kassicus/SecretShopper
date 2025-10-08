"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGiftGroupSchema, type CreateGiftGroupInput } from "@/lib/validations/gift-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus } from "lucide-react";

interface CreateGroupDialogProps {
  familyId: string;
  familyMembers: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  currentUserId: string;
}

export function CreateGroupDialog({ familyId, familyMembers, currentUserId }: CreateGroupDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateGiftGroupInput>({
    resolver: zodResolver(createGiftGroupSchema),
  });

  const onSubmit = async (data: CreateGiftGroupInput) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          familyId,
          memberIds: selectedMembers,
          targetAmount: data.targetAmount ? Number(data.targetAmount) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create group");
        return;
      }

      reset();
      setSelectedMembers([]);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create Gift Group</DialogTitle>
          <DialogDescription>
            Pool resources with family to buy a gift together
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 px-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base">Group Name *</Label>
              <Input
                id="name"
                placeholder="Birthday gift for Mom"
                {...register("name")}
                disabled={isLoading}
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea
                id="description"
                placeholder="What are we buying?"
                {...register("description")}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="occasion" className="text-base">Occasion</Label>
                <Input
                  id="occasion"
                  placeholder="Birthday, Christmas, etc."
                  {...register("occasion")}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="occasionDate" className="text-base">Date</Label>
                <Input
                  id="occasionDate"
                  type="date"
                  {...register("occasionDate")}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="targetAmount" className="text-base">Target Amount ($)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("targetAmount", { valueAsNumber: true })}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Invite Members</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3 bg-muted">
                {familyMembers.filter((m) => m.user.id !== currentUserId).length === 0 ? (
                  <p className="text-sm py-2 text-muted-foreground">
                    No other family members to invite. Add more members to your family first.
                  </p>
                ) : (
                  familyMembers
                    .filter((m) => m.user.id !== currentUserId)
                    .map((member) => (
                      <label
                        key={member.user.id}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded transition-colors hover:bg-accent text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.user.id)}
                          onChange={() => toggleMember(member.user.id)}
                          className="h-4 w-4 rounded"
                        />
                        <span className="text-sm">
                          {member.user.name || member.user.email}
                        </span>
                      </label>
                    ))
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="min-w-[140px]">
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
