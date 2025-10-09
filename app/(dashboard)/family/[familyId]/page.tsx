import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CopyInviteButton } from "@/components/family/copy-invite-button";
import { InviteByEmailDialog } from "@/components/family/invite-by-email-dialog";
import { MemberCard } from "@/components/family/member-card";

export default async function FamilyDetailPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { familyId } = await params;

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
        orderBy: {
          joinedAt: "asc",
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
    notFound();
  }

  // Check if user is a member
  const userMember = family.members.find(
    (member) => member.user.id === session.user.id
  );

  if (!userMember) {
    redirect("/family");
  }

  const isAdmin = userMember.role === "ADMIN";

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{family.name}</h1>
            <p className="text-muted-foreground">
              Created by {family.creator.name || family.creator.email}
            </p>
          </div>
          {isAdmin && (
            <Link href={`/family/${familyId}/settings`}>
              <Button variant="outline">Settings</Button>
            </Link>
          )}
        </div>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Invite Family Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm">
                    {family.inviteCode}
                  </code>
                  <CopyInviteButton inviteCode={family.inviteCode} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this code with family members to invite them
                </p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Or send an invitation directly via email:
                </p>
                <InviteByEmailDialog familyId={familyId} familyName={family.name} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Members ({family.members.length})
          </h2>
          <div className="space-y-2">
            {family.members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                familyId={familyId}
                isCurrentUser={member.user.id === session.user.id}
                isAdmin={isAdmin}
                showEmail={isAdmin}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
