import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { MemoryGame } from "@/components/games/MemoryGame";
import { getBab } from "@/lib/content";

export default async function MemoryPage({ searchParams }: { searchParams: Promise<{ bab?: string }> }) {
  const query = await searchParams;
  const bab = getBab(query.bab || "keluarga") ?? getBab("keluarga")!;
  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <div className="breadcrumb"><Link href={`/bab/${bab.slug}`}>{bab.judul_id}</Link> / Memory Match</div>
        <section className="page-heading">
          <div className="eyebrow">GAME 01 · MUFRADAT</div>
          <h1>Memory Match</h1>
          <p>Buka dua kartu untuk mencocokkan gambar dan kata Arab. Pasangan yang cocok akan tetap terbuka.</p>
        </section>
        <section className="panel">
          <h2>{bab.judul_id} <span className="muted">— <span lang="ar" dir="rtl">{bab.judul}</span></span></h2>
          <MemoryGame words={bab.mufradat} babId={bab.slug} />
        </section>
        <footer className="site-footer"><Link href={`/bab/${bab.slug}`}>← Kembali ke bab</Link></footer>
      </main>
    </>
  );
}

