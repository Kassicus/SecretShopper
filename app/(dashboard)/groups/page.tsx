import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { Users, Calendar, DollarSign } from "lucide-react";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ familyId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const familyId = resolvedSearchParams.familyId;

  if (!familyId) {
    // Show family selector
    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Gift Groups</h1>
        {families.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">No families yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Join or create a family to start coordinating group gifts.
            </p>
            <Link href="/family">
              <Button>Go to Families</Button>
            </Link>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-muted-foreground">
              Select a family to view gift groups:
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {families.map((family) => (
                <Link key={family.id} href={`/groups?familyId=${family.id}`}>
                  <Button variant="outline" className="w-full h-auto p-6">
                    <span className="text-lg font-semibold">{family.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get family and groups
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
            },
          },
        },
      },
    },
  });

  if (!family) {
    redirect("/groups");
  }

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
        },
      },
      members: true,
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gift Groups</h1>
          <p className="text-muted-foreground">{family.name}</p>
        </div>
        <CreateGroupDialog
          familyId={familyId}
          familyMembers={family.members}
          currentUserId={session.user.id}
        />
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">No gift groups yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create a group to pool resources for a special gift.
          </p>
          <CreateGroupDialog
            familyId={familyId}
            familyMembers={family.members}
            currentUserId={session.user.id}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const progress = group.targetAmount
              ? (Number(group.currentAmount) / Number(group.targetAmount)) * 100
              : 0;

            return (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription>
                          {group.occasion || "Gift group"}
                        </CardDescription>
                      </div>
                      {!group.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{group.members.length} members</span>
                      </div>
                      {group._count.messages > 0 && (
                        <span>{group._count.messages} messages</span>
                      )}
                    </div>

                    {group.targetAmount && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            ${Number(group.currentAmount).toFixed(2)} / $
                            {Number(group.targetAmount).toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {group.occasionDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(group.occasionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
