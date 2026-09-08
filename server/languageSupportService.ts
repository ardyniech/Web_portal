import fs from 'fs';
import path from 'path';

export interface SupportedLanguageInfo {
  id: string;
  name: string;
  extensions: string[];
  codeTag: string;
  idioms?: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguageInfo[] = [
  { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx'], codeTag: 'typescript', idioms: 'Strict types, Async/Await, Generics, Pure Functions' },
  { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.jsx', '.mjs', '.cjs'], codeTag: 'javascript', idioms: 'ES6+ modules, Clean Promises' },
  { id: 'python', name: 'Python', extensions: ['.py', '.ipynb'], codeTag: 'python', idioms: 'PEP 8, Type Hints, List Comprehensions, Clean Exception Handling' },
  { id: 'rust', name: 'Rust', extensions: ['.rs'], codeTag: 'rust', idioms: 'Ownership/Borrowing, Result/Option, Zero-cost abstractions' },
  { id: 'go', name: 'Go', extensions: ['.go'], codeTag: 'go', idioms: 'Goroutines, Channels, Explicit Error Handling, Interfaces' },
  { id: 'java', name: 'Java', extensions: ['.java'], codeTag: 'java', idioms: 'OOP, Streams API, Records, Spring Boot clean patterns' },
  { id: 'kotlin', name: 'Kotlin', extensions: ['.kt', '.kts'], codeTag: 'kotlin', idioms: 'Null Safety, Coroutines, Extension Functions, Data Classes' },
  { id: 'cpp', name: 'C / C++', extensions: ['.c', '.cpp', '.cc', '.cxx', '.h', '.hpp'], codeTag: 'cpp', idioms: 'RAII, Smart Pointers, Const-correctness, Modern C++17/20' },
  { id: 'csharp', name: 'C#', extensions: ['.cs'], codeTag: 'csharp', idioms: 'LINQ, Async/Await, Pattern Matching, Clean .NET 8' },
  { id: 'php', name: 'PHP', extensions: ['.php'], codeTag: 'php', idioms: 'Strict Types (declare(strict_types=1)), PSR-12, OOP' },
  { id: 'ruby', name: 'Ruby', extensions: ['.rb'], codeTag: 'ruby', idioms: 'Idiomatic Ruby, Blocks/Procs, DRY, Clean Rails patterns' },
  { id: 'swift', name: 'Swift', extensions: ['.swift'], codeTag: 'swift', idioms: 'Value Types (Structs), Guard Let, Concurrency (async/await)' },
  { id: 'dart', name: 'Dart/Flutter', extensions: ['.dart'], codeTag: 'dart', idioms: 'Sound Null Safety, Immutable Widgets, Provider/Bloc' },
  { id: 'elixir', name: 'Elixir', extensions: ['.ex', '.exs'], codeTag: 'elixir', idioms: 'Pattern Matching, Pipe Operator (|>), Actor Model, OTP' },
  { id: 'haskell', name: 'Haskell', extensions: ['.hs'], codeTag: 'haskell', idioms: 'Pure Functional, Immutable State, Monads, Pattern Matching' },
  { id: 'scala', name: 'Scala', extensions: ['.scala'], codeTag: 'scala', idioms: 'Functional OOP, Pattern Matching, Immutable Collections' },
  { id: 'lua', name: 'Lua', extensions: ['.lua'], codeTag: 'lua', idioms: 'Metatables, Light Tables, Clean Scripting' },
  { id: 'zig', name: 'Zig', extensions: ['.zig'], codeTag: 'zig', idioms: 'Explicit Memory Allocation, Compile-Time (comptime)' },
  { id: 'nim', name: 'Nim', extensions: ['.nim'], codeTag: 'nim', idioms: 'Metaprogramming Macros, Clean Syntax, Efficient C Binding' },
  { id: 'vue', name: 'Vue.js', extensions: ['.vue'], codeTag: 'html', idioms: 'Composition API, Ref/Reactive, Single File Components' },
  { id: 'svelte', name: 'Svelte', extensions: ['.svelte'], codeTag: 'html', idioms: 'Svelte 5 Runes ($state, $derived), Reactive Declarations' },
  { id: 'solidity', name: 'Solidity (Smart Contracts)', extensions: ['.sol'], codeTag: 'solidity', idioms: 'SafeMath, Reentrancy Guard, Modifiers, Event Logs' },
  { id: 'shell', name: 'Shell/Bash', extensions: ['.sh', '.bash', '.zsh'], codeTag: 'bash', idioms: 'set -e, Shellcheck compliance, Safe Quotations' },
  { id: 'sql', name: 'SQL Database', extensions: ['.sql'], codeTag: 'sql', idioms: 'Parameterized Queries, ACID Transactions, Efficient Indexes' },
  { id: 'infra', name: 'Dockerfile / Terraform', extensions: ['dockerfile', '.tf', '.hcl'], codeTag: 'dockerfile', idioms: 'Multi-stage builds, Infrastructure as Code' },
  { id: 'config', name: 'JSON / YAML / TOML', extensions: ['.json', '.yaml', '.yml', '.toml', '.md'], codeTag: 'json', idioms: 'Strict Validation, Schema Alignment' },
];

export function detectLanguageByFilePath(filePath: string): SupportedLanguageInfo {
  const lower = filePath.toLowerCase();
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.extensions.some((ext) => lower.endsWith(ext) || lower.includes(ext))) {
      return lang;
    }
  }
  return { id: 'unknown', name: 'Text / Raw', extensions: [], codeTag: 'text' };
}

export function scanRepoLanguageFingerprint(workspaceRoot: string): { topLanguages: string[]; breakdownText: string } {
  const counts: Record<string, number> = {};
  let totalFiles = 0;

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (['node_modules', 'dist', '.git', 'coverage', '.next'].includes(item)) continue;
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile()) {
        const lang = detectLanguageByFilePath(full);
        if (lang.id !== 'unknown' && lang.id !== 'config') {
          counts[lang.name] = (counts[lang.name] || 0) + 1;
          totalFiles++;
        }
      }
    }
  }

  try {
    walk(workspaceRoot);
  } catch {
    // fallback
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topLanguages = sorted.map(([name]) => name);
  const breakdownParts = sorted.map(([name, count]) => `${name} (${Math.round((count / Math.max(1, totalFiles)) * 100)}%)`);
  const breakdownText = breakdownParts.length > 0 ? breakdownParts.join(', ') : 'TypeScript (100%)';

  return { topLanguages, breakdownText };
}
