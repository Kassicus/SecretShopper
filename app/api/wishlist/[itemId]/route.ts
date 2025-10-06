import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { wishlistItemSchema } from "@/lib/validations/wishlist";

export async function PATCH(
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

    // Only the owner can edit the item
    if (item.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own items" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = wishlistItemSchema.parse(body);

    const updatedItem = await prisma.wishlistItem.update({
      where: { id: params.itemId },
      data: {
        ...validatedData,
        url: validatedData.url || null,
        imageUrl: validatedData.imageUrl || null,
      },
    });

    return NextResponse.json({
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update item" },
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

    // Only the owner can delete the item
    if (item.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own items" },
        { status: 403 }
      );
    }

    await prisma.wishlistItem.delete({
      where: { id: params.itemId },
    });

    return NextResponse.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
