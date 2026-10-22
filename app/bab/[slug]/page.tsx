import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BookOpen, Brain, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ArabicText } from "@/components/arabic-text";
import { getBab, getBabList } from "@/lib/content";

export function generateStaticParams() {
  return getBabList().map((bab) => ({ slug: bab.slug }));
}

export default async function BabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bab = getBab(slug);
  if (!bab) notFound();

  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <div className="breadcrumb"><Link href="/">Beranda</Link> / Bab / {bab.judul_id}</div>
        <section className="page-heading">
          <div className="eyebrow">BAB PEMBELAJARAN · {bab.jenjang.join(" / ")}</div>
          <h1><ArabicText>{bab.judul}</ArabicText> — {bab.judul_id}</h1>
          <p>{bab.deskripsi}</p>
          <div className="notice notice-warn">Status materi: {bab.status_verifikasi}. Mohon verifikasi ejaan, harakat, arti, dan konteks oleh penutur asli atau dosen Bahasa Arab sebelum dipublikasikan.</div>
        </section>

        <section className="panel">
          <h2>Tujuan belajar</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-700">
            {bab.tujuan.map((tujuan) => <li key={tujuan}>{tujuan}</li>)}
          </ul>
        </section>

        <section className="section">
          <div className="section-heading">
            <div><div className="eyebrow">MUFRADAT</div><h2>Kosakata bab ini</h2></div>
            <p className="muted">Baca kata dengan harakat. Gunakan tombol audio pada game sebagai pelafalan cadangan jika browser mendukungnya.</p>
          </div>
          <div className="vocab-grid">
            {bab.mufradat.map((word) => (
              <article className="vocab-card" key={word.id}>
                <span className="vocab-emoji" aria-hidden="true">{word.emoji}</span>
                <div className="vocab-word">
                  <ArabicText>{word.arab}</ArabicText>
                  <p>{word.arti}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="eyebrow">LATIHAN INTERAKTIF</div>
          <h2>Pilih permainan</h2>
          <div className="game-links">
            <Link className="button button-primary" href={`/game/memory?bab=${bab.slug}`}><Brain size={17} /> Memory Match <ArrowUpRight size={16} /></Link>
            <Link className="button button-soft" href={`/game/tts?bab=${bab.slug}`}><BookOpen size={17} /> Teka-teki silang <ArrowUpRight size={16} /></Link>
            <Link className="button button-soft" href={`/game/wordsearch?bab=${bab.slug}`}><Search size={17} /> Pencari kata <ArrowUpRight size={16} /></Link>
          </div>
        </section>
        <footer className="site-footer">Konten dibuat untuk demo pembelajaran dan perlu diverifikasi sebelum penggunaan resmi.</footer>
      </main>
    </>
  );
}
