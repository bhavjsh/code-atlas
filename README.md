# Code Atlas: MCP Server for Codebase Analysis

Code Atlas is a Model Context Protocol (MCP) server that gives any MCP-compatible editor or agent a structured set of tools to read, search, and understand a codebase. Connect it once and your assistant can map entry points, trace imports, detect the stack, grep across the repo, and surface TODOs without you having to do any of it manually.

Built for developers who want their AI assistant to actually understand the project, not just guess at it.

![Architecture](assets/architecture.svg)

## What It Can Do

- **Find Entry Points:** Scans the workspace and returns all entry point files such as `index.ts`, `main.py`, and `Dockerfile`
- **List Dependencies:** Traces all local imports inside a given file
- **Summarize Folder:** Identifies the architectural role of a folder (API layer, models, utilities, tests, and more)
- **Read File:** Reads any file in the workspace safely, sandboxed to the project root
- **Get File Tree:** Returns the full directory structure as a readable tree, filtered by `.gitignore`
- **Detect Stack:** Reads `package.json`, `Dockerfile`, `requirements.txt`, `go.mod`, and similar files to identify the tech stack
- **Search Code:** Searches all non-ignored files for a keyword or regex pattern, returning results with file path and line number
- **Find TODOs:** Collects every `TODO`, `FIXME`, `HACK`, and `NOTE` comment across the codebase, grouped by file

## Architecture

**Server:** TypeScript with `@modelcontextprotocol/sdk` over stdio transport

**Schema Validation:** Zod for all tool input definitions

**Security:** Every tool routes through `safePath()` which resolves inputs to absolute paths and rejects anything outside the workspace root, including sibling directories that share a name prefix

**Filtering:** `.gitignore` patterns are loaded at runtime and applied across all file-walking tools

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

Verify your setup:

```bash
node -v
npm -v
```

### Installation

```bash
git clone https://github.com/bhavjsh/code-atlas.git
cd code-atlas
npm install
npm run build
```

### Running the Server

```bash
npm start
```

For development without a build step:

```bash
npm run dev
```

## Using Code Atlas on Any Project

Code Atlas runs against whatever directory you point it at. You can use it on any codebase, not just this one.

### Step 1 — Clone and build Code Atlas once

```bash
git clone https://github.com/bhavjsh/code-atlas.git
cd code-atlas
npm install
npm run build
```

### Step 2 — Open your target project in Cursor (or any MCP client)

Navigate to the project you want to analyse, for example:

```bash
cd /path/to/your/other-project
```

### Step 3 — Add Code Atlas to your MCP client config

In Cursor, open **Settings > MCP** and add the following, replacing the path with where you cloned Code Atlas:

```json
{
  "mcpServers": {
    "code-atlas": {
      "command": "node",
      "args": ["/absolute/path/to/code-atlas/dist/index.js"],
      "cwd": "/path/to/your/other-project"
    }
  }
}
```

The `cwd` field tells Code Atlas which project to treat as the workspace root. All tools will read from and scan that directory.

Restart Cursor. All 8 tools will appear in your agent panel automatically.

### Step 4 — Start asking questions

Once connected, your AI assistant can use Code Atlas tools on its own. Some useful starting points:

- **"Show me the file tree"** — runs `get_file_tree`, gives you a full map of the project
- **"What stack is this project using?"** — runs `detect_stack`, reads config files and returns the technologies
- **"Where is authentication handled?"** — runs `search_code` with a keyword like `auth` and returns every matching file and line
- **"What are all the entry points?"** — runs `find_entry_points`, surfaces `main.py`, `index.ts`, `Dockerfile`, etc.
- **"What is left to fix in this codebase?"** — runs `find_todos`, collects every TODO and FIXME across the repo
- **"What does this file import?"** — runs `list_dependencies` on any file and traces its local imports
- **"What is the role of the src/api folder?"** — runs `summarize_folder` and labels it by architectural role

You do not need to paste any code manually. The agent reads the project itself.

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

## Tech Stack

- Node.js
- TypeScript
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [zod](https://github.com/colinhacks/zod)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm run dev` | Runs the server directly with `tsx` |
| `npm start` | Runs the compiled server |

## License

MIT
