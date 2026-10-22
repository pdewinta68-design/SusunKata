"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT")
);

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!configured) {
      setError("Supabase belum dikonfigurasi. Ikuti petunjuk pada README.md.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "register") {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nama_panggilan: nama.trim(), peran: "siswa" } }
        });
        if (authError) throw authError;
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setMessage("Pendaftaran dikirim. Jika konfirmasi email diaktifkan, periksa email sebelum masuk.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <div className="eyebrow">AKUN PEMBELAJAR</div>
      <h1>{mode === "login" ? "Selamat datang kembali" : "Buat akun siswa"}</h1>
      <p className="muted">
        Gunakan akun siswa atau guru untuk mengakses fitur yang sesuai.
      </p>

      {!configured && (
        <div className="notice notice-warn">
          Login belum aktif karena Supabase belum dikonfigurasi. Halaman permainan tetap dapat dicoba sebagai demo.
          Isi variabel pada <code>.env.local</code> setelah membuat project Supabase.
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-stack">
        {mode === "register" && (
          <>
            <label>
              Nama panggilan
              <input value={nama} onChange={(e) => setNama(e.target.value)} required maxLength={40} autoComplete="nickname" />
            </label>
          </>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Kata sandi (minimal 6 karakter)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-success" role="status">{message}</p>}
        <button className="button button-primary button-wide" disabled={busy}>
          {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
        </button>
      </form>

      <p className="auth-switch">
        {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <button type="button" className="text-button" onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
          setMessage("");
        }}>
          {mode === "login" ? "Daftar di sini" : "Masuk"}
        </button>
      </p>
      <p className="small muted">
        Untuk lingkungan sekolah, gunakan email/akun yang disetujui sekolah dan jangan membagikan kata sandi.
      </p>
    </section>
  );
}

