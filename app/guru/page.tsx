import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { TeacherDashboard, type ClassItem, type MemberItem, type ProgressItem } from "@/components/teacher-dashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GuruPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT"));
  if (!configured) {
    return <><SiteHeader /><main className="site-shell"><section className="page-heading"><div className="eyebrow">DASHBOARD GURU</div><h1>Dashboard guru</h1></section><div className="notice notice-warn">Konfigurasikan Supabase terlebih dahulu. Petunjuk tersedia di README.md.</div></main></>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <><SiteHeader /><main className="site-shell"><section className="page-heading"><h1>Masuk sebagai guru</h1><p>Masuk menggunakan akun guru untuk mengelola kelas.</p><Link className="button button-primary" href="/login">Masuk / daftar</Link></section></main></>;
  }

  const { data: profile } = await supabase.from("profiles").select("nama_panggilan,peran").eq("id", user.id).maybeSingle();
  if (profile?.peran !== "guru") {
    return <><SiteHeader /><main className="site-shell"><section className="page-heading"><h1>Halaman guru</h1><p>Akun ini tidak memiliki peran guru. Masuk dengan akun guru atau kembali ke dashboard.</p><Link className="button button-primary" href="/dashboard">Dashboard saya</Link></section></main></>;
  }

  const { data: classRows } = await supabase.from("classes").select("id,nama,kode_kelas,created_at").eq("guru_id", user.id).order("created_at", { ascending: false });
  const classes = (classRows ?? []) as ClassItem[];
  const classIds = classes.map((item) => item.id);
  let membershipRows: { class_id: string; siswa_id: string }[] = [];
  if (classIds.length) {
    const { data } = await supabase.from("class_members").select("class_id,siswa_id").in("class_id", classIds);
    membershipRows = (data ?? []) as { class_id: string; siswa_id: string }[];
  }
  const studentIds = Array.from(new Set(membershipRows.map((item) => item.siswa_id)));
  let profileRows: { id: string; nama_panggilan: string }[] = [];
  let progressRows: ProgressItem[] = [];
  if (studentIds.length) {
    const { data: students } = await supabase.from("profiles").select("id,nama_panggilan").in("id", studentIds);
    profileRows = (students ?? []) as { id: string; nama_panggilan: string }[];
    const { data: progressData } = await supabase.from("progress").select("id,siswa_id,bab_id,jenis_game,skor,waktu,tanggal").in("siswa_id", studentIds).order("tanggal", { ascending: false }).limit(50);
    progressRows = (progressData ?? []) as ProgressItem[];
  }
  const members: MemberItem[] = membershipRows.map((item) => ({
    ...item,
    nama_panggilan: profileRows.find((profileItem) => profileItem.id === item.siswa_id)?.nama_panggilan ?? "Siswa"
  }));

  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <section className="page-heading">
          <div className="eyebrow">DASHBOARD GURU</div>
          <h1>Halo, {profile.nama_panggilan}!</h1>
          <p>Buat kelas, bagikan kode kepada siswa, dan lihat progres belajar yang telah tersimpan.</p>
        </section>
        <TeacherDashboard initialClasses={classes} members={members} progress={progressRows} />
        <footer className="site-footer"><Link href="/dashboard">← Kembali ke dashboard</Link></footer>
      </main>
    </>
  );
}
