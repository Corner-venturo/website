-- Fitness 健身功能資料表
-- 用於記錄用戶的健身訓練

BEGIN;

-- 訓練記錄表 (workout_sessions)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date date NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes integer, -- 訓練時長（分鐘）
  total_volume numeric DEFAULT 0, -- 總訓練容量 (kg)
  total_sets integer DEFAULT 0, -- 總組數
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 訓練動作記錄表 (workout_exercises)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id integer NOT NULL, -- 對應前端動作庫的 ID
  exercise_name text NOT NULL,
  exercise_category text NOT NULL, -- chest, back, legs, shoulders, arms, core, cardio
  order_index integer DEFAULT 0, -- 動作順序
  created_at timestamptz DEFAULT now()
);

-- 訓練組數記錄表 (workout_sets)
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  weight numeric DEFAULT 0, -- 重量 (kg)
  reps integer DEFAULT 0, -- 次數
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 用戶健身統計表 (fitness_stats)
CREATE TABLE IF NOT EXISTS public.fitness_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_workouts integer DEFAULT 0,
  total_volume numeric DEFAULT 0,
  total_sets integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_workout_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON public.workout_sessions(workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON public.workout_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_id ON public.workout_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_fitness_stats_user_id ON public.fitness_stats(user_id);

-- RLS 策略
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_stats ENABLE ROW LEVEL SECURITY;

-- workout_sessions RLS
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout sessions" ON public.workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions" ON public.workout_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- workout_exercises RLS
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_exercises.session_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own workout exercises" ON public.workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_exercises.session_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_exercises.session_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout exercises" ON public.workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_exercises.session_id AND ws.user_id = auth.uid()
    )
  );

-- workout_sets RLS
CREATE POLICY "Users can view own workout sets" ON public.workout_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workout_sessions ws ON ws.id = we.session_id
      WHERE we.id = workout_sets.workout_exercise_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own workout sets" ON public.workout_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workout_sessions ws ON ws.id = we.session_id
      WHERE we.id = workout_sets.workout_exercise_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout sets" ON public.workout_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workout_sessions ws ON ws.id = we.session_id
      WHERE we.id = workout_sets.workout_exercise_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout sets" ON public.workout_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workout_sessions ws ON ws.id = we.session_id
      WHERE we.id = workout_sets.workout_exercise_id AND ws.user_id = auth.uid()
    )
  );

-- fitness_stats RLS
CREATE POLICY "Users can view own fitness stats" ON public.fitness_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fitness stats" ON public.fitness_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fitness stats" ON public.fitness_stats
  FOR UPDATE USING (auth.uid() = user_id);

COMMIT;
