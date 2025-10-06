import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { contributeSchema } from "@/lib/validations/gift-group";
import { Decimal } from "@/lib/generated/prisma/runtime/library";

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = contributeSchema.parse(body);

    // Find the member
    const member = await prisma.giftGroupMember.findFirst({
      where: {
        giftGroupId: params.groupId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const group = await prisma.giftGroup.findUnique({
      where: { id: params.groupId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Calculate the difference for updating group's currentAmount
    const oldAmount = member.contributionAmount
      ? Number(member.contributionAmount)
      : 0;
    const newAmount = validatedData.amount;
    const difference = newAmount - oldAmount;

    // Update member contribution and group current amount
    await prisma.$transaction([
      prisma.giftGroupMember.update({
        where: { id: member.id },
        data: {
          contributionAmount: new Decimal(validatedData.amount),
          hasPaid: validatedData.hasPaid,
        },
      }),
      prisma.giftGroup.update({
        where: { id: params.groupId },
        data: {
          currentAmount: {
            increment: new Decimal(difference),
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Contribution updated successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update contribution" },
      { status: 500 }
    );
  }
}
