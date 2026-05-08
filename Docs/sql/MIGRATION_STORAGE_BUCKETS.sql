-- MIGRATION: STORAGE BUCKETS AND POLICIES
-- Garante a existência dos buckets e limpa políticas antigas para evitar erros de duplicidade

-- 1. Criação dos Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('lottery-assets', 'lottery-assets', true),
       ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Limpeza de Políticas Antigas (Prevenção de erro "already exists")
DROP POLICY IF EXISTS "Public Read Lottery Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins Manage Lottery Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users Manage Own Avatars" ON storage.objects;

-- 3. Novas Políticas para Banners (lottery-assets)
-- Público pode ler os banners
CREATE POLICY "Public Read Lottery Assets" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'lottery-assets');

-- Apenas admins podem gerenciar banners
CREATE POLICY "Admins Manage Lottery Assets" 
ON storage.objects FOR ALL 
TO authenticated 
USING (
  bucket_id = 'lottery-assets' 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  bucket_id = 'lottery-assets' 
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Novas Políticas para Avatares (avatar)
-- Público pode ler as fotos de perfil
CREATE POLICY "Public Read Avatars" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'avatar');

-- Usuários autenticados podem gerenciar seus próprios arquivos na pasta com seu UID
CREATE POLICY "Users Manage Own Avatars" 
ON storage.objects FOR ALL 
TO authenticated 
USING (
  bucket_id = 'avatar' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatar' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
