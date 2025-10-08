import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendFamilyInviteEmail } from "@/lib/email";
import { z } from "zod";

const inviteEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { familyId } = await params;

    // Check if user is a member of the family
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    // Get family details
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: {
        name: true,
        inviteCode: true,
      },
    });

    if (!family) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    const body = await req.json();
    const { email } = inviteEmailSchema.parse(body);

    // Check if user with this email already exists and is in the family
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        familyMembers: {
          where: { familyId },
        },
      },
    });

    if (existingUser && existingUser.familyMembers.length > 0) {
      return NextResponse.json(
        { error: "This user is already a member of this family" },
        { status: 400 }
      );
    }

    // Generate invite link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${appUrl}/register?inviteCode=${family.inviteCode}`;

    // Send invitation email
    const result = await sendFamilyInviteEmail({
      to: email,
      familyName: family.name,
      inviteCode: family.inviteCode,
      inviterName: session.user.name || session.user.email || "Someone",
      inviteLink,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Invitation sent successfully",
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending invitation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
