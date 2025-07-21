# TixAI: AI Chat & Analytics untuk Event Organizer dan Esports

TixAI adalah platform berbasis Next.js yang memanfaatkan AI untuk membantu event organizer (termasuk esports) dalam menganalisis data, memprediksi tren, dan mengoptimalkan kesuksesan event. Sistem ini menyediakan chat AI interaktif, manajemen chat, serta integrasi analitik untuk pengambilan keputusan berbasis data.

## Fitur Utama

- **Chat AI untuk Event Organizer & Esports**: Dapatkan insight, prediksi, dan rekomendasi berbasis data event (peserta, tiket, feedback, dsb) serta data spesifik esports (statistik tim/pemain, format turnamen, engagement, sponsorship, viewership, dll).
- **Streaming & Persistence**: Respon AI secara real-time dengan penyimpanan riwayat chat di database.
- **Manajemen Chat**: Buat, update, hapus, dan kelola chat dengan sistem keamanan (RLS) per user.
- **Analitik & Visualisasi**: AI dapat menghasilkan chart (bar, line, pie, area) untuk analisis data event.
- **Integrasi Supabase**: Otentikasi, penyimpanan data, dan kebijakan keamanan berbasis Supabase.
- **Kompatibel Multi-Event**: Mendukung banyak organisasi/event dalam satu platform.

## Cara Menjalankan

1. **Clone repository & install dependencies**

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

2. **Jalankan development server**

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
```

Akses [http://localhost:3000](http://localhost:3000) di browser.

3. **Setup Supabase & Migrasi Database**

- Buat project di [Supabase](https://supabase.com/)
- Jalankan script migrasi di SQL Editor Supabase:
  - `create_chat_tables.sql` atau `migrate_chat_tables.sql`
- Update file `src/types/supabase.ts` dengan types terbaru:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

4. **Konfigurasi Environment**

Buat file `.env.local` dan isi dengan kredensial Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Login & Mulai Chat**

- Register/login di `/login`
- Mulai chat di halaman home, sistem otomatis membuat chat baru dan AI akan merespons.
- Lihat, kelola, dan lanjutkan chat di `/organizations/chat/[id]`.

## Struktur Direktori Penting

- `src/app/api/chat/route.ts` — API utama chat AI
- `src/components/layout/business/home/ChatBox.tsx` — Komponen input chat
- `src/tools/chat-store.ts` — Manajemen data chat
- `src/types/supabase.ts` — Tipe data Supabase
- `src/app/organizations/` — Halaman utama aplikasi (home, chat, settings)

## Fitur Keamanan

- Row Level Security (RLS) Supabase: data chat hanya bisa diakses user terkait
- Validasi & sanitasi input
- Error handling user-friendly

## Testing Checklist

- [ ] User bisa create chat baru
- [ ] AI langsung merespons & simpan pesan
- [ ] Chat list tampil & bisa dihapus
- [ ] RLS policies berjalan
- [ ] Streaming response aktif

## Kontribusi & Lisensi

Pull request dan feedback sangat diterima! Lihat dokumentasi Next.js dan Supabase untuk pengembangan lebih lanjut.

---

> Powered by Next.js, Supabase, and AI SDK
