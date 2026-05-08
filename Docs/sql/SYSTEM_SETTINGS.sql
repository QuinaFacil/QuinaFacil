-- Apenas Admin pode ver e editar configurações
create policy "system_settings_admin_all"
on system_settings for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Todos os usuários podem ver as configurações (para validar horários/taxas no frontend)
create policy "system_settings_view_all"
on system_settings for select
using (true);
