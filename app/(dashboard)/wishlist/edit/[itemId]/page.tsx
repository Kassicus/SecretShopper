import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WishlistItemForm } from "@/components/wishlist/wishlist-item-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditWishlistItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ familyId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { itemId } = await params;
  const resolvedSearchParams = await searchParams;

  const item = await prisma.wishlistItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    notFound();
  }

  // Only owner can edit
  if (item.userId !== session.user.id) {
    redirect("/wishlist");
  }

  const familyId = resolvedSearchParams.familyId || item.familyId;

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
        <h1 className="text-3xl font-bold">Edit Wishlist Item</h1>
        <p className="text-muted-foreground">{item.title}</p>
      </div>

      <WishlistItemForm familyId={familyId} initialData={item} itemId={item.id} />
    </div>
  );
}
