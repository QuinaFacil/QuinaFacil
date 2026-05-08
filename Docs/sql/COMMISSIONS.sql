-- Vendedor vê sua comissão
create policy "commissions_vendedor_view"
on commissions for select
using (vendedor_id = auth.uid());

-- Gerente vê apenas a comissão de sua equipe
create policy "commissions_gerente_view"
on commissions for select
using (
  exists (
    select 1 from profiles v
    where v.id = commissions.vendedor_id
    and v.manager_id = auth.uid()
  )
);

-- Admin acesso total
create policy "commissions_admin_all"
on commissions for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);