import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <SignUp
          routing="hash"
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
