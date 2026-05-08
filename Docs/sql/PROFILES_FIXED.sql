-- Removendo políticas antigas com recursão
drop policy if exists "profiles_admin_all" on profiles;
drop policy if exists "profiles_self_view" on profiles;

-- Política revisada: Usuário vê seu próprio perfil
create policy "profiles_self_view"
on profiles for select
using (auth.uid() = id);

-- Política revisada: Admin vê tudo (usando JWT para evitar recursão)
create policy "profiles_admin_all"
on profiles for all
using (
  (auth.jwt() ->> 'role') = 'admin'
);
