import fs from "fs";
import { safePath } from "../utils/sandbox";

export function listDependencies(
  filePath: string,
  visited = new Set<string>()
): string[] {
  const resolved = safePath(filePath);

  if (visited.has(resolved)) return [];
  visited.add(resolved);

  const content = fs.readFileSync(resolved, "utf-8");
  const imports: string[] = [];
  const regex = /(?:import|require)\s*(?:\(?\s*['"])(\.{1,2}\/[^'"]+)['"]/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}
