import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card";
import { Plus } from "lucide-react";

export default async function WishlistPage({
  searchParams,
}: {
  searchParams: { familyId?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const familyId = searchParams.familyId;

  if (!familyId) {
    // Show family selector
    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        {families.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">No families yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Join or create a family to start building your wishlist.
            </p>
            <Link href="/family">
              <Button>Go to Families</Button>
            </Link>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-muted-foreground">
              Select a family to view your wishlist:
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {families.map((family) => (
                <Link key={family.id} href={`/wishlist?familyId=${family.id}`}>
                  <Button variant="outline" className="w-full h-auto p-6">
                    <span className="text-lg font-semibold">{family.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get family and wishlist items
  const family = await prisma.family.findUnique({
    where: { id: familyId },
  });

  if (!family) {
    redirect("/wishlist");
  }

  // Check if user is a member
  const member = await prisma.familyMember.findFirst({
    where: {
      familyId,
      userId: session.user.id,
    },
  });

  if (!member) {
    redirect("/wishlist");
  }

  const rawItems = await prisma.wishlistItem.findMany({
    where: {
      familyId,
      userId: session.user.id,
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
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Convert Decimal to number for Client Components
  const items = rawItems.map((item) => ({
    ...item,
    price: item.price ? Number(item.price) : null,
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">{family.name}</p>
        </div>
        <Link href={`/wishlist/add?familyId=${familyId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">No wishlist items yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Start building your wishlist by adding items you'd like to receive.
          </p>
          <Link href={`/wishlist/add?familyId=${familyId}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add First Item
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
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
  );
}
