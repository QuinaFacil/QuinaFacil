create policy "audit_logs_admin_view"
on audit_logs for select
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);