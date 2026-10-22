import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CrosswordGame } from "@/components/games/CrosswordGame";
import { getBab } from "@/lib/content";

export default async function TtsPage({ searchParams }: { searchParams: Promise<{ bab?: string }> }) {
  const query = await searchParams;
  const bab = getBab(query.bab || "keluarga") ?? getBab("keluarga")!;
  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <div className="breadcrumb"><Link href={`/bab/${bab.slug}`}>{bab.judul_id}</Link> / Teka-teki silang</div>
        <section className="page-heading">
          <div className="eyebrow">GAME 02 · PEMECAHAN MASALAH</div>
          <h1>Teka-teki Silang</h1>
          <p>Jawab petunjuk visual dan arti dalam Bahasa Indonesia. Gunakan papan huruf Arab jika perangkat tidak memiliki keyboard Arab.</p>
        </section>
        <section className="panel">
          <h2>Bab {bab.judul_id}</h2>
          <CrosswordGame words={bab.mufradat} babId={bab.slug} />
        </section>
        <footer className="site-footer"><Link href={`/bab/${bab.slug}`}>← Kembali ke bab</Link></footer>
      </main>
    </>
  );
}
