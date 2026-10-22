import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { JoinClassForm } from "@/components/join-class-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT"));
  if (!configured) {
    return (
      <><SiteHeader /><main className="site-shell">
        <section className="page-heading"><div className="eyebrow">DASHBOARD</div><h1>Dashboard pembelajar</h1></section>
        <div className="notice notice-warn">Supabase belum dikonfigurasi. Ikuti bagian Supabase pada README.md untuk mengaktifkan autentikasi, kelas, dan penyimpanan progres.</div>
        <div className="game-links"><Link className="button button-primary" href="/login">Ke halaman login</Link><Link className="button button-soft" href="/">Kembali ke beranda</Link></div>
      </main></>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <><SiteHeader /><main className="site-shell"><section className="page-heading"><h1>Masuk terlebih dahulu</h1><p>Dashboard hanya tersedia untuk pengguna yang masuk.</p><Link className="button button-primary" href="/login">Masuk / daftar</Link></section></main></>;
  }

  const { data: profile } = await supabase.from("profiles").select("nama_panggilan,peran").eq("id", user.id).maybeSingle();
  if (!profile) {
    return <><SiteHeader /><main className="site-shell"><div className="notice notice-warn">Profil belum ditemukan. Pastikan SQL schema sudah dijalankan di Supabase, lalu daftar ulang akun demo.</div></main></>;
  }
  if (profile.peran === "guru") {
    return <><SiteHeader /><main className="site-shell"><section className="page-heading"><div className="eyebrow">DASHBOARD GURU</div><h1>Halo, {profile.nama_panggilan}!</h1><p>Kelola kelas dan pantau hasil belajar siswa.</p><Link className="button button-primary" href="/guru">Buka dashboard guru</Link></section></main></>;
  }

  const { data: membership } = await supabase.from("class_members").select("class_id,joined_at").eq("siswa_id", user.id);
  const classIds = (membership ?? []).map((item) => item.class_id);
  const { data: classes } = classIds.length
    ? await supabase.from("classes").select("id,nama,kode_kelas").in("id", classIds)
    : { data: [] as { id: string; nama: string; kode_kelas: string }[] };
  const { data: progress } = await supabase.from("progress").select("id,bab_id,jenis_game,skor,tanggal").eq("siswa_id", user.id).order("tanggal", { ascending: false }).limit(10);

  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <section className="page-heading">
          <div className="eyebrow">DASHBOARD SISWA</div>
          <h1>Halo, {profile.nama_panggilan}! 👋</h1>
          <p>Terus berlatih sedikit demi sedikit. Setiap percobaan adalah kesempatan untuk berkembang.</p>
        </section>
        <JoinClassForm />
        <section className="section">
          <h2>Kelas saya</h2>
          {(classes ?? []).length ? <div className="class-list">{(classes ?? []).map((item) => <div className="class-row" key={item.id}><strong>{item.nama}</strong><code className="class-code">{item.kode_kelas}</code></div>)}</div> : <div className="empty-state muted">Kamu belum bergabung ke kelas. Minta kode kelas kepada guru.</div>}
        </section>
        <section className="section">
          <h2>Progres terbaru</h2>
          {(progress ?? []).length ? <div className="table-wrap"><table><thead><tr><th>Bab</th><th>Game</th><th>Skor</th><th>Tanggal</th></tr></thead><tbody>{(progress ?? []).map((item) => <tr key={item.id}><td>{item.bab_id}</td><td>{item.jenis_game}</td><td>{item.skor}/100</td><td>{new Date(item.tanggal).toLocaleDateString("id-ID")}</td></tr>)}</tbody></table></div> : <div className="empty-state muted">Skor akan tampil setelah game selesai ketika Supabase aktif dan kamu sudah masuk.</div>}
        </section>
      </main>
    </>
  );
}
