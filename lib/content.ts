import indexData from "@/content/bab/index.json";
import keluargaData from "@/content/bab/keluarga.json";
import sekolahData from "@/content/bab/sekolah.json";

export type Mufradat = {
  id: string;
  arab: string;
  tanpa_harakat: string;
  arti: string;
  emoji: string;
  audio: string | null;
};

export type Bab = {
  slug: string;
  judul: string;
  judul_id: string;
  jenjang: string[];
  deskripsi: string;
  status_verifikasi: string;
  tujuan: string[];
  mufradat: Mufradat[];
};

export type BabSummary = Pick<Bab, "slug" | "judul" | "judul_id" | "jenjang" | "deskripsi">;

const babMap: Record<string, Bab> = {
  keluarga: keluargaData as Bab,
  sekolah: sekolahData as Bab
};

export function getBab(slug: string): Bab | undefined {
  return babMap[slug];
}

export function getBabList(): BabSummary[] {
  return indexData as BabSummary[];
}
