import fs from "fs";
import path from "path";

const DEFAULT_IGNORE = [
  "node_modules",
  ".git",
  "dist",
  ".next",
  "__pycache__",
  ".env",
];

export function loadIgnoredPatterns(root: string): string[] {
  const gitignorePath = path.join(root, ".gitignore");
  const patterns = [...DEFAULT_IGNORE];

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    content
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line && !line.startsWith("#"))
      .forEach((line: string) => patterns.push(line));
  }

  return patterns;
}

export function isIgnored(filePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => filePath.includes(pattern));
}
