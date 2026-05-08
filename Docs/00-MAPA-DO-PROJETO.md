# 🗺️ Mapa do Projeto - Quina Fácil

Este documento é o ponto de partida obrigatório para qualquer desenvolvimento. Ele indexa todas as diretrizes que mantêm a consistência do sistema.

---

## 📂 Índice de Documentação

### [01. Identidade Visual](file:///c:/Users/Marcos/Desktop/pra%20usar%20dps/5%20-%20Trabalho/Quina%20facil/Docs/01-IDENTIDADE-VISUAL.md)
- Logos (Vertical, Horizontal, Dark).
- Paleta de Cores (Primary Dark, Light, Cyan).
- Estética "Liquid Glass" (Glassmorphism e Reflexos).

### [02. Design System](file:///c:/Users/Marcos/Desktop/pra%20usar%20dps/5%20-%20Trabalho/Quina%20facil/Docs/02-DESIGN-SYSTEM.md)
- **Regras de Ouro:** Radius 5px, Padding p-6.
- **Grades e Espaçamentos:** 100/50/20.
- Guia de Componentes Reutilizáveis.

### [03. Arquitetura de Código](file:///c:/Users/Marcos/Desktop/pra%20usar%20dps/5%20-%20Trabalho/Quina%20facil/Docs/03-ARQUITETURA.md)
- Estrutura de Pastas.
- Fluxo de Dados (Optimistic UI + TanStack Query).
- Camada de Services (Supabase Client).

### [04. Banco de Dados & SQL](file:///c:/Users/Marcos/Desktop/pra%20usar%20dps/5%20-%20Trabalho/Quina%20facil/Docs/04-DATABASE.md)
- Schema das Tabelas.
- Políticas de Segurança (RLS).
- Triggers e Logs de Auditoria.

### [05. Regras de Negócio](file:///c:/Users/Marcos/Desktop/pra%20usar%20dps/5%20-%20Trabalho/Quina%20facil/Docs/05-REGRAS-DE-NEGOCIO.md)
- Lógica de Fechamento de Sorteios.
- Cálculo de Comissões.
- Hierarquia de Usuários (Admin, Gerente, Vendedor).

---

## 🚨 Regra de Ouro para a IA
> **Antes de qualquer alteração no código, você DEVE:**
> 1. Consultar este mapa.
> 2. Validar se a proposta respeita o Design System (02) e a Arquitetura (03).
> 3. Nunca criar componentes do zero que já existam na biblioteca.
