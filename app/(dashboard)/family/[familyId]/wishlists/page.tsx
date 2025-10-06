import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function FamilyWishlistsPage({
  params,
  searchParams,
}: {
  params: { familyId: string };
  searchParams: { userId?: string; priority?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const family = await prisma.family.findUnique({
    where: { id: params.familyId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!family) {
    notFound();
  }

  // Check if user is a member
  const isMember = family.members.some(
    (member) => member.user.id === session.user.id
  );

  if (!isMember) {
    redirect("/family");
  }

  const selectedUserId = searchParams.userId;
  const selectedPriority = searchParams.priority;

  // Build query
  const where: any = {
    familyId: params.familyId,
  };

  if (selectedUserId) {
    where.userId = selectedUserId;
  } else {
    // Exclude current user's items if no specific user is selected
    where.userId = { not: session.user.id };
  }

  if (selectedPriority) {
    where.priority = selectedPriority;
  }

  const items = await prisma.wishlistItem.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      claimer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Filter claimed items for display
  const filteredItems = items.map((item) => {
    if (item.userId === session.user.id) {
      // Owner cannot see claimed status
      return {
        ...item,
        claimedBy: null,
        claimedAt: null,
        claimer: null,
        purchased: false,
      };
    }
    return item;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/family/${params.familyId}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to family
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Family Wishlists</h1>
        <p className="text-muted-foreground">{family.name}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-64">
          <Select
            value={selectedUserId || "all"}
            onValueChange={(value) => {
              const url = new URL(window.location.href);
              if (value === "all") {
                url.searchParams.delete("userId");
              } else {
                url.searchParams.set("userId", value);
              }
              window.location.href = url.toString();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All members</SelectItem>
              {family.members
                .filter((m) => m.user.id !== session.user.id)
                .map((member) => (
                  <SelectItem key={member.user.id} value={member.user.id}>
                    {member.user.name || member.user.email}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select
            value={selectedPriority || "all"}
            onValueChange={(value) => {
              const url = new URL(window.location.href);
              if (value === "all") {
                url.searchParams.delete("priority");
              } else {
                url.searchParams.set("priority", value);
              }
              window.location.href = url.toString();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">No items found</h3>
          <p className="text-sm text-muted-foreground">
            {selectedUserId || selectedPriority
              ? "Try adjusting your filters."
              : "Family members haven't added any wishlist items yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              currentUserId={session.user.id}
              familyId={params.familyId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
