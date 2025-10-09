"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

interface DashboardWishlistCardProps {
  itemId: string;
  title: string;
  price: number | null;
  imageUrl: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  familyName: string;
}

export function DashboardWishlistCard({
  itemId,
  title,
  price,
  imageUrl,
  priority,
  familyName,
}: DashboardWishlistCardProps) {
  const priorityColors = {
    LOW: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    MEDIUM: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    HIGH: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <Link href={`/wishlist/edit/${itemId}`}>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden cursor-pointer hover:border-accent/50 transition-all shadow-md hover:shadow-lg group">
          <div className="h-1 bg-accent" />

          <CardHeader className="p-0">
            <div className="relative h-40 bg-muted overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                {title}
              </h3>
              <Badge
                variant="secondary"
                className={`text-xs shrink-0 ${priorityColors[priority]}`}
              >
                {priority}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              {price !== null && (
                <p className="text-lg font-bold text-primary">
                  ${price.toFixed(2)}
                </p>
              )}
              <Badge variant="outline" className="text-xs ml-auto">
                {familyName}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
