# Code Atlas: MCP Server for Codebase Analysis

Code Atlas is a Model Context Protocol (MCP) server that gives your AI assistant structured tools to read, search, and understand any codebase. Connect it once and your assistant can map entry points, trace imports, detect the stack, and grep across the repo without you doing any of it manually.

Built for developers who want their AI assistant to actually understand the project, not just guess at it.

![Architecture](assets/architecture.svg)

---

## What It Can Do

- **Find Entry Points** — scans the workspace for `index.ts`, `main.py`, `Dockerfile`, and similar files
- **List Dependencies** — traces all local imports inside a given file
- **Summarize Folder** — identifies the role of a folder (API layer, models, utilities, tests, etc.)
- **Read File** — reads any file in the workspace, sandboxed to the project root
- **Get File Tree** — returns the full directory structure, filtered by `.gitignore`
- **Detect Stack** — reads `package.json`, `Dockerfile`, `requirements.txt`, `go.mod`, etc. to identify the tech stack
- **Search Code** — searches all files for a keyword or regex, returns matches with file path and line number
- **Find TODOs** — collects every `TODO`, `FIXME`, `HACK`, and `NOTE` comment, grouped by file

---

## Setup

**Requirements:** Node.js v18+ and npm

```bash
git clone https://github.com/bhavjsh/code-atlas.git
cd code-atlas
npm install
npm run build
```

---

## Using It on Your Project

**1. Add Code Atlas to Cursor**

Go to **Cursor Settings > MCP** and add this. Set `cwd` to the root of the project you want to analyse.

```json
{
  "mcpServers": {
    "code-atlas": {
      "command": "node",
      "args": ["/path/to/code-atlas/dist/index.js"],
      "cwd": "/path/to/your-project"
    }
  }
}
```

Restart Cursor. The tools are now active in your agent panel.

**2. Just ask questions — the assistant does the rest**

| What you ask | What it does |
|---|---|
| "Show me the file structure" | Maps the entire directory tree |
| "What stack is this project using?" | Reads config files and lists technologies |
| "Where is auth handled?" | Searches every file for the keyword |
| "What are the entry points?" | Finds all main/index/app files |
| "What TODOs are left?" | Lists every TODO and FIXME across the repo |
| "What does this file import?" | Traces all local imports in a file |
| "What is the role of this folder?" | Labels it by architectural purpose |

No file pasting, no manual searching. The assistant reads the project directly.

---

## Architecture

**Transport:** MCP stdio

**Validation:** Zod on all tool inputs

**Security:** Every file path is resolved and checked against the workspace root before any read happens

**Filtering:** `.gitignore` patterns are loaded at runtime and applied to all file walks

---

## Project Structure

```
code-atlas/
├── src/
│   ├── index.ts
│   ├── tools/
│   │   ├── findEntryPoints.ts
│   │   ├── listDependencies.ts
│   │   ├── summarizeFolder.ts
│   │   ├── readFile.ts
│   │   ├── getFileTree.ts
│   │   ├── detectStack.ts
│   │   ├── searchCode.ts
│   │   └── findTodos.ts
│   └── utils/
│       ├── sandbox.ts
│       └── gitignore.ts
├── package.json
└── tsconfig.json
```

---

## Tech Stack

- Node.js
- TypeScript
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [zod](https://github.com/colinhacks/zod)

---

## License

MIT
