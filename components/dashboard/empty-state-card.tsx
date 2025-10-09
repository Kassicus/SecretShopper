import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  ctaText,
  ctaHref,
}: EmptyStateCardProps) {
  return (
    <Card className="border-dashed border-2 border-border">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-foreground/70 mb-4">{description}</p>
        <Button asChild variant="outline">
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
