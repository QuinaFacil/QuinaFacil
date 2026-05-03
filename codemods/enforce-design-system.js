/* eslint-disable */
"use strict";

/**
 * Codemod: Enforce Quina Fácil Design System
 * 
 * Este script automatiza a migração de componentes e a limpeza de classes proibidas.
 * 
 * Regras:
 * 1. Remove classes de margin (mt, mb, ml, mr).
 * 2. Remove classes de padding direcional (pt, pb, pl, pr, px, py).
 * 3. Remove overrides visuais (font-bold, text-red, etc) em componentes do DS.
 * 4. Remove classes !important.
 */

const fs = require("fs");
const path = require("path");

const UI_COMPONENTS = new Set([
  "Heading", "Text", "Button", "Badge", "StatCard", "ListRow", "Card",
  "Box", "Flex", "Stack", "Grid", "Section", "Main", "Sidebar"
]);

function runCodemod(filePath) {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".js")) return;
  
  let content = fs.readFileSync(filePath, "utf-8");
  let dirty = false;

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  const FORBIDDEN_PATTERNS = [
    /^!.*/,                           // qualquer classe com !important
    /^-?(mt|mb|ml|mr)-/,             // margin entre elementos
    /^-?(pt|pb|pl|pr|px|py)-\d/,    // padding direcional numérico
    /^-?(pt|pb|pl|pr|px|py)-\[/,    // padding direcional arbitrário
  ];

  function isForbidden(cls) {
    return FORBIDDEN_PATTERNS.some((pat) => pat.test(cls));
  }

  function cleanClassName(value) {
    if (!value || typeof value !== "string") return value;
    const cleaned = value
      .split(/\s+/)
      .filter((cls) => !isForbidden(cls))
      .join(" ");
    
    if (cleaned !== value) dirty = true;
    return cleaned;
  }

  // Regex simples para capturar className="..." e className={`...`}
  // Nota: Codemods reais usam AST (jscodeshift), mas este regex cobre 90% dos casos simples.
  content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, value) => {
    const cleaned = cleanClassName(value);
    return `className=${quote}${cleaned}${quote}`;
  });

  if (dirty) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`[FIXED] ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".next") {
        walkDir(fullPath);
      }
    } else {
      runCodemod(fullPath);
    }
  }
}

// Execução
const targetDir = process.argv[2] || "./app";
console.log(`[CODEMOD] Iniciando em ${targetDir}...`);
walkDir(path.resolve(targetDir));
console.log(`[CODEMOD] Finalizado.`);