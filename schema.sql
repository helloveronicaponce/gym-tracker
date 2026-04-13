-- ============================================================
-- GYM TRACKER — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. PERFIS DE USUÁRIO
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  weight_kg  NUMERIC(5,1) DEFAULT 70,
  goal       TEXT         DEFAULT 'hipertrofia',
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- 2. PLANOS DE TREINO
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT         NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- 3. EXERCÍCIOS DE CADA PLANO
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_exercises (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       UUID    NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  exercise_id   INTEGER NOT NULL,        -- ID local do banco de exercícios no app
  exercise_name TEXT    NOT NULL,
  sets          INTEGER NOT NULL DEFAULT 3,
  reps          TEXT    NOT NULL DEFAULT '12',   -- TEXT pois pode ser '60s'
  position      INTEGER NOT NULL DEFAULT 0,       -- ordem no treino
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SESSÕES DE TREINO (histórico)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id           UUID        REFERENCES plans(id) ON DELETE SET NULL,
  plan_name         TEXT        NOT NULL,
  exercises_total   INTEGER     DEFAULT 0,
  exercises_done    INTEGER     DEFAULT 0,
  kcal_estimate     INTEGER     DEFAULT 0,
  duration_minutes  INTEGER,
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  finished_at       TIMESTAMPTZ
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuário acessa apenas seus próprios dados
-- ============================================================

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans            ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises   ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Usuário vê apenas seu perfil"
  ON profiles FOR ALL USING (auth.uid() = id);

-- plans
CREATE POLICY "Usuário vê apenas seus planos"
  ON plans FOR ALL USING (auth.uid() = user_id);

-- plan_exercises (via plano)
CREATE POLICY "Usuário acessa exercícios de seus planos"
  ON plan_exercises FOR ALL
  USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));

-- workout_sessions
CREATE POLICY "Usuário vê apenas suas sessões"
  ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: cria perfil automaticamente ao criar usuário
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ÍNDICES para performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_plans_user_id            ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan_id   ON plan_exercises(plan_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id         ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at      ON workout_sessions(started_at DESC);
