import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileCompletionBadge } from "@/components/profile/profile-completion-badge";
import { Edit } from "lucide-react";

export default async function ProfileListPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get all families the user belongs to
  const families = await prisma.family.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      profiles: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profiles</h1>
        <p className="text-muted-foreground">
          Manage your profile information for each family
        </p>
      </div>

      {families.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">No families yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Join or create a family to set up your profile.
          </p>
          <Link href="/family">
            <Button>Go to Families</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {families.map((family) => {
            const profile = family.profiles[0];
            const hasProfile = !!profile;

            return (
              <Card key={family.id}>
                <CardHeader>
                  <CardTitle>{family.name}</CardTitle>
                  <CardDescription>
                    {hasProfile ? (
                      <ProfileCompletionBadge profile={profile} />
                    ) : (
                      "No profile yet"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/profile/edit/${family.id}`}>
                    <Button variant={hasProfile ? "outline" : "default"} className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      {hasProfile ? "Edit Profile" : "Create Profile"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
