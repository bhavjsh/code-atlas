import fs from "fs";
import path from "path";
import { safePath } from "../utils/sandbox";

interface StackResult {
  detected: string[];
  sources: string[];
}

export function detectStack(dir: string = "."): StackResult {
  const root = safePath(dir);
  const detected: string[] = [];
  const sources: string[] = [];

  function check(file: string, fn: (content: string) => string[]) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) {
      sources.push(file);
      const content = fs.readFileSync(full, "utf-8");
      detected.push(...fn(content));
    }
  }

  check("package.json", (content) => {
    const pkg = JSON.parse(content);
    const all = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    } as Record<string, string>;

    const hits: string[] = [];
    if (all["react"]) hits.push("React");
    if (all["next"]) hits.push("Next.js");
    if (all["vue"]) hits.push("Vue");
    if (all["svelte"]) hits.push("Svelte");
    if (all["express"]) hits.push("Express");
    if (all["fastify"]) hits.push("Fastify");
    if (all["@nestjs/core"]) hits.push("NestJS");
    if (all["typescript"] || all["ts-node"] || all["tsx"]) hits.push("TypeScript");
    if (all["jest"] || all["vitest"]) hits.push("Testing (Jest/Vitest)");
    if (all["prisma"] || all["@prisma/client"]) hits.push("Prisma");
    if (all["mongoose"]) hits.push("Mongoose / MongoDB");
    if (all["pg"] || all["postgres"]) hits.push("PostgreSQL");
    if (all["@modelcontextprotocol/sdk"]) hits.push("MCP (Model Context Protocol)");
    if (all["zod"]) hits.push("Zod");
    if (all["graphql"]) hits.push("GraphQL");
    if (all["tailwindcss"]) hits.push("Tailwind CSS");
    if (all["vite"]) hits.push("Vite");
    if (all["webpack"]) hits.push("Webpack");
    hits.push("Node.js");
    return hits;
  });

  check("requirements.txt", (content) => {
    const hits: string[] = ["Python"];
    if (content.includes("django")) hits.push("Django");
    if (content.includes("flask")) hits.push("Flask");
    if (content.includes("fastapi")) hits.push("FastAPI");
    if (content.includes("sqlalchemy")) hits.push("SQLAlchemy");
    if (content.includes("pydantic")) hits.push("Pydantic");
    if (content.includes("pytest")) hits.push("pytest");
    return hits;
  });

  check("pyproject.toml", (content) => {
    const hits: string[] = ["Python"];
    if (content.includes("django")) hits.push("Django");
    if (content.includes("flask")) hits.push("Flask");
    if (content.includes("fastapi")) hits.push("FastAPI");
    return hits;
  });

  check("go.mod", (content) => {
    const hits: string[] = ["Go"];
    if (content.includes("gin-gonic")) hits.push("Gin");
    if (content.includes("echo")) hits.push("Echo");
    return hits;
  });

  check("Cargo.toml", () => ["Rust"]);

  check("Dockerfile", (content) => {
    const hits: string[] = ["Docker"];
    const fromMatch = content.match(/^FROM\s+(\S+)/im);
    if (fromMatch) hits.push(`Base image: ${fromMatch[1]}`);
    return hits;
  });

  check("docker-compose.yml", () => ["Docker Compose"]);
  check("docker-compose.yaml", () => ["Docker Compose"]);

  if (fs.existsSync(path.join(root, ".github", "workflows"))) {
    detected.push("GitHub Actions");
    sources.push(".github/workflows/");
  }

  return { detected: [...new Set(detected)], sources };
}
