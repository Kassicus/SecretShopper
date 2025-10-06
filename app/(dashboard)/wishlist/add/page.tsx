import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WishlistItemForm } from "@/components/wishlist/wishlist-item-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AddWishlistItemPage({
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

  const family = await prisma.family.findUnique({
    where: { id: familyId },
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/wishlist?familyId=${familyId}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to wishlist
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Wishlist Item</h1>
        <p className="text-muted-foreground">{family?.name}</p>
      </div>

      <WishlistItemForm familyId={familyId} />
    </div>
  );
}
