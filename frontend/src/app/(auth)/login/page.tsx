import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AuthForm from "./AuthForm";

export default async function LoginPage() {
  const supabase = await createClient();

  // User already authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Sign in to Downlouder
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Or create a new account to unlock Pro features.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
