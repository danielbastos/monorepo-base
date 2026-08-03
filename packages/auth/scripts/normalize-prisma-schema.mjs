import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const schemaPath = resolve(process.cwd(), "../database/prisma/schema.prisma");
const source = await readFile(schemaPath, "utf8");
const normalized = source
  .replace(
    'provider = "prisma-client-js"',
    'provider = "prisma-client"\n  output   = "../src/generated/prisma"',
  )
  .replace(/\n\s*url\s*=\s*env\("DATABASE_URL"\)/, "");

await writeFile(schemaPath, normalized);
