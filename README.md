# Lughati Play — Media Pembelajaran Bahasa Arab

Starter full-stack untuk media pembelajaran Bahasa Arab berbasis permainan bagi siswa MI dan MTs. Dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, Supabase (Auth + PostgreSQL + Storage-ready), dan siap di-deploy ke Vercel.

> **Status:** fondasi MVP. Halaman, konten JSON, game Memory Match, teka-teki silang mini, Word Search, autentikasi, kelas, pencatatan progres, dan dashboard guru tersedia. Fitur produksi seperti moderasi konten, pengujian pengguna, dan penguatan keamanan operasional tetap harus ditinjau sebelum digunakan siswa sungguhan.

## Fitur yang tersedia

- Halaman beranda dan daftar bab dari `content/bab/index.json`.
- Konten mufradat orisinal dalam JSON, termasuk teks Arab berharakat, arti, emoji, bentuk tanpa harakat, dan status verifikasi.
- Halaman bab dinamis: `/bab/keluarga`, `/bab/sekolah`.
- Game Memory Match gambar/emoji–kata dengan skor dan cadangan pelafalan Web Speech API.
- Teka-teki silang mufradat dengan grid otomatis dan papan huruf Arab di layar.
- Word Search grid 10×10, termasuk arah mendatar kanan-ke-kiri, menurun, dan diagonal.
- Supabase Auth untuk pendaftaran/masuk guru dan siswa.
- Kelas guru, kode kelas, siswa bergabung dengan kode, dan pencatatan progres melalui API server.
- Dashboard guru untuk melihat kelas, anggota, dan progres yang tersimpan.
- SQL RLS policies dan fungsi join kelas.
- Middleware untuk memperbarui sesi Supabase.
- Tidak menggunakan iklan atau pelacak pihak ketiga.

## Persyaratan

- Node.js 20.9 atau lebih baru (disarankan versi LTS).
- npm.
- Akun GitHub dan Vercel.
- Akun Supabase jika ingin mengaktifkan login, kelas, dan penyimpanan progres.

## 1. Jalankan secara lokal

Ekstrak ZIP, lalu buka terminal di folder `lughati-play`.

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`. Jika menggunakan Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Jika belum menyiapkan Supabase, biarkan variabel contoh apa adanya: halaman publik dan game demo tetap bisa dicoba, tetapi login dan penyimpanan progres tidak aktif.

Jalankan server pengembangan:

```bash
npm run dev
```

Buka http://localhost:3000.

Pemeriksaan sebelum deploy:

```bash
npm run lint
npm run build
```

## 2. Aktifkan Supabase

1. Buat project di https://supabase.com/.
2. Buka **SQL Editor**.
3. Salin seluruh isi `supabase/schema.sql`, lalu jalankan.
4. Buka **Project Settings → API** (atau bagian API Keys sesuai tampilan dashboard).
5. Salin Project URL dan anon/publishable key ke `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=KEY_ANON_ATAU_PUBLISHABLE
```

6. Restart server lokal setelah mengubah `.env.local`.
7. Uji pendaftaran melalui `/login`. Pendaftaran publik otomatis membuat akun **siswa**.
8. Untuk membuat akun guru: daftarkan akun guru melalui `/login`, temukan UUID pengguna di **Authentication → Users**, lalu jalankan perintah berikut di SQL Editor sebagai admin project. Ganti UUID dengan ID akun guru yang benar:

```sql
update public.profiles
set peran = 'guru'
where id = 'GANTI-DENGAN-UUID-AKUN-GURU';
```

Jangan berikan akses SQL Editor kepada siswa. Jangan mengizinkan pendaftaran publik memilih peran guru di produksi.
9. Untuk aplikasi yang digunakan anak, atur kebijakan konfirmasi email, pemulihan akun, retensi data, dan persetujuan orang tua/sekolah sesuai kebijakan lembaga dan hukum yang berlaku.

**Penting:** jangan menaruh `service_role` key dalam kode frontend, file `.env` yang di-commit, atau variabel yang diawali `NEXT_PUBLIC_`. Starter ini tidak membutuhkan service-role key.

### Storage

`supabase/schema.sql` menyiapkan bucket privat `materi-pembelajaran` dengan policy dasar agar pengguna terautentikasi dapat membaca materi dan guru dapat mengunggahnya. Antarmuka unggah file belum dibuat pada MVP ini.

## 3. Upload ke GitHub

Buat repository kosong di GitHub, misalnya `lughati-play`. Dari terminal di folder proyek:

```bash
git init -b main
git add .
git commit -m "chore: initialize Lughati Play"
git branch -M main
git remote add origin https://github.com/USERNAME/lughati-play.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub milikmu. Jika Git meminta identitas:

