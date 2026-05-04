/**
 * ESLint Plugin - Quina Fácil Design System Enforcement
 *
 * Automatiza as regras de:
 * - Docs/02-DESIGN-SYSTEM.md
 * - Docs/Arquitetura.md
 * - Docs/01-IDENTIDADE-VISUAL.md
 *
 * @version 2.0.0
 */

"use strict";

// =============================================================================
// HELPERS
// =============================================================================

/** Returns true if the file is inside /components/ui/ */
function isUiFile(context) {
  const f = context.getFilename();
  return f.includes("/components/ui/") || f.includes("\\components\\ui\\");
}

/** Returns true if the file is a page/layout inside /app/ */
function isAppFile(context) {
  const f = context.getFilename();
  return f.includes("/app/") || f.includes("\\app\\");n
}

/**
 * Extracts all class strings from a JSXAttribute node (className="..." or className={`...`})
 * Returns an array of { cls, node } pairs for reporting.
 */
function extractClasses(attrNode) {
  const val = attrNode.value;
  if (!val) return [];
  const results = [];

  if (val.type === "Literal" && typeof val.value === "string") {
    for (const cls of val.value.split(/\s+/)) {
      if (cls) results.push({ cls, node: attrNode });
    }
  }

  if (
    val.type === "JSXExpressionContainer" &&
    val.expression.type === "TemplateLiteral"
  ) {
    for (const quasi of val.expression.quasis) {
      for (const cls of quasi.value.raw.split(/\s+/)) {
        if (cls) results.push({ cls, node: attrNode });
      }
    }
  }

  return results;
}

// =============================================================================
// RULE: no-html-primitives
// Proíbe o uso direto de tags HTML que têm componentes de DS equivalentes.
// Fonte: Arquitetura.md §REUSO TOTAL
// =============================================================================
const noHtmlPrimitives = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Proíbe uso de tags HTML primitivas que possuem equivalentes no Design System.",
    },
    messages: {
      forbiddenTag:
        "❌ Não use `<{{ tag }}>` diretamente.\n" +
        "✅ Use `<{{ replacement }} />` de `@/components/ui/{{ replacement }}`.\n" +
        "Motivo: Arquitetura.md §REUSO TOTAL — toda interface deve ser composta por componentes de /components/ui/.",
    },
    schema: [],
  },
  create(context) {
    const forbidden = {
      h1: "Heading",
      h2: "Heading",
      h3: "Heading",
      h4: "Heading",
      h5: "Heading",
      h6: "Heading",
      p: "Text",
      span: "Text",
      button: "Button",
      input: "InputField",
      textarea: "InputField",
      select: "CustomSelect",
      section: "Section",
      div: "Box, Stack ou Flex",
      main: "Main",
      aside: "Sidebar",
      form: "Stack (com onSubmit)",
      a: "Link do Next.js ou Button variant=\"link\"",
    };

    // Tags permitidas como exceções específicas no DS
    const allowedInUi = new Set(["a", "img", "form", "span", "p"]);

    return {
      JSXOpeningElement(node) {
        const name =
          node.name && node.name.type === "JSXIdentifier" ? node.name.name : null;
        if (!name || !forbidden[name]) return;

        const filename = context.getFilename();
        const basename = filename.split(/[/\\]/).pop().replace(/\.tsx?$/, "");

        // Os próprios componentes do DS podem usar suas tags primitivas correspondentes
        // Ex: Button.tsx pode usar <button>, Heading.tsx pode usar <h1>
        if (isUiFile(context)) {
          if (basename === forbidden[name]) return;
          if (name.startsWith("h") && basename === "Heading") return;
          if ((name === "p" || name === "span") && basename === "Text") return;
          if (name === "div" && (basename === "Box" || basename === "Stack" || basename === "Flex" || basename === "Grid" || basename === "Section")) return;
          if (name === "form" && basename === "Stack") return; // Stack pode ser usado como form
        }

        context.report({
          node,
          messageId: "forbiddenTag",
          data: { tag: name, replacement: forbidden[name] },
        });
      },
    };
  },
};

