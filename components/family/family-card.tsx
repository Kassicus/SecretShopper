"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Crown } from "lucide-react";

interface FamilyCardProps {
  family: {
    id: string;
    name: string;
    inviteCode: string;
    members: Array<{
      role: string;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    }>;
    creator: {
      id: string;
      name: string | null;
    };
  };
  currentUserId: string;
}

export function FamilyCard({ family, currentUserId }: FamilyCardProps) {
  const isAdmin = family.members.some(
    (member) => member.user.id === currentUserId && member.role === "ADMIN"
  );

  const memberCount = family.members.length;

  return (
    <Link href={`/family/${family.id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {family.name}
                {isAdmin && (
                  <Crown className="h-4 w-4 text-amber-500" />
                )}
              </CardTitle>
              <CardDescription>Code: {family.inviteCode}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
            </div>
            {isAdmin && (
              <Badge variant="secondary">Admin</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
