🔹 TABELA: profiles (usuários)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text check (role in ('admin','gerente','vendedor')),
  manager_id uuid references profiles(id),
  phone text,
  pix_key text,
  active boolean default true,
  created_at timestamp default now()
);

🔹 TABELA: system_settings
create table system_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text not null,
  description text,
  updated_at timestamp default now()
);

🔹 TABELA: concursos
create table concursos (
  id uuid primary key default uuid_generate_v4(),
  concurso_numero int unique not null,
  numeros int[] check (cardinality(numeros) = 5),
  status text check (status in ('open','closed','finished')) default 'open',
  draw_date timestamp,
  created_at timestamp default now()
);

🔹 TABELA: tickets
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  serial_number text unique not null,
  vendedor_id uuid references profiles(id),
  concurso_id uuid references concursos(id),
  
  numbers int[] not null check (cardinality(numbers) = 5),
  amount numeric(10,2) not null check (amount > 0),
  
  status text check (status in ('processing','printed','confirmed','error')) default 'processing',
  
  print_attempts int default 0,
  last_print_error text,
  
  signature text,
  signature_version text,
  
  time_source text check (time_source in ('ntp','fallback')),
  
  created_at timestamp default now()
);

🔹 TABELA: idempotency_keys
create table idempotency_keys (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  user_id uuid references profiles(id),
  response jsonb,
  status text check (status in ('processing','completed')) default 'processing',
  created_at timestamp default now()
);

🔹 TABELA: audit_logs
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

🔹 TABELA: winners
create table winners (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references tickets(id) on delete cascade,
  concurso_id uuid references concursos(id) on delete cascade,
  premio numeric(12,2),
  created_at timestamp default now()
);

🔹 TABELA: commissions
create table commissions (
  id uuid primary key default uuid_generate_v4(),
  vendedor_id uuid references profiles(id) on delete cascade,
  ticket_id uuid references tickets(id) on delete cascade,
  amount numeric(10,2) check (amount >= 0),
  status text check (status in ('pending','paid')) default 'pending',
  processed_at timestamp,
  created_at timestamp default now()
);


🔐 2. RLS (ROW LEVEL SECURITY)

🔹 ATIVAR
alter table profiles enable row level security;
alter table tickets enable row level security;
alter table audit_logs enable row level security;
alter table commissions enable row level security;
alter table winners enable row level security;

🔹 PROFILES
create policy "profiles_self_view" on profiles for select using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

🔹 TICKETS
create policy "tickets_vendedor_view" on tickets for select using (vendedor_id = auth.uid());
create policy "tickets_gerente_view" on tickets for select using (exists (select 1 from profiles v where v.id = tickets.vendedor_id and v.manager_id = auth.uid()));
create policy "tickets_admin_all" on tickets for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

🔹 COMMISSIONS
create policy "commissions_vendedor_view" on commissions for select using (vendedor_id = auth.uid());
create policy "commissions_gerente_view" on commissions for select using (exists (select 1 from profiles v where v.id = commissions.vendedor_id and v.manager_id = auth.uid()));
create policy "commissions_admin_all" on commissions for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

🔹 AUDIT LOGS (somente admin)
create policy "audit_logs_admin_view" on audit_logs for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

🔹 SYSTEM SETTINGS
create policy "system_settings_admin_all" on system_settings for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "system_settings_view_all" on system_settings for select using (true);

🔹 CONCURSOS
create policy "concursos_admin_all" on concursos for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "concursos_view_all" on concursos for select using (true);


⚠️ IMPORTANTE (NÃO IGNORA ISSO)
INSERT de ticket NÃO deve vir direto do client
Use:
Edge Function
ou API do Next.js

👉 Isso garante:

idempotência
assinatura
auditoria
📁 3. ARQUITETURA NEXT.JS (PROJETO REAL)

Estrutura baseada em App Router:

/app
  /(auth)
    /login
      page.tsx

  /(dashboard)
    /layout.tsx

    /vendedor
      /dashboard
      /emitir
      /comissao
      /relatorios
      /perfil

    /gerente
      /dashboard
      /usuarios
      /relatorios

    /admin
      /dashboard
      /usuarios
      /relatorios
      /resultados
      /auditoria

/api
  /tickets
    route.ts
  /results
    route.ts
  /users
    route.ts

/lib
  supabase.ts
  auth.ts
  rbac.ts
  idempotency.ts
  signature.ts

/services
  ticket.service.ts
  commission.service.ts
  audit.service.ts

/components
  /ui
  /dashboard
  /forms
  /tables

/middleware.ts
🔐 RBAC (middleware)
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(req) {
  const role = req.cookies.get('role')

  if (req.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect('/login')
  }

  return NextResponse.next()
}