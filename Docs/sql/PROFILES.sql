-- Usuário vê apenas ele mesmo
create policy "profiles_self_view"
on profiles for select
using (auth.uid() = id);

-- Admin acesso total
create policy "profiles_admin_all"
on profiles for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);