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
    <div className="min-h-screen bg-card">
      <Sidebar userName={session.user.name} />

      {/* Main content wrapper - has card background on mobile, creates spacing on desktop */}
      <div className="lg:pl-[240px] min-h-screen bg-card">
        {/* Mobile top spacing - matches the fixed header height */}
        <div className="lg:hidden h-16 bg-card" />

        {/* Content with full wrap-around border and rounded corners */}
        <main
          className="min-h-screen p-6 lg:p-8 relative bg-muted border border-border lg:rounded-[24px] lg:ml-4 lg:mr-4 lg:mb-4"
          style={{
            minHeight: 'calc(100vh - 32px)',
            boxShadow: `
              inset 6px 6px 16px rgba(0, 0, 0, 0.5),
              inset -2px -2px 8px rgba(255, 255, 255, 0.02),
              0 4px 12px rgba(0, 0, 0, 0.3)
            `
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
