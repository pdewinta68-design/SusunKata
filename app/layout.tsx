import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lughati Play | Belajar Bahasa Arab",
  description: "Media pembelajaran Bahasa Arab berbasis permainan untuk siswa MI dan MTs."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
