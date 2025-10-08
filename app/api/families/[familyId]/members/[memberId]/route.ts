import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ familyId: string; memberId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { familyId, memberId } = await params;

    // Check if the requesting user is an admin of the family
    const requestingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: session.user.id,
        },
      },
    });

    if (!requestingMember) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    if (requestingMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can remove family members" },
        { status: 403 }
      );
    }

    // Get the member to be removed
    const memberToRemove = await prisma.familyMember.findUnique({
      where: {
        id: memberId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    if (memberToRemove.familyId !== familyId) {
      return NextResponse.json(
        { error: "Member does not belong to this family" },
        { status: 400 }
      );
    }

    // Prevent removing yourself
    if (memberToRemove.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the family" },
        { status: 400 }
      );
    }

    // Check if this is the last admin
    if (memberToRemove.role === "ADMIN") {
      const adminCount = await prisma.familyMember.count({
        where: {
          familyId,
          role: "ADMIN",
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin. Promote another member to admin first." },
          { status: 400 }
        );
      }
    }

    // Delete the family member
    // This will cascade delete their profile for this family
    await prisma.familyMember.delete({
      where: {
        id: memberId,
      },
    });

    return NextResponse.json(
      {
        message: "Member removed successfully",
        removedMember: {
          id: memberToRemove.id,
          name: memberToRemove.user.name,
          email: memberToRemove.user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing family member:", error);
    return NextResponse.json(
      { error: "Failed to remove family member" },
      { status: 500 }
    );
  }
}
