import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || (role !== "admin" && role !== "editor")) {
    redirect("/admin");
  }

  return <>{children}</>;
}
