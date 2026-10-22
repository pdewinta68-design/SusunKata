import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const configured = () => Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT")
);

export async function GET() {
  if (!configured()) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  const { data, error } = await supabase.from("classes").select("id,nama,kode_kelas,created_at").eq("guru_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Kelas tidak dapat dimuat." }, { status: 400 });
  return NextResponse.json({ classes: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!configured()) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("peran").eq("id", user.id).maybeSingle();
    if (profile?.peran !== "guru") return NextResponse.json({ error: "Hanya akun guru yang dapat membuat kelas." }, { status: 403 });

    const body = await request.json() as { nama?: unknown };
    const nama = typeof body.nama === "string" ? body.nama.trim() : "";
    if (nama.length < 2 || nama.length > 80) return NextResponse.json({ error: "Nama kelas harus 2–80 karakter." }, { status: 400 });

    const kode_kelas = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    const { data: classItem, error } = await supabase.from("classes").insert({
      nama,
      kode_kelas,
      guru_id: user.id
    }).select("id,nama,kode_kelas,created_at").single();

    if (error || !classItem) return NextResponse.json({ error: "Kelas gagal dibuat. Coba lagi." }, { status: 400 });
    return NextResponse.json({ classItem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 });
  }
}
