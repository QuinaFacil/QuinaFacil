# 📝 Checklist de Construção - Quina Fácil

Este documento serve como o roadmap oficial para o desenvolvimento das telas e fluxos. Marque com `[x]` as telas finalizadas e estabilizadas (Design System + Funcionalidade).

---

## 🔐 Fluxo de Autenticação & Público
- [x] **Landing Page (`/`)**
  - [x] Header fixo com Glassmorphism.
  - [x] Hero section com tipografia 8xl.
  - [x] Rodapé institucional.
- [x] **Página de Login (`/login`)**
  - [x] Layout lateral com imagem e logo.
  - [x] Formulário com validação visual.
  - [x] Redirecionamento automático por Role (Middleware).

---

## 💰 Fluxo do Vendedor (Vendedor)
- [ ] **Dashboard (`/vendedor/dashboard`)**
  - [ ] Resumo de vendas diárias.
  - [ ] Saldo de comissões.
  - [ ] Lista de transações recentes.
- [ ] **Emitir Bilhete (`/vendedor/emitir-bilhete`)**
  - [ ] Seletor de números (NumberPicker).
  - [ ] Resumo do jogo e preço.
  - [ ] Impressão/Download de comprovante (DigitalTicket).
- [ ] **Minhas Comissões (`/vendedor/comissoes`)**
  - [ ] Extrato detalhado (Entradas/Saídas).
  - [ ] Status de saque/pagamento.
- [ ] **Relatórios (`/vendedor/relatorios`)**
  - [ ] Busca de bilhetes por data/ID.
  - [ ] Filtro de status (Ativo/Cancelado).
- [ ] **Perfil (`/vendedor/perfil`)**
  - [ ] Configurações de conta.
  - [ ] Troca de senha.

---

## 👔 Fluxo do Gerente (Gerente)
- [ ] **Dashboard (`/gerente/dashboard`)**
  - [ ] Gráfico de vendas da equipe.
  - [ ] Ranking de vendedores.
- [ ] **Equipe de Vendedores (`/gerente/vendedores`)**
  - [ ] Lista de vendedores vinculados.
  - [ ] Ativar/Desativar contas.
- [ ] **Relatórios de Performance (`/gerente/relatorios`)**
  - [ ] Exportação de dados da equipe.

---

## 🛡️ Fluxo Administrativo (Admin)
- [ ] **Dashboard Global (`/admin/dashboard`)**
  - [ ] Faturamento total do sistema.
  - [ ] Volume de usuários ativos.
- [x] **Gestão de Usuários (`/admin/usuarios`)**
  - [x] Criar novo Admin/Gerente/Vendedor.
  - [x] Reset de senha e troca de cargo.
- [ ] **Relatórios e Auditoria (`/admin/relatorios`)**
  - [ ] Exportação de CSV/PDF.
  - [ ] Filtros avançados por período.

- [ ] **Logs de Segurança (`/admin/logs`)**
  - [ ] Histórico de login e ações críticas.
- [ ] **Sorteios e Resultados (`/admin/resultados`)**
  - [ ] Cadastro de dezenas sorteadas.
  - [ ] Disparo de verificação de vencedores.
- [ ] **Vencedores (`/admin/vencedores`)**
  - [ ] Lista de bilhetes premiados.
  - [ ] Baixa em pagamentos de prêmios.

---

## 🎨 Padrões de Verificação (DoR - Definition of Ready)
Para marcar uma tela como concluída, ela deve passar por:
1. **Consistência Visual:** Segue estritamente o `Docs/02-DESIGN-SYSTEM.md`.
2. **Responsividade:** Layout testado em Desktop e Mobile (`pb-32` presente).
3. **Temas:** Funciona perfeitamente em Light e Dark mode.
4. **Segurança:** Acesso bloqueado via Middleware para outros cargos.
5. **Tipografia:** Sem caracteres corrompidos (UTF-8 OK).
