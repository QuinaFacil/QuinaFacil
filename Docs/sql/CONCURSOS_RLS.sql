-- =========================
-- CONCURSOS POLICIES
-- =========================

-- Todos os usuários logados podem ver concursos
create policy "concursos_view_all"
on concursos for select
using (auth.uid() is not null);

-- Apenas Admin pode gerenciar concursos
create policy "concursos_admin_all"
on concursos for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- =========================
-- IDEMPOTENCY POLICIES
-- =========================

-- Usuário vê apenas suas próprias chaves de idempotência
create policy "idempotency_self_all"
on idempotency_keys for all
using (user_id = auth.uid());
