# 📑 Catálogo de Auditoria Administrativa - Quina Fácil

Este documento define as ações do Admin que devem obrigatoriamente gerar logs de auditoria para garantir a integridade e segurança do sistema.

---

## 👥 Gestão de Usuários (Category: management / security)
| Ação | Ação Log | Descrição Padrão |
| :--- | :--- | :--- |
| `user_created` | GESTÃO | "Criou o usuário {nome} com o cargo {cargo}" |
| `user_updated` | GESTÃO | "Atualizou o perfil do usuário {nome}" |
| `user_activated` | SEGURANÇA | "Ativou o acesso do usuário {nome}" |
| `user_deactivated` | SEGURANÇA | "Desativou o acesso do usuário {nome}" |
| `user_deleted` | SEGURANÇA | "Excluiu permanentemente o usuário {nome}" |

---

## 🎰 Operações de Loteria (Category: lottery)
| Ação | Ação Log | Descrição Padrão |
| :--- | :--- | :--- |
| `contest_created` | LOTERIA | "Iniciou o novo concurso #{numero}" |
| `contest_updated` | LOTERIA | "Atualizou os dados do concurso #{numero}" |
| `result_processed` | LOTERIA | "Validou os resultados do concurso #{numero} e calculou ganhadores" |
| `contest_deleted` | SEGURANÇA | "Removeu o concurso #{numero} do sistema" |

---

## 💰 Financeiro & Prêmios (Category: finance)
| Ação | Ação Log | Descrição Padrão |
| :--- | :--- | :--- |
| `payment_confirmed` | FINANCEIRO | "Confirmou o pagamento do prêmio ao bilhete #{serial}" |
| `balance_adjusted` | FINANCEIRO | "Realizou ajuste manual de saldo de R$ {valor} para {nome}" |

---

## 🔐 Segurança do Sistema (Category: security)
| Ação | Ação Log | Descrição Padrão |
| :--- | :--- | :--- |
| `admin_login` | SEGURANÇA | "Admin realizou login no painel de controle" |
| `password_changed` | SEGURANÇA | "Alterou a senha do usuário {nome}" |
