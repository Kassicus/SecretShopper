import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createGiftGroupSchema } from "@/lib/validations/gift-group";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("familyId");

    if (!familyId) {
      return NextResponse.json(
        { error: "familyId is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the family
    const member = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    // Get all groups in the family where user is a member
    const groups = await prisma.giftGroup.findMany({
      where: {
        familyId,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching gift groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch gift groups" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { familyId, memberIds, ...groupData } = body;

    if (!familyId) {
      return NextResponse.json(
        { error: "familyId is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: session.user.id,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    const validatedData = createGiftGroupSchema.parse(groupData);

    // Convert date string to Date if provided
    const occasionDate = validatedData.occasionDate
      ? new Date(validatedData.occasionDate)
      : null;

    // Create group with creator as first member
    const group = await prisma.giftGroup.create({
      data: {
        ...validatedData,
        familyId,
        createdBy: session.user.id,
        occasionDate,
        targetUserId: validatedData.targetUserId || null,
        members: {
          create: [
            {
              userId: session.user.id,
              contributionAmount: null,
              hasPaid: false,
            },
            ...(memberIds || []).map((userId: string) => ({
              userId,
              contributionAmount: null,
              hasPaid: false,
            })),
          ],
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
        message: "Gift group created successfully",
        group,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create gift group" },
      { status: 500 }
    );
  }
}
