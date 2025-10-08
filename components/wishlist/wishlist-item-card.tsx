"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExternalLink, Edit, Trash2, Check, ShoppingCart, Gift } from "lucide-react";

interface WishlistItemCardProps {
  item: {
    id: string;
    title: string;
    description?: string | null;
    url?: string | null;
    price?: any;
    imageUrl?: string | null;
    priority: string;
    category?: string | null;
    claimedBy?: string | null;
    claimedAt?: Date | null;
    purchased: boolean;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  currentUserId: string;
  familyId: string;
}

export function WishlistItemCard({ item, currentUserId, familyId }: WishlistItemCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const isOwner = item.user.id === currentUserId;
  const isClaimed = !!item.claimedBy;
  const isClaimedByMe = item.claimedBy === currentUserId;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      const response = await fetch(`/api/wishlist/${item.id}/claim`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error claiming item:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleUnclaim = async () => {
    try {
      setIsClaiming(true);
      const response = await fetch(`/api/wishlist/${item.id}/claim`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error unclaiming item:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleMarkPurchased = async () => {
    try {
      setIsPurchasing(true);
      const response = await fetch(`/api/wishlist/${item.id}/purchase`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error marking as purchased:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${item.purchased && isClaimedByMe ? "opacity-60" : ""}`}>
      {/* Solid accent bar at top */}
      <div className={`h-1 ${
        item.priority === "HIGH"
          ? "bg-destructive"
          : item.priority === "MEDIUM"
          ? "bg-accent"
          : "bg-secondary"
      }`} />

      <CardHeader className="bg-muted/20">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              {item.title}
              {item.purchased && isClaimedByMe && (
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950/30">
                  <Check className="mr-1 h-3 w-3" />
                  Purchased
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {!isOwner && `${item.user.name || item.user.email}'s wishlist`}
            </CardDescription>
          </div>
          <div className="flex gap-1 flex-col sm:flex-row">
            <Badge variant={getPriorityColor(item.priority)} className="shadow-sm">
              {item.priority}
            </Badge>
            {isClaimedByMe && !item.purchased && (
              <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-sm">
                <Gift className="mr-1 h-3 w-3" />
                Claimed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {(item.description || item.imageUrl || item.price || item.category) && (
        <CardContent className="space-y-4 pt-6">
          {item.imageUrl && (
            <div className="relative overflow-hidden rounded-lg border-2 border-accent/20 shadow-md">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          {item.description && (
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-accent">
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            {item.price && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="font-bold text-primary text-base">${Number(item.price).toFixed(2)}</span>
              </div>
            )}
            {item.category && (
              <Badge variant="outline" className="shadow-sm bg-accent/10 border-accent/30">
                {item.category}
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="flex gap-2 bg-muted/20 border-t">
        {isOwner ? (
          <>
            <Link href={`/wishlist/edit/${item.id}?familyId=${familyId}`}>
              <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting} className="shadow-sm hover:shadow-md transition-all">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this
                    wishlist item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <>
            {isClaimedByMe ? (
              <>
                {!item.purchased && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleMarkPurchased}
                      disabled={isPurchasing}
                      className="shadow-sm hover:shadow-md transition-all bg-primary hover:bg-primary/90"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Mark Purchased
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnclaim}
                      disabled={isClaiming}
                      className="shadow-sm hover:shadow-md transition-all"
                    >
                      Unclaim
                    </Button>
                  </>
                )}
              </>
            ) : !isClaimed ? (
              <Button size="sm" onClick={handleClaim} disabled={isClaiming} className="shadow-sm hover:shadow-md transition-all bg-accent hover:bg-accent/90 text-accent-foreground">
                <Gift className="mr-2 h-4 w-4" />
                Claim Item
              </Button>
            ) : (
              <Badge variant="outline" className="bg-muted">Already claimed by someone else</Badge>
            )}
          </>
        )}
        {item.url && (
          <Button variant="ghost" size="sm" asChild className="hover:bg-accent/10 transition-all">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
