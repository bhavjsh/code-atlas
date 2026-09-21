import path from "path";

const ROOT = process.cwd();

export function safePath(input: string): string {
  const resolved = path.resolve(ROOT, input);

  // resolved must equal ROOT exactly or be a child of it.
  // Checking startsWith(ROOT) alone would allow "code-atlas-evil" to pass
  // because it shares the same prefix string.
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (resolved !== ROOT && !resolved.startsWith(rootWithSep)) {
    throw new Error(`Access denied: path outside workspace → ${input}`);
  }

  return resolved;
}
