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
    <Card className={item.purchased && isClaimedByMe ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {item.title}
              {item.purchased && isClaimedByMe && (
                <Badge variant="outline" className="text-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Purchased
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {!isOwner && `${item.user.name || item.user.email}'s wishlist`}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Badge variant={getPriorityColor(item.priority)}>
              {item.priority}
            </Badge>
            {isClaimedByMe && !item.purchased && (
              <Badge variant="outline" className="text-blue-600">
                <Gift className="mr-1 h-3 w-3" />
                Claimed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {(item.description || item.imageUrl || item.price || item.category) && (
        <CardContent className="space-y-3">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover rounded-md"
            />
          )}
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            {item.price && (
              <span className="font-semibold">${Number(item.price).toFixed(2)}</span>
            )}
            {item.category && <Badge variant="outline">{item.category}</Badge>}
          </div>
        </CardContent>
      )}

      <CardFooter className="flex gap-2">
        {isOwner ? (
          <>
            <Link href={`/wishlist/edit/${item.id}?familyId=${familyId}`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
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
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Mark Purchased
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnclaim}
                      disabled={isClaiming}
                    >
                      Unclaim
                    </Button>
                  </>
                )}
              </>
            ) : !isClaimed ? (
              <Button size="sm" onClick={handleClaim} disabled={isClaiming}>
                <Gift className="mr-2 h-4 w-4" />
                Claim Item
              </Button>
            ) : (
              <Badge variant="outline">Already claimed by someone else</Badge>
            )}
          </>
        )}
        {item.url && (
          <Button variant="ghost" size="sm" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
