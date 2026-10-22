import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <section className="page-heading">
          <div className="eyebrow">404 · HALAMAN TIDAK DITEMUKAN</div>
          <h1>Sepertinya kita tersesat.</h1>
          <p className="muted">Bab atau halaman yang dicari belum tersedia.</p>
          <Link href="/" className="button button-primary">Kembali ke beranda</Link>
        </section>
      </main>
    </>
  );
}
