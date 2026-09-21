import fs from "fs";
import path from "path";
import { safePath } from "../utils/sandbox";
import { loadIgnoredPatterns, isIgnored } from "../utils/gitignore";

interface SearchMatch {
  file: string;
  line: number;
  text: string;
}

export function searchCode(dir: string, pattern: string): SearchMatch[] {
  const root = safePath(dir);
  const ignored = loadIgnoredPatterns(root);

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, "i");
  } catch {
    throw new Error(`Invalid regex pattern: ${pattern}`);
  }
  const matches: SearchMatch[] = [];

  function walk(current: string) {
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const relative = path.relative(root, full);

      if (isIgnored(relative, ignored)) continue;

      if (entry.isDirectory()) {
        walk(full);
      } else {
        let content: string;
        try {
          content = fs.readFileSync(full, "utf-8");
        } catch {
          continue;
        }

        content.split("\n").forEach((lineText, i) => {
          if (regex.test(lineText)) {
            matches.push({
              file: relative,
              line: i + 1,
              text: lineText.trim(),
            });
          }
        });
      }
    }
  }

  walk(root);
  return matches;
}
