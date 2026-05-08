-- ==========================================
-- UPDATE: RLS POLICIES FOR MANAGERS
-- ==========================================

-- 1. Permissão para Gerente gerenciar CONCURSOS da sua cidade
DROP POLICY IF EXISTS "concursos_manager_all" ON concursos;
CREATE POLICY "concursos_manager_all"
ON concursos FOR ALL
USING (
  EXISTS (
    select 1 from profiles p
    where p.id = auth.uid() 
    and p.role = 'gerente' 
    and p.city_id = concursos.city_id
  )
);

-- 2. Permissão para Gerente gerenciar TICKETS de sua equipe (incluindo DELETE)
DROP POLICY IF EXISTS "tickets_gerente_all" ON tickets;
CREATE POLICY "tickets_gerente_all"
ON tickets FOR ALL
USING (
  EXISTS (
    select 1 from profiles v
    where v.id = tickets.vendedor_id
    and v.manager_id = auth.uid()
  )
);

-- 3. Permissão para Gerente ver vencedores da sua cidade
DROP POLICY IF EXISTS "winners_gerente_view" ON winners;
CREATE POLICY "winners_gerente_view"
ON winners FOR SELECT
USING (
  EXISTS (
    select 1 from concursos c
    join profiles p on p.city_id = c.city_id
    where c.id = winners.concurso_id
    and p.id = auth.uid()
    and p.role = 'gerente'
  )
);

-- 4. Permissão para Gerente gerenciar banners no bucket lottery-assets
DROP POLICY IF EXISTS "Managers Manage Lottery Assets" ON storage.objects;
CREATE POLICY "Managers Manage Lottery Assets"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'lottery-assets'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'gerente'
)
WITH CHECK (
  bucket_id = 'lottery-assets'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'gerente'
);
