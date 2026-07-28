/**
 * Converts epadm_new_design route sources into Next.js client module pages.
 * Run: npx tsx scripts/convert-module-sources.ts
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src");
const SRC_DIR = path.join(ROOT, "lib", "modules");
const OUT_DIR = path.join(ROOT, "lib", "modules", "pages");
const APP_DIR = path.join(ROOT, "app", "root", "[tenant]");

const REPLACEMENTS: [RegExp, string][] = [
  [/from "@tanstack\/react-router"/g, 'from "next/navigation"'],
  [/from "@\/components\/module-shell"/g, 'from "@/components/workspace/module-shell"'],
  [/from "@\/components\/inner-rail"/g, 'from "@/components/workspace/inner-rail"'],
  [/from "@\/components\/app-shell"/g, 'from "@/components/workspace/app-shell"'],
  [/from "@\/components\/page-toolbar"/g, 'from "@/components/workspace/page-toolbar"'],
  [/from "@\/components\/export-menu"/g, 'from "@/components/workspace/export-menu"'],
  [/from "@\/components\/ui\/button"/g, 'from "@/components/ui/button-base"'],
  [/from "@\/components\/ui\/select"/g, 'from "@/components/ui/select-radix"'],
  [/export const Route = createFileRoute\([^)]+\)\(\{[\s\S]*?\}\);\s*/g, ""],
  [/createFileRoute\([^)]+\)/g, ""],
  [/import \{ createFileRoute(?:, Link)?(?:, useNavigate)? \} from "next\/navigation";\n?/g, ""],
  [/import \{ Link, useNavigate \} from "next\/navigation";\n?/g, 'import Link from "next/link";\nimport { useRouter } from "next/navigation";\n'],
  [/import \{ Link \} from "next\/navigation";\n?/g, 'import Link from "next/link";\n'],
  [/import \{ useNavigate \} from "next\/navigation";\n?/g, 'import { useRouter } from "next/navigation";\n'],
  [/useNavigate\(\)/g, "useRouter()"],
  [/navigate\(\{ to: ([^,}]+)(?:, search: ([^}]+))?\s*\}\)/g, (_, to, search) => {
    if (search) return `router.push(${to} + "?" + new URLSearchParams(${search}).toString())`;
    return `router.push(${to})`;
  }],
  [/useRouterState\(\{ select: \(s\) => s\.location\.pathname \}\)/g, "usePathname()"],
  [/useRouterState\(\{ select: \(s\) => s\.location\.searchStr \}\)/g, 'useSearchParams().toString() ? "?" + useSearchParams().toString() : ""'],
  [/function (\w+)\(\)/g, 'export default function $1()'],
  [/export default function (\w+)\(\)/g, 'export default function $1()'],
];

function convert(content: string): string {
  let out = content;
  for (const [re, rep] of REPLACEMENTS) {
    out = out.replace(re, rep as string);
  }

  if (!out.startsWith('"use client"')) {
    out = '"use client";\n\n' + out;
  }

  // Wrap non-ModuleShell pages that used AppShell - keep AppShell removed (layout provides shell)
  out = out.replace(/<AppShell>\s*/g, "<>");
  out = out.replace(/<\/AppShell>/g, "</>");

  return out;
}

function pascalCase(name: string) {
  return name
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const sources = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".source.tsx"));

for (const file of sources) {
  const moduleName = file.replace(".source.tsx", "");
  if (moduleName === "index" || moduleName === "cms") continue;

  const raw = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
  const converted = convert(raw);
  const componentName = `${pascalCase(moduleName)}ModulePage`;
  const outFile = path.join(OUT_DIR, `${moduleName}.tsx`);

  const finalContent = converted.includes("export default")
    ? converted
    : converted.replace(/function (\w+Page)\(\)/, `export default function ${componentName}()`);

  fs.writeFileSync(outFile, finalContent);

  const pageDir = path.join(APP_DIR, moduleName);
  fs.mkdirSync(pageDir, { recursive: true });

  const pageContent = `import ${componentName} from "@/lib/modules/pages/${moduleName}";\n\nexport default function Page() {\n  return <${componentName} />;\n}\n`;
  fs.writeFileSync(path.join(pageDir, "page.tsx"), pageContent);

  console.log(`Converted ${moduleName}`);
}

console.log("Done.");
