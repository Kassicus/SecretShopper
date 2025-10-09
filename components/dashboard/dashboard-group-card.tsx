"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface DashboardGroupCardProps {
  groupId: string;
  groupName: string;
  occasion: string | null;
  memberCount: number;
  targetAmount: number | null;
  currentAmount: number;
  recentMessages: Message[];
  unreadCount: number;
}

export function DashboardGroupCard({
  groupId,
  groupName,
  occasion,
  memberCount,
  targetAmount,
  currentAmount,
  recentMessages,
  unreadCount,
}: DashboardGroupCardProps) {
  const progress = targetAmount
    ? (currentAmount / targetAmount) * 100
    : 0;

  const truncateMessage = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Link href={`/groups/${groupId}`}>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="cursor-pointer hover:border-secondary/50 transition-all shadow-md hover:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />

          <CardHeader className="bg-secondary/5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-lg">{groupName}</CardTitle>
                {occasion && (
                  <p className="text-sm text-muted-foreground">{occasion}</p>
                )}
              </div>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="shrink-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {/* Progress bar */}
            {targetAmount && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Goal Progress</span>
                  <span className="font-medium">
                    ${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{memberCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{recentMessages.length} messages</span>
              </div>
            </div>

            {/* Recent messages preview */}
            {recentMessages.length > 0 && (
              <div className="pt-2 border-t space-y-2">
                {recentMessages.slice(0, 2).map((message) => (
                  <div key={message.id} className="text-xs">
                    <p className="font-medium text-muted-foreground">
                      {message.user.name || message.user.email}
                    </p>
                    <p className="text-foreground/80 line-clamp-2">
                      {truncateMessage(message.content)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
