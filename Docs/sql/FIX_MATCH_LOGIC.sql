-- ==========================================
-- FIX: WINNER MATCH LOGIC (QUADRA & QUINA)
-- ==========================================

-- 1. Ensure matches column exists
ALTER TABLE winners ADD COLUMN IF NOT EXISTS matches int;

-- 2. Improved Processing Function
CREATE OR REPLACE FUNCTION process_concurso_winners(concurso_uuid uuid)
RETURNS void AS $$
DECLARE
  draw_numbers int[];
  total_prize numeric(12,2);
  quina_prize numeric(12,2);
  quadra_prize numeric(12,2);
  quina_count int;
  quadra_count int;
BEGIN
  -- 1. Get drawn numbers and total prize amount
  SELECT numeros, prize_amount INTO draw_numbers, total_prize 
  FROM concursos WHERE id = concurso_uuid;

  IF draw_numbers IS NULL THEN
    RAISE EXCEPTION 'Concurso ainda não possui números sorteados';
  END IF;

  -- 2. Clear previous processing
  DELETE FROM winners WHERE concurso_id = concurso_uuid;

  -- 3. Identify winners and count matches
  -- Note: We use unnest and ANY to count common elements between ticket numbers and drawn numbers
  INSERT INTO winners (ticket_id, concurso_id, matches)
  SELECT 
    t.id,
    concurso_uuid,
    (
      SELECT count(*)::int
      FROM unnest(t.numbers) as num
      WHERE num = ANY(draw_numbers)
    ) as hits
  FROM tickets t
  WHERE t.concurso_id = concurso_uuid
  AND t.status = 'confirmed';

  -- Remove those with less than 4 matches (not winners)
  DELETE FROM winners WHERE concurso_id = concurso_uuid AND (matches IS NULL OR matches < 4);

  -- 4. Calculate Prize Division
  -- Default distribution: 70% for Quina winners (5 hits), 30% for Quadra winners (4 hits)
  SELECT count(*) INTO quina_count FROM winners WHERE concurso_id = concurso_uuid AND matches = 5;
  SELECT count(*) INTO quadra_count FROM winners WHERE concurso_id = concurso_uuid AND matches = 4;

  -- Update Quina prizes (Split 70% of total prize)
  IF quina_count > 0 THEN
    quina_prize := (total_prize * 0.70) / quina_count;
    UPDATE winners SET premio = quina_prize WHERE concurso_id = concurso_uuid AND matches = 5;
  END IF;

  -- Update Quadra prizes (Split 30% of total prize)
  IF quadra_count > 0 THEN
    quadra_prize := (total_prize * 0.30) / quadra_count;
    UPDATE winners SET premio = quadra_prize WHERE concurso_id = concurso_uuid AND matches = 4;
  END IF;

  -- 5. Mark contest as finished
  UPDATE concursos SET status = 'finished' WHERE id = concurso_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
