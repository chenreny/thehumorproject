import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeAuthDestination } from "@/lib/auth-redirect";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = request.cookies.get("auth_next")?.value;
      const safeNext = safeAuthDestination(next);
      const response = NextResponse.redirect(new URL(safeNext, request.url));
      response.cookies.delete("auth_next");
      return response;
    }
  }
  return NextResponse.redirect(new URL("/?auth_error=callback", request.url));
}
