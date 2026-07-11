import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;
  const section = segments?.[0] || "overview";

  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId || (role !== "admin" && role !== "editor")) {
    redirect("/admin");
  }

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return (
    <AdminDashboardClient
      section={section}
      initialUser={
        dbUser
          ? { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role }
          : { id: userId, email: session.user?.email || "", name: "", role: role || "admin" }
      }
    />
  );
}
