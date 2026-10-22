"use client";

import { FormEvent, useState } from "react";

export function JoinClassForm() {
  const [kode, setKode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode_kelas: kode.trim().toUpperCase() })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Tidak dapat bergabung ke kelas.");
      setMessage("Berhasil bergabung ke kelas. Muat ulang halaman untuk melihat daftar kelas.");
      setKode("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="join-form">
      <label htmlFor="kode-kelas">Kode kelas dari guru</label>
      <div className="join-row">
        <input id="kode-kelas" value={kode} onChange={(e) => setKode(e.target.value)} required maxLength={12} placeholder="Contoh: A1B2C3D4" autoCapitalize="characters" />
        <button className="button button-primary" disabled={busy}>{busy ? "Memproses..." : "Gabung kelas"}</button>
      </div>
      {message && <p className="form-success" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
