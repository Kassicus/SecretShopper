import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/profile";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("familyId");
    const userId = searchParams.get("userId");

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

    if (userId) {
      // Get specific user's profile
      const profile = await prisma.profile.findUnique({
        where: {
          userId_familyId: {
            userId,
            familyId,
          },
        },
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
      });

      return NextResponse.json({ profile });
    } else {
      // Get all profiles in family
      const profiles = await prisma.profile.findMany({
        where: { familyId },
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
      });

      return NextResponse.json({ profiles });
    }
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
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
    const { familyId, ...profileData } = body;

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

    const validatedData = profileSchema.parse(profileData);

    // Convert date strings to Date objects
    const birthday = validatedData.birthday
      ? new Date(validatedData.birthday)
      : null;
    const anniversary = validatedData.anniversary
      ? new Date(validatedData.anniversary)
      : null;

    // Create or update profile
    const profile = await prisma.profile.upsert({
      where: {
        userId_familyId: {
          userId: session.user.id,
          familyId,
        },
      },
      create: {
        userId: session.user.id,
        familyId,
        ...validatedData,
        birthday,
        anniversary,
      },
      update: {
        ...validatedData,
        birthday,
        anniversary,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
