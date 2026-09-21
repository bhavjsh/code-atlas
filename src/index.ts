#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { findEntryPoints } from "./tools/findEntryPoints";
import { listDependencies } from "./tools/listDependencies";
import { summarizeFolder } from "./tools/summarizeFolder";
import { readFile } from "./tools/readFile";
import { getFileTree } from "./tools/getFileTree";
import { detectStack } from "./tools/detectStack";
import { searchCode } from "./tools/searchCode";
import { findTodos } from "./tools/findTodos";

const server = new McpServer({
  name: "code-atlas",
  version: "1.0.0",
});

server.tool(
  "find_entry_points",
  "Scans the workspace and finds all entry point files like index.ts, main.py, Dockerfile etc.",
  {
    dir: z.string().optional().describe("Directory to scan. Defaults to workspace root."),
  },
  async ({ dir }: { dir?: string }) => {
    try {
      const results = await findEntryPoints(dir ?? ".");
      const text = results.length
        ? `Found ${results.length} entry point(s):\n\n` + results.join("\n")
        : "No entry points found.";
      return { content: [{ type: "text", text }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "list_dependencies",
  "Traces all local imports inside a given file, ignoring node_modules.",
  {
    file: z.string().describe("Relative path to the file to trace. e.g. src/index.ts"),
  },
  async ({ file }: { file: string }) => {
    try {
      const deps = listDependencies(file);
      const text = deps.length
        ? `Found ${deps.length} local import(s):\n\n` + deps.join("\n")
        : "No local imports found.";
      return { content: [{ type: "text", text }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "summarize_folder",
  "Inspects a folder and summarizes its architectural role.",
  {
    path: z.string().describe("Relative path to the folder. e.g. src/utils"),
  },
  async ({ path }: { path: string }) => {
    try {
      const summary = summarizeFolder(path);
      const text = `Role: ${summary.role}\nFiles (${summary.fileCount}): ${summary.files.join(", ")}`;
      return { content: [{ type: "text", text }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "read_file",
  "Reads the content of a file safely within the workspace sandbox.",
  {
    file: z.string().describe("Relative path to the file. e.g. src/index.ts"),
  },
  async ({ file }: { file: string }) => {
    try {
      const content = readFile(file);
      return { content: [{ type: "text", text: content }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "get_file_tree",
  "Returns the full folder/file structure of the workspace as a readable tree string.",
  {
    dir: z.string().optional().describe("Directory to start from. Defaults to workspace root."),
  },
  async ({ dir }: { dir?: string }) => {
    try {
      const tree = getFileTree(dir ?? ".");
      return { content: [{ type: "text", text: tree }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "detect_stack",
  "Scans package.json, Dockerfile, requirements.txt, go.mod etc. and returns detected technologies.",
  {
    dir: z.string().optional().describe("Directory to scan. Defaults to workspace root."),
  },
  async ({ dir }: { dir?: string }) => {
    try {
      const result = detectStack(dir ?? ".");
      const text = result.detected.length
        ? `Detected stack (from: ${result.sources.join(", ")}):\n\n` +
          result.detected.map((t: string) => `• ${t}`).join("\n")
        : "No recognizable stack indicators found.";
      return { content: [{ type: "text", text }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "search_code",
  "Searches all non-ignored files for a keyword or regex pattern, returning matching lines with file path and line number.",
  {
    pattern: z.string().describe("Keyword or regex pattern to search for."),
    dir: z.string().optional().describe("Directory to search in. Defaults to workspace root."),
  },
  async ({ pattern, dir }: { pattern: string; dir?: string }) => {
    try {
      const matches = searchCode(dir ?? ".", pattern);
      if (!matches.length) {
        return { content: [{ type: "text", text: `No matches found for: ${pattern}` }] };
      }
      const text = matches
        .map((m) => `${m.file}:${m.line}  ${m.text}`)
        .join("\n");
      return { content: [{ type: "text", text: `Found ${matches.length} match(es):\n\n${text}` }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "find_todos",
  "Scans all files for TODO, FIXME, HACK, NOTE comments and returns them grouped by file.",
  {
    dir: z.string().optional().describe("Directory to scan. Defaults to workspace root."),
  },
  async ({ dir }: { dir?: string }) => {
    try {
      const todoMap = findTodos(dir ?? ".");
      const files = Object.keys(todoMap);
      if (!files.length) {
        return { content: [{ type: "text", text: "No TODO/FIXME/HACK/NOTE comments found." }] };
      }
      const lines: string[] = [];
      for (const file of files) {
        lines.push(`\n${file}`);
        for (const item of todoMap[file]) {
          lines.push(`  Line ${item.line} [${item.tag}] ${item.text}`);
        }
      }
      const total = files.reduce((sum, f) => sum + todoMap[f].length, 0);
      return { content: [{ type: "text", text: `Found ${total} comment(s) across ${files.length} file(s):${lines.join("\n")}` }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Code Atlas MCP server running...");
}

main();
