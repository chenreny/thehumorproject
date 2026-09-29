import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const types: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function isValidImage(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  if (file.type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/", request.url), 303);

  const form = await request.formData();
  const file = form.get("avatar");
  if (!(file instanceof File) || !types[file.type] || file.size === 0 || file.size > 2 * 1024 * 1024 || !(await isValidImage(file))) {
    return NextResponse.redirect(new URL("/profile?avatar=invalid", request.url), 303);
  }

  const { data: current, error: readError } = await supabase.from("profiles")
    .select("avatar_path").eq("id", user.id).single<{ avatar_path: string | null }>();
  if (readError) return NextResponse.redirect(new URL("/profile?avatar=error", request.url), 303);

  const path = `${user.id}/${crypto.randomUUID()}.${types[file.type]}`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
  });
  if (uploadError) return NextResponse.redirect(new URL("/profile?avatar=error", request.url), 303);

  const { error: updateError } = await supabase.from("profiles")
    .update({ avatar_path: path, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (updateError) {
    await supabase.storage.from("avatars").remove([path]);
    return NextResponse.redirect(new URL("/profile?avatar=error", request.url), 303);
  }
  if (current.avatar_path) await supabase.storage.from("avatars").remove([current.avatar_path]);
  return NextResponse.redirect(new URL("/profile?avatar=saved", request.url), 303);
}
