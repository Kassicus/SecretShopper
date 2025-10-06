import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.wishlistItem.findUnique({
      where: { id: params.itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Cannot claim your own items
    if (item.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot claim your own wishlist items" },
        { status: 400 }
      );
    }

    // Check if already claimed
    if (item.claimedBy && item.claimedBy !== session.user.id) {
      return NextResponse.json(
        { error: "This item has already been claimed by someone else" },
        { status: 400 }
      );
    }

    // Claim the item
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: params.itemId },
      data: {
        claimedBy: session.user.id,
        claimedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Item claimed successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error claiming item:", error);
    return NextResponse.json(
      { error: "Failed to claim item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.wishlistItem.findUnique({
      where: { id: params.itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Can only unclaim if you claimed it
    if (item.claimedBy !== session.user.id) {
      return NextResponse.json(
        { error: "You can only unclaim items you have claimed" },
        { status: 403 }
      );
    }

    // Unclaim the item
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: params.itemId },
      data: {
        claimedBy: null,
        claimedAt: null,
        purchased: false,
      },
    });

    return NextResponse.json({
      message: "Item unclaimed successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error unclaiming item:", error);
    return NextResponse.json(
      { error: "Failed to unclaim item" },
      { status: 500 }
    );
  }
}
