import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT"));
  if (!configured) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

    const body = await request.json() as { kode_kelas?: unknown };
    const kode = typeof body.kode_kelas === "string" ? body.kode_kelas.trim().toUpperCase() : "";
    if (!/^[A-Z0-9]{6,12}$/.test(kode)) return NextResponse.json({ error: "Format kode kelas tidak valid." }, { status: 400 });

    const { data, error } = await supabase.rpc("join_class", { p_kode_kelas: kode });
    if (error) return NextResponse.json({ error: error.message || "Tidak dapat bergabung ke kelas." }, { status: 400 });
    return NextResponse.json({ ok: true, class_id: data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 });
  }
}
