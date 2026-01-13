-- ============================================
-- Language Learning System - Patterns & Dialogues
-- Migration: 004 - Sentence Patterns, Dialogues
-- ============================================

-- ============================================
-- 句型模板表
-- ============================================
CREATE TABLE IF NOT EXISTS sentence_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES learning_scenarios(id),
    topic_id UUID REFERENCES scenario_topics(id),

    -- 句型內容
    pattern_ja TEXT NOT NULL,
    pattern_structure TEXT,
    pattern_zh TEXT NOT NULL,
    pattern_en TEXT NOT NULL,

    -- 難度與正式程度
    cefr_level VARCHAR(5),
    formality_level VARCHAR(20),

    -- 可填空槽位
    fill_slots JSONB DEFAULT '[]',

    -- 變體
    variations JSONB DEFAULT '[]',

    -- 文法說明
    grammar_point TEXT,
    grammar_explanation_zh TEXT,

    -- 媒體
    audio_url TEXT,

    -- 元資料
    tags TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 用戶句型進度表
-- ============================================
CREATE TABLE IF NOT EXISTS user_pattern_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_id UUID NOT NULL REFERENCES sentence_patterns(id) ON DELETE CASCADE,

    -- 學習狀態
    status VARCHAR(20) DEFAULT 'not_started',

    -- FSRS 參數
    stability DECIMAL(10,4) DEFAULT 0,
    difficulty DECIMAL(10,4) DEFAULT 0,
    due_date TIMESTAMPTZ,
    last_review TIMESTAMPTZ,
    reps INTEGER DEFAULT 0,
    lapses INTEGER DEFAULT 0,

    -- 練習統計
    fill_blank_correct INTEGER DEFAULT 0,
    fill_blank_incorrect INTEGER DEFAULT 0,
    speaking_practice_count INTEGER DEFAULT 0,
    best_pronunciation_score DECIMAL(5,2),

    -- 掌握度
    mastery_level INTEGER DEFAULT 0,

    -- 時間戳
    first_seen_at TIMESTAMPTZ,
    mastered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, pattern_id)
);

-- ============================================
-- 對話腳本表
-- ============================================
CREATE TABLE IF NOT EXISTS dialogues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES learning_scenarios(id),
    topic_id UUID REFERENCES scenario_topics(id),

    -- 標題
    title_zh VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    title_ja VARCHAR(200),

    -- 角色設定
    role_a VARCHAR(50) NOT NULL,
    role_b VARCHAR(50) NOT NULL,

    -- 難度
    difficulty VARCHAR(5) DEFAULT 'A2',

    -- 情境說明
    context_zh TEXT,
    context_en TEXT,
    context_ja TEXT,

    -- 對話內容 (JSONB)
    conversation JSONB NOT NULL,

    -- 變體 (進階情境)
    variations JSONB DEFAULT '[]',

    -- 媒體
    full_audio_url TEXT,

    -- 元資料
    duration_seconds INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 用戶對話進度表
-- ============================================
CREATE TABLE IF NOT EXISTS user_dialogue_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dialogue_id UUID NOT NULL REFERENCES dialogues(id) ON DELETE CASCADE,

    -- 完成狀態
    status VARCHAR(20) DEFAULT 'not_started',

    -- 練習次數
    listen_count INTEGER DEFAULT 0,
    practice_count INTEGER DEFAULT 0,

    -- 最佳成績
    best_score INTEGER,
    best_pronunciation_score DECIMAL(5,2),

    -- 時間戳
    first_practiced_at TIMESTAMPTZ,
    last_practiced_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, dialogue_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_sentence_patterns_scenario ON sentence_patterns(scenario_id);
CREATE INDEX IF NOT EXISTS idx_user_pattern_due ON user_pattern_progress(user_id, due_date)
    WHERE status IN ('learning', 'practicing');
CREATE INDEX IF NOT EXISTS idx_dialogues_scenario ON dialogues(scenario_id);
CREATE INDEX IF NOT EXISTS idx_user_dialogue_user ON user_dialogue_progress(user_id);

-- ============================================
-- RLS 政策
-- ============================================
ALTER TABLE sentence_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pattern_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dialogue_progress ENABLE ROW LEVEL SECURITY;

-- sentence_patterns & dialogues: 所有人可讀
CREATE POLICY "sentence_patterns_select" ON sentence_patterns FOR SELECT USING (true);
CREATE POLICY "dialogues_select" ON dialogues FOR SELECT USING (true);

-- user_pattern_progress: 用戶只能存取自己的資料
CREATE POLICY "user_pattern_progress_select" ON user_pattern_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_pattern_progress_insert" ON user_pattern_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_pattern_progress_update" ON user_pattern_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- user_dialogue_progress: 用戶只能存取自己的資料
CREATE POLICY "user_dialogue_progress_select" ON user_dialogue_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_dialogue_progress_insert" ON user_dialogue_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_dialogue_progress_update" ON user_dialogue_progress
    FOR UPDATE USING (auth.uid() = user_id);