// =============================================================================
// RULE: no-forbidden-tailwind-spacing
// Proíbe mt-*, mb-*, ml-*, mr-*, pt-*, pb-*, pl-*, pr-*, px-*, py-*
// para espaçamento entre componentes em páginas e composições.
// Fonte: 02-DESIGN-SYSTEM.md §Proibido
// =============================================================================
const noForbiddenTailwindSpacing = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Proíbe classes Tailwind de margin e padding direcional usadas para espaçamento entre componentes.",
    },
    messages: {
      forbiddenMargin:
        "❌ A classe `{{ cls }}` é proibida para espaçamento entre componentes.\n" +
        "✅ Use `gap-*` no container pai (`<Stack>`, `<Flex>`, `<Grid>`).\n" +
        "Motivo: 02-DESIGN-SYSTEM.md §Proibido — use sempre gap, nunca margin para separar elementos.",
      forbiddenDirectionalPadding:
        "❌ A classe `{{ cls }}` (padding direcional) é proibida em layouts e composições.\n" +
        "✅ Use `gap-*` no container pai para separar elementos. Reserve `p-*` para preenchimento interno.\n" +
        "Motivo: 02-DESIGN-SYSTEM.md §Proibido — pt-, pb-, pl-, pr-, px-, py- indicam espaçamento que deve ser feito com gap.",
    },
    schema: [],
  },
  create(context) {
    // Margin entre elementos — proibido em todos os contextos
    const marginPattern = /^-?(mt|mb|ml|mr)-(\d+|auto|\[.+\])$/;
    // Padding direcional — proibido fora de /components/ui/
    const directionalPaddingPattern = /^-?(pt|pb|pl|pr|px|py)-(\d+|\[.+\])$/;

    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        const classes = extractClasses(node);
        const filename = context.getFilename();
        const basename = filename.split(/[/\\]/).pop().replace(/\.tsx?$/, "");

        // Componentes "Base" que têm permissão para usar padding direcional interno
        const allowedPaddingComponents = new Set(["Box", "InputField", "Button", "CustomSelect", "DigitalTicket", "Sidebar"]);

        for (const { cls } of classes) {
          if (marginPattern.test(cls)) {
            context.report({
              node,
              messageId: "forbiddenMargin",
              data: { cls },
            });
          } else if (directionalPaddingPattern.test(cls)) {
            // Se for arquivo UI, verifica se é um dos componentes permitidos
            if (isUiFile(context)) {
              if (allowedPaddingComponents.has(basename)) continue;
            }
            
            context.report({
              node,
              messageId: "forbiddenDirectionalPadding",
              data: { cls },
            });
          }
        }
      },
    };
  },
};

// =============================================================================
// RULE: no-forbidden-rounded
// Proíbe rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl.
// Use rounded-[5px] (token absoluto do sistema).
// Fonte: 02-DESIGN-SYSTEM.md §Regras de Ouro
// =============================================================================
const noForbiddenRounded = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Proíbe classes de border-radius não padronizadas. Apenas `rounded-[5px]` é permitido.",
    },
    messages: {
      forbiddenRounded:
        "❌ A classe `{{ cls }}` é proibida.\n" +
        "✅ Use `rounded-[5px]` (5px absoluto) como definido no Design System.\n" +
        "Exceção: `rounded-full` apenas para elementos decorativos (dots, avatares circulares).\n" +
        "Motivo: 02-DESIGN-SYSTEM.md §Regras de Ouro — Border Radius obrigatório é 5px.",
    },
    schema: [],
  },
  create(context) {
    const forbidden = /^rounded-(sm|md|lg|xl|2xl|3xl)$/;

    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        for (const { cls } of extractClasses(node)) {
          if (forbidden.test(cls)) {
            context.report({
              node,
              messageId: "forbiddenRounded",
              data: { cls },
            });
          }
        }
      },
    };
  },
};

