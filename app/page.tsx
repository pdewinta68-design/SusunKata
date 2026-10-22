import Link from "next/link";
import { ArrowUpRight, BookOpen, Brain, GraduationCap, Search, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ArabicText } from "@/components/arabic-text";
import { getBabList } from "@/lib/content";

const features = [
  { icon: "🧩", title: "Belajar sambil bermain", text: "Cocokkan kata, temukan kosakata, dan selesaikan teka-teki dengan aktivitas singkat." },
  { icon: "🔤", title: "Arab berharakat", text: "Daftar mufradat menampilkan harakat; grid game memakai huruf tanpa harakat agar mudah dicari." },
  { icon: "⭐", title: "Apresiasi kemajuan", text: "Skor dan bintang digunakan sebagai umpan balik, bukan untuk mempermalukan siswa." },
  { icon: "👩‍🏫", title: "Dukungan guru", text: "Guru dapat membuat kelas, membagikan kode kelas, dan memantau progres saat database aktif." },
  { icon: "🗣️", title: "Empat maharah", text: "Konten dirancang untuk dikembangkan menuju istima', kalam, qira'ah, dan kitabah." },
  { icon: "🐪", title: "Ramah anak", text: "Tampilan sederhana, tombol besar, tanpa iklan, dan mendukung pengurangan animasi." }
];

export default function HomePage() {
  const chapters = getBabList();
  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <section className="hero-grid">
          <div className="hero-main">
            <div className="eyebrow">BELAJAR · BERMAIN · BERTUMBUH</div>
            <h1>Bahasa Arab jadi lebih dekat, seru, dan bermakna.</h1>
            <p>Media pembelajaran berbasis permainan untuk siswa MI dan MTs. Mulai dari mengenal mufradat sampai berlatih membaca, mendengar, dan berbicara.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link className="button button-amber" href="#bab">Mulai jelajahi bab <ArrowUpRight size={17} /></Link>
              <Link className="button button-soft" href="/login">Masuk sebagai siswa/guru</Link>
            </div>
          </div>
          <aside className="hero-aside">
            <div>
              <div className="eyebrow">TEMAN BELAJAR</div>
              <div className="hero-mascot" aria-hidden="true">🐪</div>
              <h2>Satu langkah kecil setiap hari.</h2>
              <p className="muted">Latihan singkat, pengulangan bermakna, dan apresiasi untuk setiap kemajuan.</p>
            </div>
            <div className="stats-row">
              <div className="stat-box"><p className="small muted">Jenjang</p><strong>MI</strong></div>
              <div className="stat-box"><p className="small muted">Jenjang</p><strong>MTs</strong></div>
            </div>
          </aside>
        </section>

        <section id="bab" className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">MATERI PEMBELAJARAN</div>
              <h2>Pilih bab untuk mulai belajar</h2>
            </div>
            <p className="muted">Konten contoh bersifat orisinal dan ditandai untuk verifikasi penutur/dosen sebelum dipakai dalam pembelajaran resmi.</p>
          </div>
          <div className="chapter-grid">
            {chapters.map((chapter) => (
              <article className="chapter-card" key={chapter.slug}>
                <ArabicText className="chapter-arabic">{chapter.judul}</ArabicText>
                <h3>{chapter.judul_id}</h3>
                <p>{chapter.deskripsi}</p>
                <div className="chapter-footer">
                  <span className="pill">{chapter.jenjang.join(" · ")}</span>
                  <Link className="button button-primary" href={`/bab/${chapter.slug}`}>Buka bab <ArrowUpRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="eyebrow">DIBANGUN DENGAN TUJUAN BELAJAR</div>
          <h2>Teknologi melayani pedagogi</h2>
          <div className="feature-grid mt-6">
            {features.map((feature, index) => (
              <article className="feature-card" key={feature.title}>
                <div className="flex items-center justify-between">
                  <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
                  <span className="small muted font-bold">0{index + 1}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="panel">
            <div className="eyebrow">MULAI DARI YANG SEDERHANA</div>
            <h2>Siap mencoba latihan pertama?</h2>
            <p className="muted">Pilih bab Keluargaku, lalu coba Memory Match, teka-teki silang, atau pencari kata. Login dan penyimpanan progres memerlukan konfigurasi Supabase.</p>
            <div className="game-links">
              <Link className="button button-primary" href="/game/memory?bab=keluarga"><Brain size={17} /> Memory Match</Link>
              <Link className="button button-soft" href="/game/tts?bab=keluarga"><BookOpen size={17} /> Teka-teki silang</Link>
              <Link className="button button-soft" href="/game/wordsearch?bab=keluarga"><Search size={17} /> Pencari kata</Link>
              <Link className="button button-soft" href="/login"><GraduationCap size={17} /> Dashboard</Link>
            </div>
          </div>
        </section>
        <footer className="site-footer">Lughati Play · Starter media pembelajaran Bahasa Arab · Versi pengembangan awal <Star className="inline" size={14} /></footer>
      </main>
    </>
  );
}
