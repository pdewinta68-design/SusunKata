import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedGames = new Set(["memory", "tts", "wordsearch"]);

export async function POST(request: NextRequest) {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT"));
  if (!configured) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Silakan masuk untuk menyimpan progres." }, { status: 401 });

    const body = await request.json() as {
      bab_id?: unknown; jenis_game?: unknown; skor?: unknown; waktu?: unknown;
    };
    const babId = typeof body.bab_id === "string" ? body.bab_id.trim() : "";
    const game = typeof body.jenis_game === "string" ? body.jenis_game : "";
    const score = Number(body.skor);
    const seconds = Number(body.waktu);

    if (!/^[a-z0-9-]{1,80}$/.test(babId)) return NextResponse.json({ error: "ID bab tidak valid." }, { status: 400 });
    if (!allowedGames.has(game)) return NextResponse.json({ error: "Jenis game tidak valid." }, { status: 400 });
    if (!Number.isFinite(score) || score < 0 || score > 100) return NextResponse.json({ error: "Skor harus 0–100." }, { status: 400 });
    if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86400) return NextResponse.json({ error: "Durasi tidak valid." }, { status: 400 });

    const { error } = await supabase.from("progress").insert({
      siswa_id: user.id,
      bab_id: babId,
      jenis_game: game,
      skor: Math.round(score),
      waktu: Math.round(seconds)
    });
    if (error) return NextResponse.json({ error: "Progres tidak dapat disimpan. Pastikan akun siswa dan policy database benar." }, { status: 400 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 });
  }
}
