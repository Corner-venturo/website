-- ============================================
-- Language Learning System - Scenarios & Goals
-- Migration: 002 - Learning Scenarios, Topics, Goals
-- ============================================

-- ============================================
-- 學習情境表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,

    -- 多語言名稱
    name_zh VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    name_ja VARCHAR(200) NOT NULL,

    -- 分類
    category VARCHAR(50) NOT NULL,

    -- 難度與估計時間
    difficulty INTEGER DEFAULT 2,
    cefr_min_level VARCHAR(5) DEFAULT 'A2',
    estimated_hours DECIMAL(4,1) DEFAULT 8.0,

    -- 內容統計
    total_vocabulary INTEGER DEFAULT 0,
    total_patterns INTEGER DEFAULT 0,
    total_dialogues INTEGER DEFAULT 0,

    -- 適用角色 (可多選)
    applicable_roles UUID[] DEFAULT '{}',

    -- 描述
    description_zh TEXT,
    description_en TEXT,
    description_ja TEXT,

    -- 圖片
    cover_image_url TEXT,
    icon VARCHAR(10),

    -- 排序與狀態
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 情境主題表
-- ============================================
CREATE TABLE IF NOT EXISTS scenario_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES learning_scenarios(id) ON DELETE CASCADE,

    code VARCHAR(100) NOT NULL,
    name_zh VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    name_ja VARCHAR(200) NOT NULL,

    -- 順序與必要性
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,

    -- 內容統計
    vocabulary_count INTEGER DEFAULT 0,
    pattern_count INTEGER DEFAULT 0,

    -- 狀態
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(scenario_id, code)
);

-- ============================================
-- 用戶學習目標表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES learning_scenarios(id),

    -- 目標設定
    target_date DATE NOT NULL,
    priority INTEGER DEFAULT 1,

    -- 關聯旅行團 (可選)
    trip_id UUID,

    -- 進度追蹤
    status VARCHAR(20) DEFAULT 'active',
    progress_percentage DECIMAL(5,2) DEFAULT 0,

    -- 統計
    vocabulary_learned INTEGER DEFAULT 0,
    vocabulary_total INTEGER DEFAULT 0,
    patterns_learned INTEGER DEFAULT 0,
    patterns_total INTEGER DEFAULT 0,
    dialogues_completed INTEGER DEFAULT 0,
    dialogues_total INTEGER DEFAULT 0,

    -- 時間戳
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_studied_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, scenario_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_learning_goals_user ON learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_status ON learning_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scenario_topics_scenario ON scenario_topics(scenario_id);

-- ============================================
-- RLS 政策
-- ============================================
ALTER TABLE learning_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;

-- learning_scenarios: 所有人可讀
CREATE POLICY "learning_scenarios_select" ON learning_scenarios
    FOR SELECT USING (true);

-- scenario_topics: 所有人可讀
CREATE POLICY "scenario_topics_select" ON scenario_topics
    FOR SELECT USING (true);

-- learning_goals: 用戶只能存取自己的資料
CREATE POLICY "learning_goals_select" ON learning_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "learning_goals_insert" ON learning_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_goals_update" ON learning_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "learning_goals_delete" ON learning_goals
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 預設情境資料
-- ============================================
INSERT INTO learning_scenarios (code, name_zh, name_en, name_ja, category, difficulty, cefr_min_level, estimated_hours, icon, sort_order) VALUES
('restaurant_booking', '餐廳訂位', 'Restaurant Booking', 'レストラン予約', 'dining', 2, 'A2', 8.0, '🍽️', 1),
('basic_shopping', '基本購物', 'Basic Shopping', '基本的な買い物', 'shopping', 1, 'A1', 6.0, '🛍️', 2),
('asking_directions', '問路', 'Asking for Directions', '道を尋ねる', 'transport', 2, 'A2', 5.0, '🗺️', 3),
('hotel_checkin', '飯店入住', 'Hotel Check-in', 'ホテルチェックイン', 'accommodation', 2, 'A2', 6.0, '🏨', 4),
('airport_navigation', '機場報到', 'Airport Navigation', '空港での手続き', 'transport', 3, 'B1', 8.0, '✈️', 5),
('emergency_situations', '緊急狀況', 'Emergency Situations', '緊急事態', 'emergency', 3, 'B1', 10.0, '🚨', 6)
ON CONFLICT (code) DO NOTHING;
