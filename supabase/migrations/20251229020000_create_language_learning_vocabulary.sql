-- ============================================
-- Language Learning System - Vocabulary System
-- Migration: 003 - Vocabulary Tables
-- ============================================

-- ============================================
-- 詞彙表 (主表)
-- ============================================
CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 基本內容
    word_ja VARCHAR(200) NOT NULL,
    reading_hiragana VARCHAR(200),
    reading_romaji VARCHAR(200),

    -- 翻譯
    word_zh VARCHAR(200) NOT NULL,
    word_en VARCHAR(200) NOT NULL,

    -- 分類
    part_of_speech VARCHAR(50),

    -- 難度分級
    cefr_level VARCHAR(5),
    jlpt_level VARCHAR(5),

    -- 媒體
    audio_url TEXT,
    image_url TEXT,

    -- 記憶輔助
    mnemonic_zh TEXT,
    mnemonic_image_url TEXT,

    -- 使用頻率 (1-5)
    frequency_rank INTEGER DEFAULT 3,

    -- 元資料
    tags TEXT[] DEFAULT '{}',
    notes TEXT,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 日文詞彙補充資料
-- ============================================
CREATE TABLE IF NOT EXISTS vocabulary_japanese_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,

    -- 日文特有資料
    word_ja TEXT NOT NULL,
    reading_hiragana TEXT,
    reading_katakana TEXT,
    reading_romaji TEXT,

    -- 漢字資訊
    kanji_components JSONB,
    kanji_stroke_order_url TEXT,

    -- JLPT 分級
    jlpt_level VARCHAR(5),

    -- 敬語層級
    politeness_level VARCHAR(20),

    -- 動詞活用
    verb_group VARCHAR(20),
    verb_conjugations JSONB,

    -- 形容詞活用
    adjective_type VARCHAR(20),
    adjective_conjugations JSONB,

    -- 音調 (pitch accent)
    pitch_accent_pattern INTEGER,
    pitch_accent_diagram TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(vocabulary_id)
);

-- ============================================
-- 英文詞彙補充資料
-- ============================================
CREATE TABLE IF NOT EXISTS vocabulary_english_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,

    -- 英文特有資料
    word_en TEXT NOT NULL,
    pronunciation_ipa TEXT,

    -- 英式/美式差異
    word_en_uk TEXT,
    word_en_us TEXT,
    audio_url_uk TEXT,
    audio_url_us TEXT,

    -- 詞性變化
    plural TEXT,
    past_tense TEXT,
    past_participle TEXT,
    present_participle TEXT,

    -- 常見搭配
    collocations JSONB DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(vocabulary_id)
);

-- ============================================
-- 詞彙語言通用表
-- ============================================
CREATE TABLE IF NOT EXISTS vocabulary_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,

    -- 目標語言
    target_language VARCHAR(10) NOT NULL,

    -- 語言特定內容
    word TEXT NOT NULL,
    reading TEXT,
    romanization TEXT,

    -- 發音
    ipa TEXT,
    audio_url TEXT,

    -- 語言特定標籤
    level_tag VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(vocabulary_id, target_language)
);

-- ============================================
-- 詞彙情境關聯表
-- ============================================
CREATE TABLE IF NOT EXISTS vocabulary_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES learning_scenarios(id),
    topic_id UUID REFERENCES scenario_topics(id),

    -- 使用頻率 (在此情境中)
    usage_frequency INTEGER DEFAULT 3,

    -- 例句
    example_sentence_ja TEXT,
    example_sentence_zh TEXT,
    example_sentence_en TEXT,
    example_audio_url TEXT,

    -- 語境說明
    context_note TEXT,

    -- 正式程度
    formality_level VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(vocabulary_id, scenario_id, topic_id)
);

-- ============================================
-- 詞彙關聯表
-- ============================================
CREATE TABLE IF NOT EXISTS vocabulary_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    related_vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,

    relation_type VARCHAR(50) NOT NULL,
    strength INTEGER DEFAULT 3,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(vocabulary_id, related_vocabulary_id, relation_type),
    CHECK(vocabulary_id != related_vocabulary_id)
);

-- ============================================
-- 用戶詞彙進度表 (FSRS)
-- ============================================
CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,

    -- 學習狀態
    status VARCHAR(20) DEFAULT 'new',

    -- FSRS 參數
    stability DECIMAL(10,4) DEFAULT 0,
    difficulty DECIMAL(10,4) DEFAULT 0,
    elapsed_days INTEGER DEFAULT 0,
    scheduled_days INTEGER DEFAULT 0,
    reps INTEGER DEFAULT 0,
    lapses INTEGER DEFAULT 0,

    -- 排程
    due_date TIMESTAMPTZ,
    last_review TIMESTAMPTZ,

    -- 統計
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,

    -- 學習情境
    learned_in_scenario_id UUID REFERENCES learning_scenarios(id),

    -- 時間戳
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    mastered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, vocabulary_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_vocab_due ON user_vocabulary_progress(user_id, due_date)
    WHERE status IN ('learning', 'reviewing');
CREATE INDEX IF NOT EXISTS idx_user_vocab_status ON user_vocabulary_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_vocabulary_contexts_scenario ON vocabulary_contexts(scenario_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_contexts_vocab ON vocabulary_contexts(vocabulary_id);

-- ============================================
-- RLS 政策
-- ============================================
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_japanese_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_english_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;

-- vocabulary: 所有人可讀
CREATE POLICY "vocabulary_select" ON vocabulary FOR SELECT USING (true);
CREATE POLICY "vocabulary_japanese_data_select" ON vocabulary_japanese_data FOR SELECT USING (true);
CREATE POLICY "vocabulary_english_data_select" ON vocabulary_english_data FOR SELECT USING (true);
CREATE POLICY "vocabulary_languages_select" ON vocabulary_languages FOR SELECT USING (true);
CREATE POLICY "vocabulary_contexts_select" ON vocabulary_contexts FOR SELECT USING (true);
CREATE POLICY "vocabulary_relations_select" ON vocabulary_relations FOR SELECT USING (true);

-- user_vocabulary_progress: 用戶只能存取自己的資料
CREATE POLICY "user_vocabulary_progress_select" ON user_vocabulary_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_vocabulary_progress_insert" ON user_vocabulary_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_vocabulary_progress_update" ON user_vocabulary_progress
    FOR UPDATE USING (auth.uid() = user_id);
