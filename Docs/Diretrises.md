📄 Descrição Completa do Projeto — Quina Fácil
🧠 Visão Geral

O Quina Fácil é uma plataforma web desenvolvida para gerenciar de forma segura, auditável e eficiente a emissão e o controle de bilhetes de loteria. O sistema foi projetado para operar em um ambiente comercial com múltiplos níveis de usuários, garantindo controle operacional, rastreabilidade de dados e organização financeira.

A plataforma não possui integração automática com sistemas oficiais de loteria, sendo estruturada para operar com entrada manual de resultados e controle interno das operações.

🎯 Objetivo do Sistema

O principal objetivo do Quina Fácil é:

Permitir a emissão controlada de bilhetes de loteria
Registrar e organizar todas as operações de venda
Garantir auditoria completa de todas as ações no sistema
Controlar equipes de venda (vendedores)
Calcular automaticamente comissões
Facilitar a gestão administrativa e financeira
👥 Tipos de Usuários

O sistema é estruturado com três níveis de acesso:

👑 Administrador

Possui controle total do sistema:

Gerenciar usuários (criar, editar, desativar)
Criar novos administradores e gerentes
Visualizar relatórios completos do sistema
Acessar logs de auditoria
Inserir manualmente resultados oficiais dos concursos
Identificar bilhetes vencedores
Controlar toda a operação
🧑‍💼 Gerente

Possui controle operacional intermediário:

Gerenciar sua equipe de vendedores (vinculados via manager_id)
Visualizar relatórios gerais e específicos de sua equipe
Acompanhar desempenho de vendas da equipe
Não pode criar administradores ou outros gerentes
💰 Vendedor

Responsável pela operação direta:

Emitir bilhetes de loteria
Registrar vendas
Confirmar pagamento manual
Visualizar seus próprios relatórios
Acompanhar sua comissão (20% sobre vendas)
Gerenciar seus dados cadastrais
🎟️ Emissão de Bilhetes

O processo de emissão é um dos pontos centrais do sistema:

O vendedor insere os números e valor da aposta
Confirma o recebimento do pagamento manualmente
O sistema gera um bilhete com:
Número de série único
Assinatura digital (hash)
Marca d’água
O bilhete é salvo no banco de dados
Um layout de impressão é gerado para impressoras térmicas
⏰ Controle de Horário

O sistema possui uma regra rígida de operação:

Permite emissão de bilhetes apenas:
De segunda a sexta
Das 06h às 17h

Fora desse período:

A emissão é automaticamente bloqueada
Tentativas são registradas para auditoria
💰 Controle de Comissão

Cada vendedor possui:

Comissão fixa de 20% sobre o valor das vendas
Cálculo automático baseado nos bilhetes emitidos
Visualização mensal do valor acumulado
📊 Relatórios

O sistema fornece relatórios detalhados:

Para vendedores:
Total vendido
Comissão acumulada
Histórico de bilhetes
Para gerentes:
Desempenho da equipe
Vendas por período
Ranking de vendedores
Para administradores:
Relatórios financeiros completos
Filtros avançados
Visão global do sistema
🏆 Resultados e Vencedores
Os resultados dos concursos são inseridos manualmente pelo administrador
O sistema cruza automaticamente:
Números dos bilhetes
Números do concurso
Identifica os vencedores
Atualiza o status dos bilhetes
🛡️ Auditoria e Segurança

O sistema foi projetado para ser 100% auditável, incluindo:

Registro de todas as ações (logs)
Histórico de alterações
Rastreamento por usuário
Registro de tentativas inválidas
Estrutura preparada para assinatura digital de dados
🔐 Controle de Acesso (RBAC)

Cada usuário possui permissões específicas:

Vendedores acessam apenas seus dados
Gerentes acessam dados dos vendedores vinculados à sua equipe
Administradores possuem acesso total

Esse controle é aplicado tanto no frontend quanto no banco de dados através de RLS (Row Level Security).

🧾 Persistência de Dados

O sistema utiliza banco de dados estruturado para:

Armazenar bilhetes emitidos
Registrar usuários
Controlar comissões
Guardar logs de auditoria
Armazenar resultados e vencedores
🖨️ Impressão
Os bilhetes são gerados com layout compatível com impressoras térmicas
Incluem:
Número de série
Dados da aposta
Identificação visual (marca d’água)
⚙️ Tecnologias Utilizadas

O sistema é construído com tecnologias modernas:

Frontend: Next.js + React + TypeScript + Tailwind CSS
Backend / Banco: Supabase (PostgreSQL + Auth + RLS)
Hospedagem: Vercel
🔄 Operação Manual (Importante)

O sistema depende de operação manual em alguns pontos:

Recebimento de pagamentos (feito pelo vendedor)
Inserção de resultados oficiais (feito pelo administrador)
⚠️ Considerações Legais
O sistema não possui vínculo com órgãos oficiais de loteria
Toda operação é de responsabilidade do operador da plataforma
O sistema atua apenas como ferramenta de gestão
🧠 Conclusão

O Quina Fácil é uma solução completa para controle e operação de vendas de bilhetes de loteria, com foco em:

segurança
rastreabilidade
controle operacional
simplicidade de uso

Foi projetado para escalar e manter integridade mesmo em ambientes com múltiplos usuários e alto volume de transações.