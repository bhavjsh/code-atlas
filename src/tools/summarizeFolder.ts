import fs from "fs";
import path from "path";
import { safePath } from "../utils/sandbox";

const ROLE_HINTS: [string[], string][] = [
  [["components", "ui", "views", "pages"], "Frontend Components"],
  [["routes", "controllers", "api"], "API Routes / Controllers"],
  [["models", "schema", "entities"], "Data Models / Schema"],
  [["migrations", "seeds"], "Database Migrations"],
  [["utils", "helpers", "lib"], "Utility / Helper Functions"],
  [["tests", "__tests__", "spec"], "Test Suite"],
  [["config", "settings"], "Configuration"],
  [["scripts", "bin", "cli"], "Scripts / CLI Tools"],
  [["hooks"], "React Hooks"],
  [["middleware"], "Middleware Layer"],
  [["types", "interfaces"], "Type Definitions"],
  [["store", "redux", "context"], "State Management"],
];

export function summarizeFolder(folderPath: string): {
  role: string;
  fileCount: number;
  files: string[];
} {
  const resolved = safePath(folderPath);
  const name = path.basename(resolved).toLowerCase();

  const files = fs.readdirSync(resolved).filter((f: string) => {
    const full = path.join(resolved, f);
    return fs.statSync(full).isFile();
  });

  for (const [keywords, role] of ROLE_HINTS) {
    if (keywords.some((k: string) => name.includes(k))) {
      return { role, fileCount: files.length, files };
    }
  }

  const exts = files.map((f: string) => path.extname(f).toLowerCase());

  if (exts.includes(".sql")) return { role: "Database Migrations", fileCount: files.length, files };
  if (exts.some((e: string) => [".test.ts", ".spec.ts", ".test.js"].includes(e)))
    return { role: "Test Suite", fileCount: files.length, files };
  if (exts.every((e: string) => [".ts", ".tsx"].includes(e)))
    return { role: "TypeScript Module", fileCount: files.length, files };
  if (exts.every((e: string) => [".py"].includes(e)))
    return { role: "Python Module", fileCount: files.length, files };

  return { role: "General Module", fileCount: files.length, files };
}
