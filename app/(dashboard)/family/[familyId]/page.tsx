import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import Link from "next/link";
import { CopyInviteButton } from "@/components/family/copy-invite-button";

export default async function FamilyDetailPage({
  params,
}: {
  params: { familyId: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const family = await prisma.family.findUnique({
    where: { id: params.familyId },
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
            <Link href={`/family/${family.id}/settings`}>
              <Button variant="outline">Settings</Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Invite Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm">
                {family.inviteCode}
              </code>
              <CopyInviteButton inviteCode={family.inviteCode} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Share this code with family members to invite them
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Members ({family.members.length})
          </h2>
          <div className="space-y-2">
            {family.members.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "ADMIN" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                    {member.user.id === session.user.id && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profiles</CardTitle>
              <CardDescription>
                View family member preferences and sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/family/${family.id}/profiles`}>
                <Button variant="outline" className="w-full">
                  View Profiles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wishlists</CardTitle>
              <CardDescription>
                Browse family member wishlists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/family/${family.id}/wishlists`}>
                <Button variant="outline" className="w-full">
                  View Wishlists
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
