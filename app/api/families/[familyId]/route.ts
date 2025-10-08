import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateFamilySchema } from "@/lib/validations/family";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!family) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    // Check if user is a member
    const isMember = family.members.some(
      (member) => member.userId === session.user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    return NextResponse.json({ family });
  } catch (error) {
    console.error("Error fetching family:", error);
    return NextResponse.json(
      { error: "Failed to fetch family" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateFamilySchema.parse(body);

    // Check if user is admin
    const member = await prisma.familyMember.findFirst({
      where: {
        familyId: familyId,
        userId: session.user.id,
      },
    });

    if (!member || member.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update family settings" },
        { status: 403 }
      );
    }

    const family = await prisma.family.update({
      where: { id: familyId },
      data: {
        name: validatedData.name,
      },
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

    return NextResponse.json({
      message: "Family updated successfully",
      family,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update family" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const member = await prisma.familyMember.findFirst({
      where: {
        familyId: familyId,
        userId: session.user.id,
      },
    });

    if (!member || member.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete the family" },
        { status: 403 }
      );
    }

    // Delete family (cascade will remove members)
    await prisma.family.delete({
      where: { id: familyId },
    });

    return NextResponse.json({
      message: "Family deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting family:", error);
    return NextResponse.json(
      { error: "Failed to delete family" },
      { status: 500 }
    );
  }
}
