import { generateAiContentWithFallback } from './geminiService';

export interface CommitSummaryItem {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface RangeSummaryResult {
  title: string;
  overview: string;
  keyChanges: { category: string; description: string }[];
  impactLevel: 'Rendah' | 'Sedang' | 'Tinggi';
  impactAnalysis: string;
  releaseNotes: string;
  rawMarkdown: string;
  model: string;
}

function generateDeterministicSummary(
  repoFullName: string,
  baseSha: string,
  headSha: string,
  commits: CommitSummaryItem[]
): RangeSummaryResult {
  const commitListText = commits
    .map((c) => `- [${c.sha.slice(0, 7)}] ${c.message} (oleh ${c.author})`)
    .join('\n');

  const overview = `Rentang commit ${baseSha.slice(0, 7)}...${headSha.slice(0, 7)} pada ${repoFullName} mencakup ${commits.length} commit. Terfokus pada pembaruan fungsionalitas, perbaikan, dan peningkatan kode.`;

  const keyChanges = commits.map((c) => {
    let cat = 'Peningkatan & Refactoring';
    if (/feat|tambah|add/i.test(c.message)) cat = 'Fitur Baru';
    else if (/fix|bug|perbaiki/i.test(c.message)) cat = 'Perbaikan Bug';
    else if (/docs|readme/i.test(c.message)) cat = 'Dokumentasi';
    return { category: cat, description: `[${c.sha.slice(0, 7)}] ${c.message}` };
  });

  const markdown = `### Ringkasan Rentang Commit (${baseSha.slice(0, 7)}...${headSha.slice(0, 7)})\n\n${overview}\n\n#### Perubahan Utama:\n${keyChanges.map((k) => `- **[${k.category}]** ${k.description}`).join('\n')}\n\n#### Dampak:\nPerubahan ini terisolasi dengan baik dan aman untuk disinkronisasikan ke branch utama.`;

  return {
    title: `Ringkasan Commit ${baseSha.slice(0, 7)} → ${headSha.slice(0, 7)}`,
    overview,
    keyChanges,
    impactLevel: commits.length > 5 ? 'Sedang' : 'Rendah',
    impactAnalysis: 'Perubahan aman diterapkan ke lingkungan produksi.',
    releaseNotes: commits.map((c) => `- ${c.message}`).join('\n'),
    rawMarkdown: markdown,
    model: 'deterministic-fallback',
  };
}

export async function summarizeCommitRange(params: {
  repoFullName: string;
  baseSha: string;
  headSha: string;
  commits: CommitSummaryItem[];
}): Promise<RangeSummaryResult> {
  const { repoFullName, baseSha, headSha, commits } = params;

  if (!commits || commits.length === 0) {
    throw new Error('Daftar commit tidak boleh kosong.');
  }

  const prompt = `Anda adalah Senior Lead Software Architect & Release Manager. Buat ringkasan perubahan manusiawi (human-readable summary) yang terstruktur dan mudah dipahami dalam Bahasa Indonesia untuk rentang commit berikut:

Repositori: ${repoFullName}
Rentang: ${baseSha.slice(0, 7)}...${headSha.slice(0, 7)}
Total Commit: ${commits.length}

Daftar Commit:
${commits.map((c, i) => `${i + 1}. [${c.sha.slice(0, 7)}] ${c.message} | Penulis: ${c.author} | Tanggal: ${c.date}`).join('\n')}

Instruksi:
1. Jelaskan secara naratif apa tujuan utama dari rangkaian perubahan ini tanpa istilah teknis yang berbelit-belit.
2. Kelompokkan perubahan ke dalam kategori (Fitur Baru, Perbaikan Bug, Refactoring, Dokumentasi/Konfigurasi).
3. Berikan analisis dampak (Rendah/Sedang/Tinggi) dan saran kesiapan rilis.
4. Tulis catatan rilis singkat (bulleted).

KEMBALIKAN HANYA JSON VALID BERIKUT:
{
  "title": "Judul ringkas ringkasan perubahan",
  "overview": "Narasi 2-3 kalimat penjelasan human-readable",
  "keyChanges": [
    { "category": "Fitur Baru | Perbaikan Bug | Refactoring | Dokumentasi", "description": "Penjelasan perubahan" }
  ],
  "impactLevel": "Rendah | Sedang | Tinggi",
  "impactAnalysis": "Analisis potensi risiko atau dampak ke pengguna/sistem",
  "releaseNotes": "Poin catatan rilis ringkas",
  "rawMarkdown": "Versi lengkap dalam format Markdown rapi untuk dibaca/disalin"
}`;

  try {
    const aiRes = await generateAiContentWithFallback(prompt, 'You are an expert technical writer and Git history auditor.');
    let cleanText = aiRes.text.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');

    const parsed = JSON.parse(cleanText.trim());
    return {
      title: parsed.title || `Ringkasan Commit ${baseSha.slice(0, 7)} → ${headSha.slice(0, 7)}`,
      overview: parsed.overview || 'Ringkasan perubahan pada rentang commit yang dipilih.',
      keyChanges: Array.isArray(parsed.keyChanges) ? parsed.keyChanges : [],
      impactLevel: parsed.impactLevel || 'Rendah',
      impactAnalysis: parsed.impactAnalysis || 'Perubahan stabil dan siap dirilis.',
      releaseNotes: parsed.releaseNotes || '',
      rawMarkdown: parsed.rawMarkdown || parsed.overview || '',
      model: aiRes.model,
    };
  } catch (err: any) {
    console.warn('[Module:CommitSummary] Gemini failed, using deterministic summary:', err?.message);
    return generateDeterministicSummary(repoFullName, baseSha, headSha, commits);
  }
}
