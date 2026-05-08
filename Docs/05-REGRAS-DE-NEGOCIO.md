# ⚖️ Regras de Negócio - Quina Fácil

Regras fundamentais para o funcionamento da loteria e comissões.

---

## ⏰ Operação e Prazos
- **Horário de Vendas:** Segunda a Sexta, das 06:00h às 17:00h.
- **Fechamento:** O sistema deve impedir vendas após o horário limite via server-time (Supabase Edge Functions).
- **Sorteios:** Resultados são importados/cadastrados via Painel Admin.

---

## 💰 Comissões e Pagamentos
- **Vendedor:** Recebe percentual fixo sobre cada bilhete vendido.
- **Hierarquia:** Gerentes podem receber sobre-comissão sobre a equipe que gerenciam.
- **Saques:** Solicitados via dashboard e aprovados pelo Admin.

---

## 🎟️ Regras do Bilhete
- **Série Única:** Cada bilhete deve gerar uma série de auditoria única.
- **Dezenas:** A Quina Fácil opera com seleção de dezenas específicas (conforme Seletor de Números).
- **Cancelamento:** Só é permitido dentro de uma janela de X minutos após a emissão, com log de auditoria.
