"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wishlistItemSchema, type WishlistItemInput } from "@/lib/validations/wishlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WishlistItemFormProps {
  familyId: string;
  initialData?: any;
  itemId?: string;
}

export function WishlistItemForm({ familyId, initialData, itemId }: WishlistItemFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [priority, setPriority] = useState<string>(initialData?.priority || "MEDIUM");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WishlistItemInput>({
    resolver: zodResolver(wishlistItemSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      url: initialData?.url || "",
      price: initialData?.price || null,
      imageUrl: initialData?.imageUrl || "",
      priority: (initialData?.priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
      category: initialData?.category || "",
    },
  });

  const onSubmit = async (data: WishlistItemInput) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const endpoint = itemId ? `/api/wishlist/${itemId}` : "/api/wishlist";
      const method = itemId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          familyId,
          priority,
          price: data.price ? Number(data.price) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to save item");
        return;
      }

      setSuccess(itemId ? "Item updated successfully" : "Item added successfully");
      setTimeout(() => {
        router.push(`/wishlist?familyId=${familyId}`);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Add information about the item you want</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Item name"
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Why do you want this? Any specific details..."
              rows={3}
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                {...register("url")}
                disabled={isLoading}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://..."
                {...register("imageUrl")}
                disabled={isLoading}
              />
              {errors.imageUrl && (
                <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Books, Electronics"
                {...register("category")}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : itemId ? "Update Item" : "Add Item"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
