import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/admin/dashboard"
          signUpUrl="/register"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
              footerActionLink: 'text-emerald-600 hover:text-emerald-700'
            }
          }}
        />
      </div>
    </div>
  );
}
