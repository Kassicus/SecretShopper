import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileView } from "@/components/profile/profile-view";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function FamilyProfilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ familyId: string }>;
  searchParams: Promise<{ userId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { familyId } = await params;
  const { userId } = await searchParams;

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
      },
    },
  });

  if (!family) {
    notFound();
  }

  // Check if user is a member
  const isMember = family.members.some(
    (member) => member.user.id === session.user.id
  );

  if (!isMember) {
    redirect("/family");
  }

  // Get all profiles for this family
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

  // Create a map of userId to profile
  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  // Filter members if userId is provided
  const filteredMembers = userId
    ? family.members.filter((member) => member.user.id === userId)
    : family.members;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/family/${familyId}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to family
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Family Profiles</h1>
        <p className="text-muted-foreground">{family.name}</p>
      </div>

      <div className="space-y-8">
        {filteredMembers.map((member) => {
          const profile = profileMap.get(member.user.id);
          const isCurrentUser = member.user.id === session.user.id;

          return (
            <div key={member.user.id}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {member.user.name || member.user.email}
                      {isCurrentUser && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                {isCurrentUser && (
                  <Link href={`/profile/edit/${familyId}`}>
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                )}
              </div>
              <ProfileView
                profile={profile || null}
                userName={member.user.name || undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
