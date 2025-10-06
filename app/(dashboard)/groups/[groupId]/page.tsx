import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GroupChat } from "@/components/groups/group-chat";
import { ArrowLeft, Calendar, DollarSign, Users } from "lucide-react";
import Link from "next/link";

async function updateContribution(groupId: string, amount: number, hasPaid: boolean) {
  "use server";
  const session = await auth();
  if (!session?.user) return;

  await fetch(`${process.env.NEXTAUTH_URL}/api/groups/${groupId}/contribute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, hasPaid }),
  });
}

export default async function GroupDetailPage({
  params,
}: {
  params: { groupId: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const group = await prisma.giftGroup.findUnique({
    where: { id: params.groupId },
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
      messages: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  // Check if user is a member
  const userMember = group.members.find((m) => m.user.id === session.user.id);

  if (!userMember) {
    redirect("/groups");
  }

  const progress = group.targetAmount
    ? (Number(group.currentAmount) / Number(group.targetAmount)) * 100
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link
          href={`/groups?familyId=${group.familyId}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to groups
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            <p className="text-muted-foreground">
              Created by {group.creator.name || group.creator.email}
            </p>
          </div>
          {!group.isActive && <Badge variant="secondary">Inactive</Badge>}
        </div>

        {group.description && (
          <p className="text-muted-foreground">{group.description}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Group Info & Members */}
        <div className="space-y-6">
          {/* Group Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.occasion && (
                <div>
                  <p className="text-sm text-muted-foreground">Occasion</p>
                  <p className="font-medium">{group.occasion}</p>
                </div>
              )}

              {group.occasionDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(group.occasionDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

              {group.targetAmount && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Target Amount
                    </span>
                    <span className="font-semibold">
                      ${Number(group.targetAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Collected
                    </span>
                    <span className="font-semibold text-primary">
                      ${Number(group.currentAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {progress.toFixed(0)}% of goal
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({group.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.user.name?.[0] ||
                          member.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.user.name || member.user.email}
                      </p>
                      {member.contributionAmount && (
                        <p className="text-xs text-muted-foreground">
                          ${Number(member.contributionAmount).toFixed(2)}
                          {member.hasPaid && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Paid
                            </Badge>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contribution Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Contribution</CardTitle>
              <CardDescription>
                Update your contribution amount and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const amount = parseFloat(formData.get("amount") as string);
                  const hasPaid = formData.get("hasPaid") === "on";

                  const session = await auth();
                  if (!session?.user) return;

                  await fetch(
                    `${process.env.NEXTAUTH_URL}/api/groups/${params.groupId}/contribute`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount, hasPaid }),
                    }
                  );
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={
                      userMember.contributionAmount
                        ? Number(userMember.contributionAmount)
                        : 0
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasPaid"
                    name="hasPaid"
                    defaultChecked={userMember.hasPaid}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="hasPaid">I have paid this amount</Label>
                </div>
                <Button type="submit">Update Contribution</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chat */}
        <div>
          <GroupChat
            groupId={params.groupId}
            initialMessages={group.messages}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}
