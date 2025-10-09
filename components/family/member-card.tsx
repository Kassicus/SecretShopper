"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { RemoveMemberButton } from "./remove-member-button";

interface MemberCardProps {
  member: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  };
  familyId: string;
  isCurrentUser: boolean;
  isAdmin: boolean;
  showEmail: boolean;
}

export function MemberCard({
  member,
  familyId,
  isCurrentUser,
  isAdmin,
  showEmail,
}: MemberCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/family/${familyId}/member/${member.id}`);
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <button
          onClick={handleClick}
          className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
        >
          <Avatar>
            <AvatarFallback>
              {member.user.name?.[0] || member.user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {member.user.name || member.user.email}
            </p>
            {showEmail && (
              <p className="text-sm text-muted-foreground">
                {member.user.email}
              </p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2">
          {member.role === "ADMIN" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Admin
            </Badge>
          )}
          {isCurrentUser && <Badge variant="outline">You</Badge>}
          {isAdmin && !isCurrentUser && (
            <RemoveMemberButton
              familyId={familyId}
              memberId={member.id}
              memberName={member.user.name || ""}
              memberEmail={member.user.email}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
