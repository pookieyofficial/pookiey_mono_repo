"use client";

import { ReactNode, useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase environment variables are missing. Authentication will not work."
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient(
      {
        supabaseUrl: supabaseUrl ?? "",
        supabaseKey: supabaseAnonKey ?? "",
      },
    )
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}