// =============================================================================
// RULE: no-tailwind-important-override
// Proíbe qualquer classe Tailwind com prefixo ! (important override).
// Criar variante no DS ao invés de usar overrides.
// Fonte: 02-DESIGN-SYSTEM.md §Proibido
// =============================================================================
const noTailwindImportantOverride = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Proíbe classes Tailwind com prefixo `!` (important) fora de /components/ui/.",
    },
    messages: {
      importantOverride:
        "❌ A classe `{{ cls }}` usa `!important` para sobrescrever o Design System.\n" +
        "✅ Crie uma nova variante no componente DS adequado (ex: `variant=\"link\"` no `<Button>`).\n" +
        "Motivo: 02-DESIGN-SYSTEM.md §Proibido — overrides visuais diretos violam a consistência do DS.",
    },
    schema: [],
  },
  create(context) {
    // Só aplica fora dos componentes base do DS e fora da página de vitrine
    const f = context.getFilename();
    if (isUiFile(context)) return {};
    if (f.includes("/app/design-system/") || f.includes("\\app\\design-system\\")) return {};

    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        for (const { cls } of extractClasses(node)) {
          // Detecta qualquer classe que começa com !
          if (cls.startsWith("!")) {
            context.report({
              node,
              messageId: "importantOverride",
              data: { cls },
            });
          }
        }
      },
    };
  },
};

// =============================================================================
// RULE: no-visual-className-override
// Proíbe passar classes de tipografia/visual diretamente em componentes DS
// como Heading, Text, Button, Badge via className.
// Fonte: 02-DESIGN-SYSTEM.md §Tipografia
// =============================================================================
const noVisualClassNameOverride = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Proíbe override de tipografia/visual via className em componentes do Design System.",
    },
    messages: {
      visualOverride:
        "❌ A classe `{{ cls }}` sobrescreve a tipografia/visual do componente `<{{ component }}>`.\n" +
        "✅ Use as props do componente: `variant`, `size`, `color` ou crie uma nova variante.\n" +
        "Motivo: 02-DESIGN-SYSTEM.md §Tipografia — tipografia é controlada exclusivamente via props do DS.",
    },
    schema: [],
  },
  create(context) {
    // Componentes DS cujos estilos visuais devem ser controlados apenas por props
    // Exceção: a página do design-system (vitrine) e os próprios componentes ui/
    const f = context.getFilename();
    if (isUiFile(context)) return {};
    if (f.includes("/app/design-system/") || f.includes("\\app\\design-system\\")) return {};

    const dsComponents = new Set([
      "Heading", "Text", "Button", "Badge", "StatCard", "ListRow",
    ]);

    // Classes de tipografia/visual que são proibidas via className nesses componentes
    const visualOverridePattern =
      /^(font-(black|bold|medium|semibold|light|thin|extrabold)|italic|not-italic|uppercase|lowercase|capitalize|normal-case|tracking-|leading-|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)|text-(black|white|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)|opacity-).*$/;

    return {
      JSXOpeningElement(node) {
        const componentName =
          node.name && node.name.type === "JSXIdentifier" ? node.name.name : null;
        if (!componentName || !dsComponents.has(componentName)) return;

        for (const attr of node.attributes) {
          if (attr.type !== "JSXAttribute" || attr.name.name !== "className") continue;

          for (const { cls } of extractClasses(attr)) {
            // Allow layout utility classes that are neutral
            if (visualOverridePattern.test(cls)) {
              context.report({
                node: attr,
                messageId: "visualOverride",
                data: { cls, component: componentName },
              });
            }
          }
        }
      },
    };
  },
};

// =============================================================================
// RULE: no-box-layout-class
// Proíbe usar <Box> com classes de layout que deveriam estar em Flex/Stack/Grid.
// Fonte: 02-DESIGN-SYSTEM.md §Biblioteca de Componentes
// =============================================================================
const noBoxLayoutClass = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Proíbe usar <Box> com classes de layout complexas. Use <Flex>, <Stack> ou <Grid>.",
    },
    messages: {
      boxLayoutClass:
        "❌ `<Box>` não deve receber a classe de layout `{{ cls }}`.\n" +
        "✅ Use o componente semântico correto:\n" +
        "  • `flex flex-col` → `<Stack>`\n" +
        "  • `flex flex-row` → `<Flex>`\n" +
        "  • `grid` → `<Grid>`\n" +
        "Motivo: Box é um container de estilo (bg, border, padding), não de layout.",
    },
    schema: [],
  },
  create(context) {
    // Classes de layout que indicam que Box está sendo mal-usado
    const layoutClasses = new Set([
      "flex", "grid", "flex-col", "flex-row", "inline-flex",
      "flex-col-reverse", "flex-row-reverse",
    ]);
    // grid-cols-* pattern
    const gridColsPattern = /^grid-cols-/;

    return {
      JSXOpeningElement(node) {
        const name =
          node.name && node.name.type === "JSXIdentifier" ? node.name.name : null;
        if (name !== "Box") return;

        for (const attr of node.attributes) {
          if (attr.type !== "JSXAttribute" || attr.name.name !== "className") continue;

          for (const { cls } of extractClasses(attr)) {
            if (layoutClasses.has(cls) || gridColsPattern.test(cls)) {
              context.report({
                node: attr,
                messageId: "boxLayoutClass",
                data: { cls },
              });
            }
          }
        }
      },
    };
  },
};

