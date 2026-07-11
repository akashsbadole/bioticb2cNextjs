import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (session?.user && (role === "admin" || role === "editor")) {
    redirect("/admin/dashboard");
  }

  return <AdminLogin />;
}
