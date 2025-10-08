import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Only the claimer can mark as purchased
    if (item.claimedBy !== session.user.id) {
      return NextResponse.json(
        { error: "Only the person who claimed this item can mark it as purchased" },
        { status: 403 }
      );
    }

    // Mark as purchased
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: itemId },
      data: {
        purchased: true,
      },
    });

    return NextResponse.json({
      message: "Item marked as purchased",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error marking item as purchased:", error);
    return NextResponse.json(
      { error: "Failed to mark item as purchased" },
      { status: 500 }
    );
  }
}
