-- ==========================================
-- MIGRATION: CITIES AND CAMPAIGN GOALS
-- ==========================================

-- 1. Create Cities Table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  state text,
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- 2. Link Profiles to Cities
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id);

-- 3. Link Concursos (Campaigns) to Cities
ALTER TABLE concursos ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id);

-- 4. Add Goal and Indicator fields to Concursos
ALTER TABLE concursos ADD COLUMN IF NOT EXISTS ticket_goal int DEFAULT 0;
ALTER TABLE concursos ADD COLUMN IF NOT EXISTS goal_indicator_active boolean DEFAULT false;

-- 5. RLS for Cities
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone" 
ON cities FOR SELECT 
USING (true);

CREATE POLICY "Cities are manageable by admins" 
ON cities FOR ALL 
USING ((auth.jwt() ->> 'role') = 'admin');

-- 6. Insert some initial data (Optional)
-- INSERT INTO cities (name, state) VALUES ('Belo Horizonte', 'MG'), ('Contagem', 'MG'), ('Betim', 'MG');
