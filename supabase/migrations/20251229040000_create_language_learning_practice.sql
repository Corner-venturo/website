-- ============================================
-- Language Learning System - Practice & Assessment
-- Migration: 005 - Exercises, Results, AI Conversations
-- ============================================

-- ============================================
-- 練習題目表
-- ============================================
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES learning_scenarios(id),
    topic_id UUID REFERENCES scenario_topics(id),

    -- 題型
    exercise_type VARCHAR(50) NOT NULL,

    -- 題目內容
    question_data JSONB NOT NULL,

    -- 答案
    correct_answer JSONB,
    acceptable_answers JSONB DEFAULT '[]',

    -- 難度與分數
    difficulty INTEGER DEFAULT 2,
    points INTEGER DEFAULT 10,

    -- 元資料
    tags TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 用戶練習結果表
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    session_id UUID,

    -- 回答內容
    user_answer JSONB,

    -- 評估結果
    is_correct BOOLEAN,
    score DECIMAL(5,2),

    -- 語音評估
    pronunciation_assessment JSONB,

    -- 回饋
    feedback_given TEXT,

    -- 時間
    time_spent_seconds INTEGER,
    attempt_number INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI 對話記錄表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES learning_scenarios(id),

    -- 角色設定
    user_role VARCHAR(50) NOT NULL,
    ai_role VARCHAR(50) NOT NULL,

    -- 對話內容
    messages JSONB NOT NULL DEFAULT '[]',

    -- 評估
    overall_score INTEGER,
    feedback JSONB,

    -- 時間
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- 狀態
    status VARCHAR(20) DEFAULT 'active',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 發音評估歷史表
-- ============================================
CREATE TABLE IF NOT EXISTS pronunciation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 評估內容
    content_type VARCHAR(50) NOT NULL,
    vocabulary_id UUID REFERENCES vocabulary(id),
    pattern_id UUID REFERENCES sentence_patterns(id),
    dialogue_id UUID REFERENCES dialogues(id),

    -- 評估文本
    text_evaluated TEXT NOT NULL,

    -- 音頻
    user_audio_url TEXT,

    -- 評分
    overall_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    fluency_score DECIMAL(5,2),
    prosody_score DECIMAL(5,2),

    -- 詳細評估
    word_scores JSONB,

    -- AI 回饋
    feedback TEXT,
    improvement_tips TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_exercise_results_user ON exercise_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_scenario ON exercises(scenario_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pronunciation_user ON pronunciation_history(user_id, created_at DESC);

-- ============================================
-- RLS 政策
-- ============================================
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciation_history ENABLE ROW LEVEL SECURITY;

-- exercises: 所有人可讀
CREATE POLICY "exercises_select" ON exercises FOR SELECT USING (true);

-- exercise_results: 用戶只能存取自己的資料
CREATE POLICY "exercise_results_select" ON exercise_results
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "exercise_results_insert" ON exercise_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ai_conversations: 用戶只能存取自己的資料
CREATE POLICY "ai_conversations_select" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_conversations_insert" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_conversations_update" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- pronunciation_history: 用戶只能存取自己的資料
CREATE POLICY "pronunciation_history_select" ON pronunciation_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pronunciation_history_insert" ON pronunciation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);
