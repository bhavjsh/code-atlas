# Code Atlas

Code Atlas is an MCP (Model Context Protocol) server that helps you and your AI assistant understand any codebase quickly. Instead of manually digging through files, you get a set of structured tools that can map entry points, trace imports, detect the tech stack, and search across the whole repo, directly from within your editor or agent.

It is useful when you are:

- Jumping into an unfamiliar repository
- Onboarding to a new project
- Letting an AI assistant navigate your codebase accurately
- Auditing code for TODOs, patterns, or structure

---

## What It Does

| Tool | Description |
|------|-------------|
| `find_entry_points` | Scans the workspace and returns all entry point files (`index.ts`, `main.py`, `Dockerfile`, etc.) |
| `list_dependencies` | Lists all local imports inside a given file |
| `summarize_folder` | Identifies the role of a folder such as API layer, models, utilities, or tests |
| `read_file` | Reads the content of any file, sandboxed to the project root |
| `get_file_tree` | Returns the full directory structure as a readable tree, filtered by `.gitignore` |
| `detect_stack` | Detects the tech stack by reading `package.json`, `Dockerfile`, `requirements.txt`, `go.mod`, and similar files |
| `search_code` | Searches all non-ignored files for a keyword or regex pattern, returning matching lines with file and line number |
| `find_todos` | Finds all `TODO`, `FIXME`, `HACK`, and `NOTE` comments across the codebase, grouped by file |

All tools are sandboxed to the workspace root. No file access is permitted outside the project directory.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)

Check your versions:

```bash
node -v
npm -v
```

### 1. Clone the repository

```bash
git clone https://github.com/bhavjsh/code-atlas.git
cd code-atlas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

Compiled output goes into the `dist/` folder.

### 4. Start the server

```bash
npm start
```

The server starts and listens over stdio for MCP requests.

---

## Development

Run without a build step using `tsx`:

```bash
npm run dev
```

---

## Connecting to an MCP Client

Add this to your MCP client's configuration file, replacing the path with the actual location on your machine:

```json
{
  "mcpServers": {
    "code-atlas": {
      "command": "node",
      "args": ["/absolute/path/to/code-atlas/dist/index.js"]
    }
  }
}
```

Restart your client and all 8 tools will be available.

Works with any MCP-compatible host that supports stdio transport, including Cursor and VS Code MCP extensions.

---

## Project Structure

```
src/
├── index.ts                  (entry point, registers all tools)
├── tools/
│   ├── findEntryPoints.ts
│   ├── listDependencies.ts
│   ├── summarizeFolder.ts
│   ├── readFile.ts
│   ├── getFileTree.ts
│   ├── detectStack.ts
│   ├── searchCode.ts
│   └── findTodos.ts
└── utils/
    ├── sandbox.ts            (blocks access outside the workspace root)
    └── gitignore.ts          (loads and applies .gitignore patterns)
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compiles TypeScript source to `dist/` |
| `npm run dev` | Runs the server directly with `tsx`, no build needed |
| `npm start` | Runs the compiled server from `dist/` |

---

## Tech Stack

- Node.js
- TypeScript
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [zod](https://github.com/colinhacks/zod)

---

## License

MIT
