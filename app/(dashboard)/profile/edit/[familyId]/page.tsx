import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { familyId } = await params;

  // Check if user is a member of this family
  const member = await prisma.familyMember.findFirst({
    where: {
      familyId,
      userId: session.user.id,
    },
  });

  if (!member) {
    notFound();
  }

  const family = await prisma.family.findUnique({
    where: { id: familyId },
  });

  const profile = await prisma.profile.findUnique({
    where: {
      userId_familyId: {
        userId: session.user.id,
        familyId,
      },
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profiles
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {profile ? "Edit" : "Create"} Profile
        </h1>
        <p className="text-muted-foreground">
          {family?.name} - {session.user.name || session.user.email}
        </p>
      </div>

      <ProfileForm familyId={familyId} initialData={profile} />
    </div>
  );
}
