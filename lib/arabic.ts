/** Normalisasi untuk pencocokan jawaban, bukan untuk mengubah teks yang ditampilkan. */
export function normaliseArabic(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, "")
    .trim();
}
