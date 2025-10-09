import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileView } from "@/components/profile/profile-view";
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function FamilyMemberPage({
  params,
}: {
  params: Promise<{ familyId: string; memberId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { familyId, memberId } = await params;

  // Get family and verify membership
  const family = await prisma.family.findUnique({
    where: { id: familyId },
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

  // Check if current user is a member
  const isMember = family.members.some(
    (member) => member.user.id === session.user.id
  );

  if (!isMember) {
    redirect("/family");
  }

  // Get the specific member being viewed
  const viewedMember = family.members.find((m) => m.id === memberId);

  if (!viewedMember) {
    notFound();
  }

  const isCurrentUser = viewedMember.user.id === session.user.id;

  // Get the member's profile
  const profile = await prisma.profile.findUnique({
    where: {
      userId_familyId: {
        userId: viewedMember.user.id,
        familyId,
      },
    },
  });

  // Get the member's wishlist items
  const rawItems = await prisma.wishlistItem.findMany({
    where: {
      familyId,
      userId: viewedMember.user.id,
    },
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

  // Filter claimed items for display and convert Decimal to number
  const wishlistItems = rawItems.map((item) => {
    const baseItem = {
      ...item,
      price: item.price ? Number(item.price) : null,
    };

    if (isCurrentUser) {
      // Owner cannot see claimed status
      return {
        ...baseItem,
        claimedBy: null,
        claimedAt: null,
        claimer: null,
        purchased: false,
      };
    }
    return baseItem;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/family/${familyId}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to family
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {viewedMember.user.name?.[0] || viewedMember.user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {viewedMember.user.name || viewedMember.user.email}
                {isCurrentUser && (
                  <span className="ml-3 text-lg text-muted-foreground">
                    (You)
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground">{family.name}</p>
            </div>
          </div>
          {isCurrentUser && (
            <Link href={`/profile/edit/${familyId}`}>
              <Button variant="outline">Edit Profile</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Wishlist Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
        </h2>
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">No wishlist items</h3>
            <p className="text-sm text-muted-foreground">
              {isCurrentUser
                ? "You haven't added any wishlist items yet."
                : "This member hasn't added any wishlist items yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                currentUserId={session.user.id}
                familyId={familyId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <ProfileView
          profile={profile || null}
          userName={viewedMember.user.name || undefined}
        />
      </div>
    </div>
  );
}
