-- Vendedor só vê os próprios
create policy "tickets_vendedor_view"
on tickets for select
using (vendedor_id = auth.uid());

-- Vendedor pode inserir tickets
create policy "tickets_vendedor_insert"
on tickets for insert
with check (vendedor_id = auth.uid());

-- Gerente vê apenas os tickets de sua equipe
create policy "tickets_gerente_view"
on tickets for select
using (
  exists (
    select 1 from profiles v
    where v.id = tickets.vendedor_id
    and v.manager_id = auth.uid()
  )
);

-- Admin acesso total
create policy "tickets_admin_all"
on tickets for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);