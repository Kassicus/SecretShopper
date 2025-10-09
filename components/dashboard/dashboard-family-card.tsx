"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface FamilyMember {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface DashboardFamilyCardProps {
  familyId: string;
  familyName: string;
  memberCount: number;
  members: FamilyMember[];
}

export function DashboardFamilyCard({
  familyId,
  familyName,
  memberCount,
  members,
}: DashboardFamilyCardProps) {
  // Show up to 5 member avatars
  const displayMembers = members.slice(0, 5);
  const remainingCount = Math.max(0, memberCount - 5);

  return (
    <Link href={`/family/${familyId}`}>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-md hover:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <CardHeader className="bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{familyName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {memberCount} {memberCount === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Members:</p>
              <div className="flex -space-x-2">
                {displayMembers.map((member) => (
                  <Avatar
                    key={member.user.id}
                    className="h-8 w-8 border-2 border-background"
                  >
                    <AvatarFallback className="text-xs">
                      {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {remainingCount > 0 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
