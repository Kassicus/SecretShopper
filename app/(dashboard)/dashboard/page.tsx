import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { DashboardFamilyCard } from "@/components/dashboard/dashboard-family-card";
import { DashboardWishlistCard } from "@/components/dashboard/dashboard-wishlist-card";
import { DashboardGroupCard } from "@/components/dashboard/dashboard-group-card";
import { EmptyStateCard } from "@/components/dashboard/empty-state-card";
import { Users, Heart, Gift } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user's families sorted by member count (top 2)
  const families = await prisma.family.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      members: {
        _count: "desc",
      },
    },
    take: 2,
  });

  // Fetch user's wishlist items across all families (4-6 items)
  const rawWishlistItems = await prisma.wishlistItem.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      family: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
    take: 6,
  });

  // Convert Decimal to number for client components
  const wishlistItems = rawWishlistItems.map((item) => ({
    ...item,
    price: item.price ? Number(item.price) : null,
  }));

  // Fetch user's gift groups with latest messages (2-4 groups)
  const giftGroups = await prisma.giftGroup.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      members: {
        where: {
          userId: session.user.id,
        },
        select: {
          lastReadAt: true,
        },
      },
      messages: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // Get last 10 to calculate unread and show previews
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 4,
  });

  // Process groups to calculate unread counts and get recent messages
  const processedGroups = giftGroups.map((group) => {
    const userMember = group.members[0];
    const lastReadAt = userMember?.lastReadAt;

    // Calculate unread messages
    const unreadCount = lastReadAt
      ? group.messages.filter(
          (msg) => new Date(msg.createdAt) > new Date(lastReadAt)
        ).length
      : group.messages.length;

    // Get most recent messages (already sorted desc, so reverse for display)
    const recentMessages = group.messages.slice(0, 2).reverse();

    return {
      id: group.id,
      name: group.name,
      occasion: group.occasion,
      memberCount: group._count.members,
      targetAmount: group.targetAmount ? Number(group.targetAmount) : null,
      currentAmount: Number(group.currentAmount),
      recentMessages,
      unreadCount,
    };
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-12 rounded-2xl bg-accent/10 p-8 border border-accent/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back,{" "}
              <span className="font-semibold text-foreground">
                {session.user.name || session.user.email}
              </span>
              !
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              className="shadow-md hover:shadow-lg transition-all"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        {/* Families Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Your Families
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {families.length > 0 ? (
              families.map((family) => (
                <DashboardFamilyCard
                  key={family.id}
                  familyId={family.id}
                  familyName={family.name}
                  memberCount={family._count.members}
                  members={family.members}
                />
              ))
            ) : (
              <EmptyStateCard
                icon={Users}
                title="No Families Yet"
                description="Create or join a family to start tracking preferences and wishlists."
                ctaText="Go to Families"
                ctaHref="/family"
              />
            )}
            {families.length === 1 && (
              <EmptyStateCard
                icon={Users}
                title="Join More Families"
                description="Connect with more family groups to coordinate gifts."
                ctaText="Go to Families"
                ctaHref="/family"
              />
            )}
          </div>
        </section>

        {/* Wishlist Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6 text-accent-foreground" />
            Your Wishlist
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.length > 0 ? (
              wishlistItems.map((item) => (
                <DashboardWishlistCard
                  key={item.id}
                  itemId={item.id}
                  title={item.title}
                  price={item.price}
                  imageUrl={item.imageUrl}
                  priority={item.priority}
                  familyName={item.family.name}
                />
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3">
                <EmptyStateCard
                  icon={Heart}
                  title="No Wishlist Items"
                  description="Add items you'd like to receive as gifts."
                  ctaText="Add Wishlist Item"
                  ctaHref="/wishlist/add"
                />
              </div>
            )}
          </div>
        </section>

        {/* Gift Groups Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Gift className="h-6 w-6 text-secondary-foreground" />
            Gift Groups
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {processedGroups.length > 0 ? (
              processedGroups.map((group) => (
                <DashboardGroupCard
                  key={group.id}
                  groupId={group.id}
                  groupName={group.name}
                  occasion={group.occasion}
                  memberCount={group.memberCount}
                  targetAmount={group.targetAmount}
                  currentAmount={group.currentAmount}
                  recentMessages={group.recentMessages}
                  unreadCount={group.unreadCount}
                />
              ))
            ) : (
              <EmptyStateCard
                icon={Gift}
                title="No Gift Groups"
                description="Pool resources with family to buy bigger gifts together."
                ctaText="Go to Groups"
                ctaHref="/groups"
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
