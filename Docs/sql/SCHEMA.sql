-- EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES
-- =========================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null check (role in ('admin','gerente','vendedor')),
  manager_id uuid references profiles(id),
  
  phone text,
  pix_key text,
  
  active boolean default true,
  created_at timestamp default now()
);

-- =========================
-- SYSTEM SETTINGS
-- =========================
create table system_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text not null,
  description text,
  updated_at timestamp default now()
);

-- Inserir padrões iniciais
insert into system_settings (key, value, description) values
('commission_rate', '20', 'Taxa de comissão fixa em porcentagem'),
('opening_time', '06:00', 'Horário de abertura das vendas (HH:MM)'),
('closing_time', '17:00', 'Horário de encerramento das vendas (HH:MM)'),
('system_active', 'true', 'Kill-switch global do sistema');

-- =========================
-- CONCURSOS
-- =========================
create table concursos (
  id uuid primary key default uuid_generate_v4(),
  concurso_numero int unique not null,
  numeros int[] check (cardinality(numeros) = 5),
  status text not null check (status in ('open','closed','finished')) default 'open',
  draw_date timestamp,
  prize_amount numeric(12,2) default 0,
  processed_by uuid references profiles(id),
  created_at timestamp default now()
);

-- =========================
-- TICKETS
-- =========================
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  
  serial_number text unique not null,
  vendedor_id uuid not null references profiles(id),
  concurso_id uuid not null references concursos(id), -- Link obrigatório com o concurso
  
  numbers int[] not null check (cardinality(numbers) = 5),
  amount numeric(10,2) not null check (amount > 0),
  
  status text not null check (status in ('processing','printed','confirmed','error')),
  
  print_attempts int default 0,
  last_print_error text,
  
  signature text,
  signature_version text,
  
  comprador_nome text,
  comprador_cpf text,
  comprador_telefone text,
  
  time_source text check (time_source in ('ntp','fallback')),
  
  created_at timestamp default now()
);

create index idx_tickets_vendedor on tickets(vendedor_id);
create index idx_tickets_concurso on tickets(concurso_id);

-- =========================
-- IDEMPOTENCY
-- =========================
create table idempotency_keys (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  user_id uuid references profiles(id),
  response jsonb,
  status text check (status in ('processing','completed')),
  created_at timestamp default now()
);

-- =========================
-- AUDIT LOGS
-- =========================
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  action text,
  entity text,
  entity_id uuid,
  metadata jsonb,
  signature text,
  created_at timestamp default now()
);

create index idx_audit_user on audit_logs(user_id);

-- =========================
-- WINNERS
-- =========================
create table winners (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references tickets(id) on delete cascade,
  concurso_id uuid references concursos(id) on delete cascade,
  premio numeric(12,2),
  created_at timestamp default now()
);

-- =========================
-- COMMISSIONS
-- =========================
create table commissions (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid references profiles(id) on delete cascade,
  ticket_id uuid references tickets(id) on delete cascade,
  amount numeric(10,2) check (amount >= 0),
  status text not null check (status in ('pending','paid')) default 'pending',
  processed_at timestamp,
  created_at timestamp default now()
);

create index idx_commissions_vendedor on commissions(vendedor_id);

-- =========================
-- WITHDRAWALS
-- =========================
create table withdrawals (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid references profiles(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  pix_key text,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  processed_at timestamp,
  created_at timestamp default now()
);

create index idx_withdrawals_vendedor on withdrawals(vendedor_id);
