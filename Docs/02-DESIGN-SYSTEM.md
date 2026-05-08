# 📐 Design System - Quina Fácil

Regras rígidas de layout e lista de componentes para garantir que o sistema não perca a consistência durante a expansão.

---

## 📏 Regras de Ouro (Core Tokens)
- **Border Radius:** `rounded-[5px]` (5px absoluto).
- **Card Padding:** `p-6` (24px).
- **Input/Button Height:** `h-14` (56px).

---

## 🧱 Grades e Espaçamentos (Rhythm)
Os espaçamentos entre blocos devem seguir este padrão via `gap` no container principal:
- **Entre Seções (Vertical):** `100px` (Desktop) / `50px` (Mobile).
- **Título para Conteúdo:** `50px` (Desktop) / `30px` (Mobile).
- **Entre Itens Irmãos:** `20px` (`gap-5`).
- **Entre Seções Lado a Lado (Grid):** `50px` (`gap="section"` no componente `<Grid>`). Use quando duas seções distintas dividem a mesma linha horizontal.

---

## 🔠 Tipografia (Typography)
O sistema utiliza uma hierarquia clara baseada em variantes do componente `Text` e `Heading`:
- **Títulos (`Heading`):** Utilizam a classe `title-italic` por padrão para um visual dinâmico.
- **Body:** Texto padrão para leitura.
- **Description:** Texto de apoio (`text-sm`).
- **Auxiliary:** Metadados (`10px`) em caixa mista.
- **Label Caps:** Labels de sistema em uppercase com tracking.
- **Sub/Tiny:** Metadados em caixa alta para detalhes extremos.

---

## 🧩 Biblioteca de Componentes
Sempre verifique `web/app/design-system/page.tsx` para ver o exemplo de implementação de:
1. **`StatCard`**: Cards de estatísticas com ícone e trend.
2. **`ListRow`**: Linhas de transação com ícone, link e variantes.
3. **`Badge`**: Status com suporte a `dot` e `icon`.
4. **`InputField`**: Inputs padronizados com ícone e erro.
5. **`CustomSelect`**: Dropdown personalizado estilo glass.
6. **`NumberPicker`**: Seletor de dezenas para loteria.
7. **`DigitalTicket`**: Comprovante de aposta estilo recibo térmico.
8. **`MiniChart`**: Gráficos de barras rápidos para dashboard.
9. **`DrawTimer`**: Timer de contagem regressiva para sorteios.
10. **`Horizontal Scroll Badges`**: Container de badges com scroll horizontal invisível e fade de indicação (essencial para mobile).
11. **`Ergonomic Action Bar`**: Barra de ações fixada ou alinhada à direita no mobile para facilitar o alcance do polegar.

---

## 📱 Responsividade
- A Sidebar some em telas menores que `lg`.
- O menu `MobileNav` (flutuante) aparece no rodapé em telas mobile.
- **Importante:** Sempre adicionar `pb-32` no `main` em mobile para compensar o menu flutuante.

## Proibido
- usar margem pra fazer espaço entre elementos, use sempre o gap.
- usar padding pra fazer espaço entre os componentes de um stack, use sempre o gap.
- usar mt, mb, ml, mr, use sempre o gap ou os tokens de espaçamento.
- usar rounded-md, rounded-lg, rounded-xl, rounded-full, use sempre rounded-[5px].
- usar border-radius com valores que não sejam os definidos no sistema.
- usar padding direcional (`pt-`, `pb-`, `pl-`, `pr-`, `px-`, `py-`) — esses sempre indicam espaçamento que deveria ser feito com `gap`. Padding direcional é permitido **apenas** dentro de componentes base para definir área interna (ex: `px-5` em um `input`). Em layouts e composições, use sempre `gap`.