import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { TabNav } from "@/components/TabNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session.user} />
      <TabNav />
      <main className="flex-1 px-4 md:px-8 py-6 max-w-screen-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
