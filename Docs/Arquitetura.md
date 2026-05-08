# 🏛️ Diretrizes de Arquitetura - Quina Fácil

Este documento define os padrões arquiteturais, de fluxo de dados e de código para garantir que o sistema seja performático, auditável e escalável.

---

## 🚫 REGRA DE OURO: REUSO TOTAL
**É terminantemente proibido criar componentes de UI isolados (ad-hoc) dentro das páginas.**
- Toda a interface deve ser composta exclusivamente por componentes de `web/components/ui/`.
- Caso um padrão visual novo seja necessário:
  1. O componente deve ser criado em `/components/ui/`.
  2. Deve ser documentado e testado no `/app/design-system/page.tsx`.
  3. Somente após a validação no Design System ele poderá ser usado em uma rota real.

---

## 1. Stack Tecnológica
- **Frontend:** Next.js (App Router) + Tailwind CSS.
- **Backend/BaaS:** Supabase (Auth, PostgreSQL, Realtime).
- **State Management:** 
  - `TanStack Query (React Query)`: Para estado do servidor e sincronia.
  - `Zustand`: Para estado global da UI (modais, filtros, sidebar).
- **Ícones:** `Lucide React`.

---

## 2. Padrões de Código (Clean Code)
- **Componentes:** Devem ser funcionais e "puros" sempre que possível.
- **Services:** Toda lógica de comunicação com o Supabase deve estar em `/web/services/`, nunca diretamente no componente.
- **Naming:**
  - Componentes: `PascalCase.tsx`
  - Funções e Variáveis: `camelCase`
  - Constantes/Enums: `UPPER_SNAKE_CASE`

---

## 3. Fluxo de Dados e Performance (Optimistic UI)
Para garantir a percepção de velocidade instantânea:
1. **Updates Otimistas:** Ao vender um bilhete, a UI deve atualizar imediatamente via cache do TanStack Query.
2. **Resiliência:** Em caso de erro de rede, o sistema deve reverter o estado e notificar o usuário (Toast de Erro).
3. **Realtime:** Resultados de sorteios e atualizações de comissão devem usar `Supabase Realtime` para refletir mudanças sem refresh.

---

## 4. UI/UX (Design System "Liquid Glass")
Qualquer novo componente deve seguir rigorosamente as regras do Design System:
- **Border Radius:** Obrigatoriamente `rounded-[5px]`.
- **Padding:** Padrão de cards e containers `p-6` (24px).
- **Espaçamentos (Gaps):**
  - Entre Seções: `100px` (Desktop) / `50px` (Mobile).
  - Título/Conteúdo: `50px` (Desktop) / `30px` (Mobile).
  - Componentes Irmãos: `20px` (`gap-5`).
- **Aesthetics:** Uso de Backdrop Blur (Glassmorphism) e efeitos de brilho (Reflexo) em botões.

---

## 5. Segurança e Auditoria
- **RLS (Row Level Security):** Todas as tabelas no Supabase devem ter políticas de RLS ativas.
- **Logs de Auditoria:** Transações financeiras e emissão de bilhetes devem ser registradas em tabelas de log `append-only` via triggers no banco de dados.
- **Time-Gating:** Operações críticas de sorteio devem ser validadas no servidor (Edge Functions) para evitar submissões fora do horário permitido.

---

## 6. Estrutura de Pastas Sugerida
```text
/web
  /app           # Rotas e Páginas (Next.js)
  /components    # UI Components Reutilizáveis
    /ui          # Átomos (Botões, Inputs, Cards)
    /shared      # Componentes de Negócio Compartilhados
  /services      # Chamadas de API e Lógica de Negócio
  /hooks         # Custom Hooks (Lógica reutilizável)
  /store         # Zustand Stores
  /utils         # Funções auxiliares (Formatters, Validators)
  /types         # Interfaces e Tipos TypeScript
```

---

> [!IMPORTANT]
> A consistência é mais importante que a perfeição. Antes de criar um novo padrão, verifique se já existe um componente ou helper que resolva o problema.
