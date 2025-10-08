import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Gift, Heart } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with solid background */}
      <div className="mb-12 rounded-2xl bg-accent/10 p-8 border border-accent/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{session.user.name || session.user.email}</span>!
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline" className="shadow-md hover:shadow-lg transition-all">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden group">
          {/* Solid accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />

          <CardHeader className="bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Families</CardTitle>
            </div>
            <CardDescription className="text-base">Manage your family groups</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Create or join a family to start tracking preferences and wishlists.
            </p>
            <Button asChild className="w-full shadow-md hover:shadow-lg transition-all">
              <a href="/family">View Families</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          {/* Solid accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-accent" />

          <CardHeader className="bg-accent/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Heart className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl">Wishlist</CardTitle>
            </div>
            <CardDescription className="text-base">Your wish items</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Add items you'd like to receive as gifts.
            </p>
            <Button asChild variant="outline" className="w-full shadow-md hover:shadow-lg transition-all border-accent/30 hover:bg-accent/10">
              <a href="/wishlist">View Wishlist</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          {/* Solid accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-secondary" />

          <CardHeader className="bg-secondary/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <Gift className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl">Gift Groups</CardTitle>
            </div>
            <CardDescription className="text-base">Coordinate group gifts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Pool resources with family to buy bigger gifts together.
            </p>
            <Button asChild variant="outline" className="w-full shadow-md hover:shadow-lg transition-all border-secondary/30 hover:bg-secondary/10">
              <a href="/groups">View Groups</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
