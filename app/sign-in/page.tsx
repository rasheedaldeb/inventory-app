import { SignIn } from "@stackframe/stack";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50  to-purple-100">
      <div className=" max-w-md w-full space-y-8">
        <SignIn />
        <div className="flex items-center justify-between">
          <Link href="/">Go Home</Link>
          <Link href="/dashboard">Go to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
