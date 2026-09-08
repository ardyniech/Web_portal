export interface SupportedLanguageInfo {
  id: string;
  name: string;
  extensions: string[];
  codeTag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguageInfo[] = [
  { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx'], codeTag: 'typescript' },
  { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.jsx', '.mjs', '.cjs'], codeTag: 'javascript' },
  { id: 'python', name: 'Python', extensions: ['.py'], codeTag: 'python' },
  { id: 'rust', name: 'Rust', extensions: ['.rs'], codeTag: 'rust' },
  { id: 'go', name: 'Go', extensions: ['.go'], codeTag: 'go' },
  { id: 'java', name: 'Java', extensions: ['.java'], codeTag: 'java' },
  { id: 'kotlin', name: 'Kotlin', extensions: ['.kt', '.kts'], codeTag: 'kotlin' },
  { id: 'cpp', name: 'C / C++', extensions: ['.c', '.cpp', '.h', '.hpp'], codeTag: 'cpp' },
  { id: 'csharp', name: 'C#', extensions: ['.cs'], codeTag: 'csharp' },
  { id: 'php', name: 'PHP', extensions: ['.php'], codeTag: 'php' },
  { id: 'ruby', name: 'Ruby', extensions: ['.rb'], codeTag: 'ruby' },
  { id: 'swift', name: 'Swift', extensions: ['.swift'], codeTag: 'swift' },
  { id: 'dart', name: 'Dart/Flutter', extensions: ['.dart'], codeTag: 'dart' },
  { id: 'shell', name: 'Shell/Bash', extensions: ['.sh', '.bash'], codeTag: 'bash' },
  { id: 'sql', name: 'SQL Database', extensions: ['.sql'], codeTag: 'sql' },
  { id: 'web', name: 'HTML / CSS / SCSS', extensions: ['.html', '.css', '.scss'], codeTag: 'html' },
  { id: 'config', name: 'JSON / YAML / Markdown', extensions: ['.json', '.yaml', '.yml', '.md'], codeTag: 'json' },
];

export function detectLanguageByFilePath(filePath: string): SupportedLanguageInfo {
  const lower = filePath.toLowerCase();
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.extensions.some((ext) => lower.endsWith(ext))) {
      return lang;
    }
  }
  return { id: 'unknown', name: 'Text / Raw', extensions: [], codeTag: 'text' };
}
