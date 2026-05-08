create policy "winners_admin_all"
on winners for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Vendedor vê ganhadores de seus tickets
create policy "winners_vendedor_view"
on winners for select
using (
  exists (
    select 1 from tickets t
    where t.id = winners.ticket_id
    and t.vendedor_id = auth.uid()
  )
);

-- Gerente vê ganhadores de sua equipe
create policy "winners_gerente_view"
on winners for select
using (
  exists (
    select 1 from tickets t
    join profiles v on v.id = t.vendedor_id
    where t.id = winners.ticket_id
    and v.manager_id = auth.uid()
  )
);