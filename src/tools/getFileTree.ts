import fs from "fs";
import path from "path";
import { safePath } from "../utils/sandbox";
import { loadIgnoredPatterns, isIgnored } from "../utils/gitignore";

export function getFileTree(dir: string = "."): string {
  const root = safePath(dir);
  const ignored = loadIgnoredPatterns(root);
  const lines: string[] = [];

  function walk(current: string, prefix: string) {
    const allEntries = fs.readdirSync(current, { withFileTypes: true });

    // Filter ignored entries before computing isLast so tree connectors are correct
    const entries = allEntries.filter((entry) => {
      const relative = path.relative(root, path.join(current, entry.name));
      return !isIgnored(relative, ignored);
    });

    entries.forEach((entry, i) => {
      const isLast = i === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = isLast ? prefix + "    " : prefix + "│   ";

      lines.push(prefix + connector + entry.name);

      if (entry.isDirectory()) {
        walk(path.join(current, entry.name), childPrefix);
      }
    });
  }

  lines.push(path.basename(root));
  walk(root, "");
  return lines.join("\n");
}
