import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createFamilySchema } from "@/lib/validations/family";
import { generateInviteCode } from "@/lib/utils/invite-code";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all families the user is a member of
    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ families });
  } catch (error) {
    console.error("Error fetching families:", error);
    return NextResponse.json(
      { error: "Failed to fetch families" },
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

    // Verify the user exists in the database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json(
        { error: "User account not found. Please log out and log back in." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = createFamilySchema.parse(body);

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let isUnique = false;

    // Ensure invite code is unique
    while (!isUnique) {
      const existing = await prisma.family.findUnique({
        where: { inviteCode },
      });
      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    // Create family and add creator as admin member
    const family = await prisma.family.create({
      data: {
        name: validatedData.name,
        inviteCode,
        createdBy: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
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

    return NextResponse.json(
      {
        message: "Family created successfully",
        family,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating family:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create family" },
      { status: 500 }
    );
  }
}
