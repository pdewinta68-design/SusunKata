import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { WordSearchGame } from "@/components/games/WordSearchGame";
import { getBab } from "@/lib/content";

export default async function WordSearchPage({ searchParams }: { searchParams: Promise<{ bab?: string }> }) {
  const query = await searchParams;
  const bab = getBab(query.bab || "keluarga") ?? getBab("keluarga")!;
  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <div className="breadcrumb"><Link href={`/bab/${bab.slug}`}>{bab.judul_id}</Link> / Pencari kata</div>
        <section className="page-heading">
          <div className="eyebrow">GAME 03 · OBSERVASI HURUF</div>
          <h1>Pencari Kata</h1>
          <p>Temukan kata Arab dalam grid 10×10. Kata dapat mendatar dari kanan ke kiri, menurun, atau diagonal.</p>
        </section>
        <section className="panel">
          <h2>Bab {bab.judul_id}</h2>
          <WordSearchGame words={bab.mufradat} babId={bab.slug} />
        </section>
        <footer className="site-footer"><Link href={`/bab/${bab.slug}`}>← Kembali ke bab</Link></footer>
      </main>
    </>
  );
}