// =============================================================================
// RULE: no-ad-hoc-components
// Proíbe criar componentes de UI inline dentro de arquivos de página (/app/*).
// Fonte: Arquitetura.md §REUSO TOTAL
// =============================================================================
const noAdHocComponents = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Proíbe definição de componentes de UI ad-hoc dentro de arquivos de página.",
    },
    messages: {
      adHocComponent:
        "❌ O componente `{{ name }}` foi definido dentro de um arquivo de página.\n" +
        "✅ Crie-o em `/components/ui/{{ name }}.tsx` e documente-o no Design System.\n" +
        "Motivo: Arquitetura.md §REUSO TOTAL — é proibido criar componentes de UI isolados dentro das páginas.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isPage =
      (filename.includes("/app/") || filename.includes("\\app\\")) &&
      !filename.includes("/app/design-system/") &&
      !filename.includes("\\app\\design-system\\");

    if (!isPage) return {};

    return {
      FunctionDeclaration(node) {
        const isDefaultExport =
          node.parent && node.parent.type === "ExportDefaultDeclaration";
        if (isDefaultExport) return;

        if (node.id && /^[A-Z]/.test(node.id.name)) {
          context.report({
            node,
            messageId: "adHocComponent",
            data: { name: node.id.name },
          });
        }
      },
      VariableDeclaration(node) {
        for (const decl of node.declarations) {
          if (
            decl.id &&
            decl.id.type === "Identifier" &&
            /^[A-Z]/.test(decl.id.name) &&
            decl.init &&
            (decl.init.type === "ArrowFunctionExpression" ||
              decl.init.type === "FunctionExpression")
          ) {
            const parent = node.parent;
            if (parent && parent.type === "ExportDefaultDeclaration") return;
            context.report({
              node: decl,
              messageId: "adHocComponent",
              data: { name: decl.id.name },
            });
          }
        }
      },
    };
  },
};

// =============================================================================
// RULE: no-direct-supabase-in-components
// Proíbe chamadas ao supabaseClient diretamente dentro de componentes React.
// Fonte: Arquitetura.md §Padrões de Código
// =============================================================================
const noDirectSupabaseInComponents = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Proíbe uso direto do Supabase dentro de componentes. Use a camada de /services/.",
    },
    messages: {
      directSupabase:
        "❌ Chamada direta ao Supabase detectada em um componente.\n" +
        "✅ Toda comunicação com o Supabase deve estar em `/web/services/`.\n" +
        "Motivo: Arquitetura.md §Padrões de Código.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isService =
      filename.includes("/services/") || filename.includes("\\services\\");
    const isAction =
      filename.includes("actions.ts") || filename.includes("actions.tsx");
    if (isService || isAction) return {};

    return {
      ImportDeclaration(node) {
        const src = node.source.value;
        if (
          src.includes("@supabase/supabase-js") ||
          src.includes("supabaseClient") ||
          src.includes("/lib/supabase") ||
          src.includes("\\lib\\supabase")
        ) {
          context.report({ node, messageId: "directSupabase" });
        }
      },
    };
  },
};

