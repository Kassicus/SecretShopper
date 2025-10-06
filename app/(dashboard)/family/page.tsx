import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreateFamilyDialog } from "@/components/family/create-family-dialog";
import { JoinFamilyDialog } from "@/components/family/join-family-dialog";
import { FamilyCard } from "@/components/family/family-card";

export default async function FamiliesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Families</h1>
          <p className="text-muted-foreground">
            Manage your family groups and memberships
          </p>
        </div>
        <div className="flex gap-2">
          <JoinFamilyDialog />
          <CreateFamilyDialog />
        </div>
      </div>

      {families.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">No families yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create a new family or join an existing one using an invite code.
          </p>
          <div className="flex gap-2">
            <JoinFamilyDialog />
            <CreateFamilyDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {families.map((family) => (
            <FamilyCard
              key={family.id}
              family={family}
              currentUserId={session.user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
