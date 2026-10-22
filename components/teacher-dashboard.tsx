"use client";

import { FormEvent, useMemo, useState } from "react";

export type ClassItem = {
  id: string;
  nama: string;
  kode_kelas: string;
  created_at?: string;
};

export type MemberItem = {
  class_id: string;
  siswa_id: string;
  nama_panggilan: string;
};

export type ProgressItem = {
  id: string;
  siswa_id: string;
  bab_id: string;
  jenis_game: string;
  skor: number;
  waktu: number;
  tanggal: string;
};

export function TeacherDashboard({
  initialClasses,
  members,
  progress
}: {
  initialClasses: ClassItem[];
  members: MemberItem[];
  progress: ProgressItem[];
}) {
  const [classes, setClasses] = useState(initialClasses);
  const [nama, setNama] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const memberNames = useMemo(
    () => new Map(members.map((member) => [member.siswa_id, member.nama_panggilan])),
    [members]
  );

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Kelas tidak dapat dibuat.");
      setClasses((previous) => [result.classItem, ...previous]);
      setNama("");
      setMessage("Kelas berhasil dibuat. Bagikan kode kelas kepada siswa.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dashboard-stack">
      <section className="panel">
        <div className="eyebrow">PENGELOLAAN KELAS</div>
        <h2>Buat kelas baru</h2>
        <form onSubmit={createClass} className="join-form">
          <label htmlFor="nama-kelas">Nama kelas</label>
          <div className="join-row">
            <input id="nama-kelas" value={nama} onChange={(e) => setNama(e.target.value)} required minLength={2} maxLength={80} placeholder="Contoh: Bahasa Arab MI 4A" />
            <button className="button button-primary" disabled={busy}>{busy ? "Membuat..." : "Buat kelas"}</button>
          </div>
        </form>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>

      <section className="panel">
        <div className="eyebrow">KELAS SAYA</div>
        <h2>Daftar kelas dan kode gabung</h2>
        {classes.length === 0 ? (
          <p className="muted">Belum ada kelas. Buat kelas pertama menggunakan formulir di atas.</p>
        ) : (
          <div className="class-list">
            {classes.map((item) => (
              <article className="class-row" key={item.id}>
                <div>
                  <strong>{item.nama}</strong>
                  <p className="small muted">Kode kelas</p>
                </div>
                <code className="class-code">{item.kode_kelas}</code>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="eyebrow">ANGGOTA KELAS</div>
        <h2>Siswa yang bergabung</h2>
        {members.length === 0 ? <p className="muted">Belum ada siswa yang bergabung ke kelas.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama panggilan</th><th>ID siswa (singkat)</th></tr></thead>
              <tbody>
                {members.map((member) => (
                  <tr key={`${member.class_id}-${member.siswa_id}`}>
                    <td>{member.nama_panggilan}</td>
                    <td><code>{member.siswa_id.slice(0, 8)}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="eyebrow">HASIL BELAJAR</div>
        <h2>Progres terbaru</h2>
        {progress.length === 0 ? <p className="muted">Belum ada skor yang tersimpan. Skor game akan muncul setelah siswa login dan Supabase aktif.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Siswa</th><th>Bab</th><th>Permainan</th><th>Skor</th><th>Tanggal</th></tr></thead>
              <tbody>
                {progress.map((item) => (
                  <tr key={item.id}>
                    <td>{memberNames.get(item.siswa_id) || "Siswa"}</td>
                    <td>{item.bab_id}</td>
                    <td>{item.jenis_game}</td>
                    <td><strong>{item.skor}/100</strong></td>
                    <td>{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
