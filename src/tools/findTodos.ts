import fs from "fs";
import path from "path";
import { safePath } from "../utils/sandbox";
import { loadIgnoredPatterns, isIgnored } from "../utils/gitignore";

interface TodoItem {
  line: number;
  tag: string;
  text: string;
}

type TodoMap = Record<string, TodoItem[]>;

const TODO_REGEX = /\b(TODO|FIXME|HACK|NOTE)\b[:\s]*(.*)/i;

export function findTodos(dir: string = "."): TodoMap {
  const root = safePath(dir);
  const ignored = loadIgnoredPatterns(root);
  const result: TodoMap = {};

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
          const match = TODO_REGEX.exec(lineText);
          if (match) {
            if (!result[relative]) result[relative] = [];
            result[relative].push({
              line: i + 1,
              tag: match[1].toUpperCase(),
              text: match[2].trim(),
            });
          }
        });
      }
    }
  }

  walk(root);
  return result;
}
