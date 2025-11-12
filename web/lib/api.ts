import type { SupabaseClient } from "@supabase/supabase-js";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_BACKEND_URL is not set. API calls to the backend will fail."
  );
}

type JsonBody = Record<string, unknown> | Array<unknown>;

interface ApiRequestOptions extends RequestInit {
  jsonBody?: JsonBody;
}

async function buildRequestInit(
  options: ApiRequestOptions,
  token?: string
): Promise<RequestInit> {
  const headers = new Headers(options.headers ?? {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined = options.body as BodyInit;

  if (options.jsonBody !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.jsonBody);
  }

  return {
    ...options,
    headers,
    body,
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: unknown;
}

export async function callBackend<T>(
  supabase: SupabaseClient,
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  if (!backendUrl) {
    throw new Error("Backend URL is not configured.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("User is not authenticated.");
  }

  const requestInit = await buildRequestInit(options, session.access_token);
  const response = await fetch(`${backendUrl}${path}`, requestInit);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      payload?.message || payload?.error || "Request failed with unknown error";
    throw new Error(errorMessage);
  }

  return payload as ApiResponse<T>;
}

