-- 1. Adicionar campo de valor do prêmio na tabela de concursos
ALTER TABLE concursos ADD COLUMN IF NOT EXISTS prize_amount numeric(12,2) DEFAULT 0;

-- 2. Atualizar função de processamento para usar o valor definido no concurso
CREATE OR REPLACE FUNCTION process_concurso_winners(concurso_uuid uuid)
RETURNS void AS $$
DECLARE
  draw_numbers int[];
BEGIN
  -- Pega os números sorteados
  SELECT numeros INTO draw_numbers FROM concursos WHERE id = concurso_uuid;

  IF draw_numbers IS NULL THEN
    RAISE EXCEPTION 'Concurso ainda não possui números sorteados';
  END IF;

  -- Limpa processamentos anteriores para evitar duplicidade
  DELETE FROM winners WHERE concurso_id = concurso_uuid;

  -- Insere na tabela de winners todos os tickets que batem exatamente com os números
  INSERT INTO winners (ticket_id, concurso_id, premio)
  SELECT 
    t.id,
    concurso_uuid,
    (SELECT prize_amount FROM concursos WHERE id = concurso_uuid) -- Usa o valor do prêmio do concurso
  FROM tickets t
  WHERE t.concurso_id = concurso_uuid
  AND t.status = 'confirmed'
  AND t.numbers <@ draw_numbers
  AND t.numbers @> draw_numbers;
  
  -- Atualiza o status do concurso para finished
  UPDATE concursos SET status = 'finished' WHERE id = concurso_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