// =============================================================================
// RULE: enforce-ds-imports
// Garante que os componentes do Design System são importados via @/components/ui
// Fonte: Arquitetura.md §REUSO TOTAL
// =============================================================================
const enforceDsImports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Garante que componentes do Design System são importados via alias @/components/ui.",
    },
    messages: {
      relativeImport:
        "❌ Importe `{{ component }}` via alias:\n" +
        "✅ `import { {{ component }} } from '@/components/ui/{{ component }}'`.\n" +
        "Motivo: Arquitetura.md — consistência de imports e rastreabilidade.",
    },
    schema: [],
  },
  create(context) {
    const dsComponents = new Set([
      "Alert", "Badge", "Box", "Button", "Card", "Container",
      "CustomSelect", "DigitalTicket", "DrawTimer", "Flex", "Grid",
      "Heading", "ImageUpload", "InputField", "ListRow", "Main", "MiniChart",
      "MobileNav", "Modal", "NumberPicker", "PageHeader", "Portal",
      "Section", "Sidebar", "SidebarNavItem", "Stack", "StatCard",
      "Text", "ThemeSwitcher", "Toast",
    ]);

    if (isUiFile(context)) return {};

    return {
      ImportDeclaration(node) {
        const src = node.source.value;
        if (!src.startsWith(".")) return;
        for (const spec of node.specifiers) {
          if (
            spec.type === "ImportSpecifier" &&
            dsComponents.has(spec.imported.name)
          ) {
            context.report({
              node,
              messageId: "relativeImport",
              data: { component: spec.imported.name },
            });
          }
        }
      },
    };
  },
};

// =============================================================================
// EXPORTS
// =============================================================================
module.exports = {
  rules: {
    // Existentes (melhorados)
    "no-html-primitives": noHtmlPrimitives,
    "no-forbidden-tailwind-spacing": noForbiddenTailwindSpacing,
    "no-forbidden-rounded": noForbiddenRounded,
    "no-ad-hoc-components": noAdHocComponents,
    "no-direct-supabase-in-components": noDirectSupabaseInComponents,
    "enforce-ds-imports": enforceDsImports,
    // Novas
    "no-tailwind-important-override": noTailwindImportantOverride,
    "no-visual-className-override": noVisualClassNameOverride,
    "no-box-layout-class": noBoxLayoutClass,
    "no-browser-popup": {
      meta: {
        type: "problem",
        docs: {
          description: "Proíbe uso de popups nativos do navegador (alert, confirm, prompt).",
        },
        messages: {
          noPopup: "❌ O uso de `{{ name }}()` é proibido.\n✅ Use os componentes do Design System: `<AlertModal>`, `<ConfirmModal>` ou o sistema de Toasts.\nMotivo: Design System — popups nativos quebram a identidade visual e o controle de estado da aplicação.",
        },
        schema: [],
      },
      create(context) {
        return {
          CallExpression(node) {
            if (node.callee.type === "Identifier") {
              const name = node.callee.name;
              if (["alert", "confirm", "prompt"].includes(name)) {
                context.report({ node, messageId: "noPopup", data: { name } });
              }
            }
          },
        };
      },
    },
    "no-default-browser-scroll": {
      meta: {
        type: "problem",
        docs: {
          description: "Proíbe o uso do scroll padrão do navegador. É obrigatório usar `custom-scrollbar` ou `no-scrollbar`.",
        },
        messages: {
          enforceCustomScroll: "❌ Container com scroll detectado sem a classe de estilização customizada.\n✅ Adicione `custom-scrollbar` para scroll visível ou `no-scrollbar` para ocultá-lo.\nMotivo: Design System — o scroll padrão do navegador quebra a estética premium Liquid Glass.",
        },
        schema: [],
      },
      create(context) {
        const scrollClasses = new Set(["overflow-auto", "overflow-y-auto", "overflow-x-auto", "overflow-scroll", "overflow-y-scroll", "overflow-x-scroll"]);
        const customScrollClasses = new Set(["custom-scrollbar", "no-scrollbar"]);

        return {
          JSXAttribute(node) {
            if (node.name.name !== "className") return;
            const classes = extractClasses(node);
            const classSet = new Set(classes.map(c => c.cls));

            let hasScroll = false;
            let hasCustom = false;

            for (const cls of classSet) {
              if (scrollClasses.has(cls)) hasScroll = true;
              if (customScrollClasses.has(cls)) hasCustom = true;
            }

            if (hasScroll && !hasCustom) {
              context.report({
                node,
                messageId: "enforceCustomScroll",
              });
            }
          },
        };
      },
    },
  },
};
