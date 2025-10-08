import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/navigation/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--muted))' }}>
      <Sidebar userName={session.user.name} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile top spacing */}
        <div className="lg:hidden h-16" />

        {/* Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
