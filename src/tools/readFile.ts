import fs from "fs";
import { safePath } from "../utils/sandbox";

export function readFile(filePath: string): string {
  const resolved = safePath(filePath);
  return fs.readFileSync(resolved, "utf-8");
}
