# 🗄️ Banco de Dados & SQL - Quina Fácil

O projeto utiliza **Supabase (PostgreSQL)** como camada de persistência, com forte dependência de regras no banco para segurança.

---

## 🔒 Segurança (RLS)
- **Obrigatório:** Toda tabela deve ter RLS (Row Level Security) habilitado.
- **Políticas:** Vendedores só veem suas próprias vendas; Admins veem tudo.

---

## 📈 Tabelas Principais (Core Schema)
- `profiles`: Dados de usuários e níveis de acesso (Admin, Gerente, Vendedor).
- `tickets`: Registro de bilhetes emitidos (Immutable).
- `commissions`: Histórico de ganhos por venda.
- `contests`: Informações sobre sorteios ativos e encerrados.

---

## 🛡️ Auditoria (`audit_logs`)
- **Tabela:** `audit_logs` para rastreabilidade total.
- **Estrutura:**
  ```sql
  CREATE TABLE public.audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT now(),
      user_id UUID REFERENCES public.profiles(id),
      category TEXT NOT NULL, -- security, management, lottery, finance
      action TEXT NOT NULL,
      description TEXT,
      metadata JSONB DEFAULT '{}'::jsonb
  );
  ```
- **Políticas:** Apenas usuários com `role = 'admin'` podem visualizar os logs. Inserção permitida para todos os autenticados (via sistema).
- **Triggers:** PostgreSQL deve garantir que um bilhete não possa ser editado após a criação (`BEFORE UPDATE -> RAISE EXCEPTION`).