```bash
git config --global user.name "Nama Kamu"
git config --global user.email "email-github@example.com"
```

Jangan commit `.env.local`; file itu sudah dikecualikan oleh `.gitignore`.

## 4. Deploy ke Vercel

1. Masuk ke https://vercel.com/ dengan akun GitHub.
2. Pilih **Add New → Project**.
3. Import repository `lughati-play`.
4. Framework akan terdeteksi sebagai Next.js. Gunakan pengaturan build default.
5. Pada **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy.
7. Setelah deployment selesai, buka URL yang diberikan Vercel.

Jika mengubah environment variables, lakukan redeploy. Setiap push ke `main` akan memicu deployment produksi; pull request biasanya memperoleh URL preview.

## 5. Cara menambah bab tanpa mengubah komponen game

1. Buat file baru, misalnya `content/bab/makanan.json`, mengikuti struktur `keluarga.json`.
2. Tambahkan metadata bab ke `content/bab/index.json`.
3. Impor file baru dan tambahkan ke `babMap` di `lib/content.ts`.

Contoh satu entri mufradat:

```json
{
  "id": "makanan-roti",
  "arab": "خُبْزٌ",
  "tanpa_harakat": "خبز",
  "arti": "Roti",
  "emoji": "🍞",
  "audio": null
}
```

Semua materi Arab buatan AI diberi status **perlu diverifikasi penutur/dosen**. Minta penutur asli atau dosen Bahasa Arab memeriksa ejaan, harakat, arti, dan konteks sebelum materi dipublikasikan.

## Struktur folder

```text
lughati-play/
├── app/
│   ├── api/classes/
│   ├── api/progress/
│   ├── bab/[slug]/
│   ├── dashboard/
│   ├── game/memory/
│   ├── game/tts/
│   ├── game/wordsearch/
│   ├── guru/
│   └── login/
├── components/
│   └── games/
├── content/bab/
├── lib/supabase/
├── supabase/schema.sql
├── .env.example
└── README.md
```

## Catatan pedagogi dan keamanan

- Grid permainan menggunakan huruf tanpa harakat; daftar mufradat tetap menampilkan harakat.
- Normalisasi jawaban menyamakan أ/إ/آ/ا dan ى/ي.
- Audio menggunakan Web Speech API sebagai cadangan, bukan pengganti rekaman penutur asli.
- Pengguna siswa hanya memerlukan nama panggilan dan kode kelas; hindari mengumpulkan data pribadi tambahan.
- Skor tidak digunakan untuk mempermalukan siswa. Gunakan sebagai umpan balik belajar.
- RLS wajib tetap aktif. Uji kebijakan dengan akun guru dan siswa terpisah sebelum mengisi data nyata.
- Starter ini belum menjalani audit keamanan, uji beban, atau uji kegunaan dengan anak. Lakukan uji coba terbatas dengan pendamping guru sebelum rilis.

## Rute

- `/` — beranda
- `/login` — masuk/daftar
- `/dashboard` — dashboard sesuai peran
- `/guru` — dashboard guru
- `/bab/keluarga` — bab keluarga
- `/bab/sekolah` — bab sekolah
- `/game/memory?bab=keluarga`
- `/game/tts?bab=keluarga`
- `/game/wordsearch?bab=keluarga`

