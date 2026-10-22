import Link from "next/link";
import { BookOpen, Home, LogIn } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Lughati Play beranda">
        <span className="brand-mark" aria-hidden="true">🐪</span>
        <span>
          <strong>Lughati Play</strong>
          <small>Belajar Bahasa Arab</small>
        </span>
      </Link>
      <nav className="nav-links" aria-label="Navigasi utama">
        <Link href="/"><Home size={17} /> Beranda</Link>
        <Link href="/#bab"><BookOpen size={17} /> Bab belajar</Link>
        <Link href="/login"><LogIn size={17} /> Masuk</Link>
      </nav>
    </header>
  );
}
