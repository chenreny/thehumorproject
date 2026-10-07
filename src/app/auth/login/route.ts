import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeAuthDestination } from "@/lib/auth-redirect";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${request.nextUrl.origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/?auth_error=login", request.url));
  }
  const response = NextResponse.redirect(data.url);
  const next = request.nextUrl.searchParams.get("next");
  const safeNext = safeAuthDestination(next);
  response.cookies.set("auth_next", safeNext, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}
