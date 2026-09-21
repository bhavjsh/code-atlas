import fs from "fs";
import path from "path";
import { safePath } from "../utils/sandbox";
import { loadIgnoredPatterns, isIgnored } from "../utils/gitignore";

const ENTRY_PATTERNS = [
  "index.ts",
  "index.js",
  "main.ts",
  "main.js",
  "main.py",
  "app.ts",
  "app.js",
  "app.py",
  "server.ts",
  "server.js",
  "docker-compose.yml",
  "Dockerfile",
];

export async function findEntryPoints(dir = "."): Promise<string[]> {
  const root = safePath(dir);
  const ignored = loadIgnoredPatterns(root);
  const results: string[] = [];

  function walk(current: string) {
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const relative = path.relative(root, full);

      if (isIgnored(relative, ignored)) continue;

      if (entry.isDirectory()) {
        walk(full);
      } else if (ENTRY_PATTERNS.includes(entry.name)) {
        results.push(relative);
      }
    }
  }

  walk(root);
  return results;
}
