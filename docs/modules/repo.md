# Repo Module & AI Refactor Engine

Modul untuk mencari, mengulas, memilih repositori GitHub, serta merefaktor berkas kode riil secara otonom dan non-gimmick.

## Fitur Utama
- Pencarian dan pemilihan repositori GitHub (publik & privat dengan PAT).
- Pengambilan detail deskripsi dan berkas `README.md` secara asinkron.
- **AI Commit Range Summarizer**:
  - Tombol aksi terintegrasi di komponen `CommitHistory` untuk merangkum rentang commit pilihan.
  - Selektor interaktif rentang commit (Base SHA ke Head SHA) dengan penghitungan jumlah commit otomatis.
  - Ringkasan perubahan *human-readable* bertenaga Gemini 3.8 Flash (ikhtisar naratif, kategorisasi poin perubahan, analisis dampak, dan catatan rilis).
  - Ekspor/salin instan ringkasan dalam format Markdown rapi ke *clipboard*.
  - *Fail-safe deterministic summary generator* saat koneksi jaringan atau kuota terbatas.
  - Pemindaian berkas kandidat riil berdasarkan batas baris SOP (<125 baris) dan kompleksitas.
  - Analisis AST & dekomposisi modular bertenaga Gemini AI dengan *fallback deterministic transformer*.
  - **Multi-File Decomposition Splitter**: Pemecahan berkas monolitik menjadi berkas utama dan sub-komponen terisolasi secara atomik.
  - **In-Memory TypeScript AST Syntax Validator**: Validasi sintaks dan aturan SOP (100% type-safe, error logging standard) sebelum kode ditulis ke disk.
  - Penulisan langsung ke berkas (`fs.writeFileSync`) dan pembuatan *commit* Git riil otomatis.
  - Integrasi visualisasi metrik (baris sebelum vs sesudah) dan audit aturan memori SOP.

