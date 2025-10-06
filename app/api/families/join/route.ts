import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { joinFamilySchema } from "@/lib/validations/family";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = joinFamilySchema.parse(body);

    // Find family by invite code
    const family = await prisma.family.findUnique({
      where: { inviteCode: validatedData.inviteCode },
      include: {
        members: true,
      },
    });

    if (!family) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = family.members.find(
      (member) => member.userId === session.user.id
    );

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this family" },
        { status: 400 }
      );
    }

    // Add user as member
    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId: session.user.id,
        role: "MEMBER",
      },
    });

    // Fetch updated family with members
    const updatedFamily = await prisma.family.findUnique({
      where: { id: family.id },
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

    return NextResponse.json(
      {
        message: `Successfully joined ${family.name}`,
        family: updatedFamily,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to join family" },
      { status: 500 }
    );
  }
}
