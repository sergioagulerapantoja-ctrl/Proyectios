import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = resolve(projectRoot, "dist", "client");
const pagesDir = resolve(projectRoot, "docs");
const siteBase = "/Proyectios";
const sourceUrl = process.env.PAGES_SOURCE_URL || "http://localhost:3000/";

if (pagesDir !== join(projectRoot, "docs")) {
  throw new Error("La carpeta de salida de Pages no es segura.");
}

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`No se pudo obtener la página: ${response.status}`);

let html = await response.text();
html = html
  .replaceAll('href="/_next/', `href="${siteBase}/_next/`)
  .replaceAll('src="/_next/', `src="${siteBase}/_next/`)
  .replaceAll('url(/_next/', `url(${siteBase}/_next/`)
  .replaceAll('href="/ropalia-', `href="${siteBase}/ropalia-`)
  .replaceAll('src="/ropalia-', `src="${siteBase}/ropalia-`)
  .replaceAll('content="http://localhost:3000/', `content="https://sergioagulerapantoja-ctrl.github.io${siteBase}/`)
  .replace("</head>", `<base href="${siteBase}/"><meta name="github-pages" content="Ropalia"></head>`);

await rm(pagesDir, { recursive: true, force: true });
await mkdir(pagesDir, { recursive: true });
await cp(clientDir, pagesDir, { recursive: true });
await writeFile(join(pagesDir, "index.html"), html, "utf8");
await writeFile(join(pagesDir, ".nojekyll"), "", "utf8");

const manifest = JSON.parse(await readFile(join(pagesDir, ".vite", "manifest.json"), "utf8"));
const appChunk = Object.values(manifest).find((entry) => entry.file?.includes("ropalia-app"))?.file;
if (appChunk) {
  const appChunkPath = join(pagesDir, appChunk);
  const appCode = (await readFile(appChunkPath, "utf8"))
    .replaceAll("`/ropalia-", `\`${siteBase}/ropalia-`)
    .replaceAll('"/ropalia-', `"${siteBase}/ropalia-`);
  await writeFile(appChunkPath, appCode, "utf8");
}

const staticFiles = await readdir(join(pagesDir, "_next", "static"), { recursive: true });
for (const relativePath of staticFiles.filter((file) => file.endsWith(".css"))) {
  const cssPath = join(pagesDir, "_next", "static", relativePath);
  const css = (await readFile(cssPath, "utf8")).replaceAll("url(/_next/", `url(${siteBase}/_next/`);
  await writeFile(cssPath, css, "utf8");
}

console.log(`GitHub Pages generado en ${pagesDir}`);
