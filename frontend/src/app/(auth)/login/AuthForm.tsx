"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function AuthForm() {
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  if (!supabase) return null;

  return (
    <Auth
      supabaseClient={supabase}
      view="sign_in"
      appearance={{ theme: ThemeSupa }}
      theme="dark"
      showLinks={false}
      providers={["github", "google"]}
      redirectTo="http://localhost:3000/auth/callback"
    />
  );
}
