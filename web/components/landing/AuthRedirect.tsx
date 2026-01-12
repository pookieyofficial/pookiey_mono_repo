"use client";

import { useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

export default function AuthRedirect() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return null;
}

