import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WishlistCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-muted animate-pulse" />

      <CardHeader className="bg-muted/20">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 bg-muted/20 border-t">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  );
}
