import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import quinafacil from "./eslint-plugin-quinafacil/index.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ==========================================================================
  // 🏛️ Design System Enforcement — Quina Fácil
  // Fonte: Docs/02-DESIGN-SYSTEM.md, Docs/Arquitetura.md, Docs/01-IDENTIDADE-VISUAL.md
  // ==========================================================================
  {
    plugins: {
      quinafacil,
    },
    rules: {
      // -----------------------------------------------------------------------
      // [CRITICAL] Proíbe tags HTML primitivas que têm equivalentes no DS.
      // <h1..h6> → <Heading>, <p>/<span> → <Text>, <button> → <Button>
      // <input> → <InputField>, <textarea> → <InputField>,
      // <select> → <CustomSelect>, <section> → <Section>, <main> → <Main>
      // <a> → Link ou <Button variant="link">, <form> → <Stack onSubmit>
      // Fonte: Arquitetura.md §REUSO TOTAL
      // -----------------------------------------------------------------------
      "quinafacil/no-html-primitives": "error",

      // -----------------------------------------------------------------------
      // [CRITICAL] Proíbe mt-*, mb-*, ml-*, mr-* e pt-*, pb-*, pl-*, pr-*, px-*, py-*
      // para espaçamento entre componentes. Use gap-* nos containers.
      // Exceção: padding direcional permitido dentro de /components/ui/.
      // Fonte: 02-DESIGN-SYSTEM.md §Proibido
      // -----------------------------------------------------------------------
      "quinafacil/no-forbidden-tailwind-spacing": "error",

      // -----------------------------------------------------------------------
      // [CRITICAL] Proíbe rounded-sm, rounded-md, rounded-lg, rounded-xl.
      // Use rounded-[5px] (token absoluto do sistema).
      // Fonte: 02-DESIGN-SYSTEM.md §Regras de Ouro
      // -----------------------------------------------------------------------
      "quinafacil/no-forbidden-rounded": "error",

      // -----------------------------------------------------------------------
      // [CRITICAL] Proíbe qualquer classe com prefixo ! (Tailwind important override).
      // Overrides indicam que falta uma variante no DS. Crie a variante.
      // Fonte: 02-DESIGN-SYSTEM.md §Proibido
      // -----------------------------------------------------------------------
      "quinafacil/no-tailwind-important-override": "error",

      // -----------------------------------------------------------------------
      // [WARNING] Proíbe classes de tipografia/visual via className em componentes DS.
      // Ex: <Heading className="uppercase"> → use props variant/size/color.
      // Fonte: 02-DESIGN-SYSTEM.md §Tipografia
      // -----------------------------------------------------------------------
      "quinafacil/no-visual-className-override": "warn",

      // -----------------------------------------------------------------------
      // [WARNING] Proíbe usar <Box> com classes de layout (flex, grid, flex-col...).
      // Use os componentes semânticos: <Stack>, <Flex>, <Grid>.
      // Fonte: 02-DESIGN-SYSTEM.md §Biblioteca de Componentes
      // -----------------------------------------------------------------------
      "quinafacil/no-box-layout-class": "warn",

      // -----------------------------------------------------------------------
      // [WARNING] Proíbe componentes UI ad-hoc dentro de /app/** (páginas).
      // Crie sempre em /components/ui/ e documente no Design System.
      // Fonte: Arquitetura.md §REUSO TOTAL
      // -----------------------------------------------------------------------
      "quinafacil/no-ad-hoc-components": "warn",

      // -----------------------------------------------------------------------
      // [WARNING] Proíbe chamadas diretas ao Supabase fora de /services/.
      // Fonte: Arquitetura.md §Padrões de Código
      // -----------------------------------------------------------------------
      "quinafacil/no-direct-supabase-in-components": "warn",

      // -----------------------------------------------------------------------
      // [WARNING] Garante que componentes do DS são importados via @/components/ui.
      // Fonte: Arquitetura.md §REUSO TOTAL
      // -----------------------------------------------------------------------
      "quinafacil/enforce-ds-imports": "warn",

      // -----------------------------------------------------------------------
      // [CRITICAL] Proíbe o uso de popups nativos do navegador (alert, confirm, prompt).
      // Use <AlertModal>, <ConfirmModal> ou Toasts do Design System.
      // -----------------------------------------------------------------------
      "quinafacil/no-browser-popup": "error",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "types/validator.ts",
    "types/routes.js",
    "types/routes.d.ts",
    // Ignora o próprio plugin para não criar regras circulares
    "eslint-plugin-quinafacil/**",
  ]),
]);

export default eslintConfig;
