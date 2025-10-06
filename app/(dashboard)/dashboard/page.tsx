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

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}!
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Families</CardTitle>
            <CardDescription>Manage your family groups</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create or join a family to start tracking preferences and wishlists.
            </p>
            <Button asChild className="w-full">
              <a href="/family">View Families</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wishlist</CardTitle>
            <CardDescription>Your wish items</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add items you'd like to receive as gifts.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="/wishlist">View Wishlist</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gift Groups</CardTitle>
            <CardDescription>Coordinate group gifts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Pool resources with family to buy bigger gifts together.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="/groups">View Groups</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
