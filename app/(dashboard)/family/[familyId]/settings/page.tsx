"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateFamilySchema, type UpdateFamilyInput } from "@/lib/validations/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function FamilySettingsPage() {
  const router = useRouter();
  const params = useParams();
  const familyId = params.familyId as string;

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [family, setFamily] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateFamilyInput>({
    resolver: zodResolver(updateFamilySchema),
  });

  useEffect(() => {
    async function fetchFamily() {
      const response = await fetch(`/api/families/${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setFamily(data.family);
        setValue("name", data.family.name);
      }
    }
    fetchFamily();
  }, [familyId, setValue]);

  const onSubmit = async (data: UpdateFamilyInput) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/families/${familyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to update family");
        return;
      }

      setSuccess("Family updated successfully");
      setTimeout(() => {
        router.push(`/family/${familyId}`);
      }, 1000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this family? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      const response = await fetch(`/api/families/${familyId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to delete family");
        return;
      }

      router.push("/family");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!family) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/family/${familyId}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to family
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Family Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your family information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Family Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this family and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete a family, there is no going back. This will remove all
              members, profiles, wishlists, and gift groups associated with this family.
            </p>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Family"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
