-- Habilitar deleção em cascata para tickets quando um concurso for removido
-- Primeiro, removemos a constraint atual
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_concurso_id_fkey;

-- Depois, recriamos com ON DELETE CASCADE
ALTER TABLE tickets 
ADD CONSTRAINT tickets_concurso_id_fkey 
FOREIGN KEY (concurso_id) 
REFERENCES concursos(id) 
ON DELETE CASCADE;
