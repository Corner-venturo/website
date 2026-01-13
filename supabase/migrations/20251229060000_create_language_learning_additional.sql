-- ============================================
-- Language Learning System - Additional Features
-- Migration: 007 - Mistakes, Notes, Notifications, Stats, Shop
-- ============================================

-- ============================================
-- 錯題記錄表
-- ============================================
CREATE TABLE IF NOT EXISTS mistake_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 錯誤類型
    mistake_type VARCHAR(50) NOT NULL,

    -- 關聯項目
    vocabulary_id UUID REFERENCES vocabulary(id),
    pattern_id UUID REFERENCES sentence_patterns(id),
    exercise_id UUID REFERENCES exercises(id),

    -- 錯誤內容
    question_content JSONB NOT NULL,
    user_answer TEXT,
    correct_answer TEXT,

    -- 錯誤分析
    error_category VARCHAR(50),

    -- 統計
    mistake_count INTEGER DEFAULT 1,
    last_mistake_at TIMESTAMPTZ DEFAULT NOW(),

    -- 是否已複習修正
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,

    -- AI 分析回饋
    ai_feedback TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 錯誤模式分析表
-- ============================================
CREATE TABLE IF NOT EXISTS mistake_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 錯誤模式
    pattern_type VARCHAR(100) NOT NULL,

    -- 描述
    description_zh TEXT,
    description_en TEXT,

    -- 統計
    occurrence_count INTEGER DEFAULT 0,
    last_occurrence TIMESTAMPTZ,

    -- 建議練習
    recommended_exercises UUID[] DEFAULT '{}',
    recommended_vocabulary UUID[] DEFAULT '{}',

    -- 狀態
    is_active BOOLEAN DEFAULT true,
    improved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, pattern_type)
);

-- ============================================
-- 用戶筆記表
-- ============================================
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 關聯對象
    note_type VARCHAR(50) NOT NULL,

    vocabulary_id UUID REFERENCES vocabulary(id),
    pattern_id UUID REFERENCES sentence_patterns(id),
    dialogue_id UUID REFERENCES dialogues(id),
    scenario_id UUID REFERENCES learning_scenarios(id),

    -- 筆記內容
    content TEXT NOT NULL,

    -- 自訂記憶法
    custom_mnemonic TEXT,
    custom_image_url TEXT,

    -- 標籤
    tags TEXT[] DEFAULT '{}',

    -- 是否公開
    is_public BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 收藏夾表
-- ============================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 收藏對象
    favorite_type VARCHAR(50) NOT NULL,

    vocabulary_id UUID REFERENCES vocabulary(id),
    pattern_id UUID REFERENCES sentence_patterns(id),
    dialogue_id UUID REFERENCES dialogues(id),
    scenario_id UUID REFERENCES learning_scenarios(id),

    -- 收藏夾分類
    folder_name VARCHAR(100) DEFAULT 'default',

    -- 排序
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FSRS 個人化參數表
-- ============================================
CREATE TABLE IF NOT EXISTS user_fsrs_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 語言
    target_language VARCHAR(10) NOT NULL,

    -- FSRS-4.5 的 17 個參數
    parameters DECIMAL[] NOT NULL DEFAULT ARRAY[
        0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01,
        1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
    ],

    -- 期望保持率
    desired_retention DECIMAL(4,3) DEFAULT 0.9,

    -- 最後優化時間
    last_optimized_at TIMESTAMPTZ,

    -- 優化所需的複習次數
    review_count_since_optimize INTEGER DEFAULT 0,

    -- 優化歷史
    optimization_history JSONB DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, target_language)
);

-- ============================================
-- 通知記錄表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 通知類型
    notification_type VARCHAR(50) NOT NULL,

    -- 內容
    title_zh VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    body_zh TEXT,
    body_en TEXT,

    -- 關聯資料
    related_data JSONB,

    -- 狀態
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    -- 推送狀態
    push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMPTZ,
    push_clicked BOOLEAN DEFAULT false,

    -- 排程
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 學習提醒設定表
-- ============================================
CREATE TABLE IF NOT EXISTS reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 提醒類型
    reminder_type VARCHAR(50) NOT NULL,

    -- 是否啟用
    is_enabled BOOLEAN DEFAULT true,

    -- 提醒時間
    reminder_times TIME[] DEFAULT ARRAY['09:00:00'::TIME],

    -- 提醒方式
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT false,

    -- 智能提醒設定
    smart_timing BOOLEAN DEFAULT false,

    -- 提醒頻率限制
    min_interval_hours INTEGER DEFAULT 4,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, reminder_type)
);

-- ============================================
-- 週學習統計表
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 週次
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,

    -- 學習時間
    total_minutes INTEGER DEFAULT 0,
    avg_daily_minutes DECIMAL(6,2) DEFAULT 0,

    -- XP
    total_xp INTEGER DEFAULT 0,

    -- 詞彙
    new_words_learned INTEGER DEFAULT 0,
    words_reviewed INTEGER DEFAULT 0,
    vocabulary_accuracy DECIMAL(5,2),

    -- 句型
    patterns_learned INTEGER DEFAULT 0,
    patterns_practiced INTEGER DEFAULT 0,

    -- 對話
    dialogues_completed INTEGER DEFAULT 0,
    ai_conversation_count INTEGER DEFAULT 0,
    ai_conversation_minutes INTEGER DEFAULT 0,

    -- 連續天數
    streak_days INTEGER DEFAULT 0,

    -- 排名
    global_rank INTEGER,

    -- 與上週比較
    xp_change_percent DECIMAL(6,2),
    minutes_change_percent DECIMAL(6,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, week_start)
);

-- ============================================
-- 月學習統計表
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 月份
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,

    -- 累計統計
    total_minutes INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    total_words_learned INTEGER DEFAULT 0,
    total_patterns_learned INTEGER DEFAULT 0,
    total_dialogues_completed INTEGER DEFAULT 0,

    -- 平均
    avg_daily_minutes DECIMAL(6,2),
    avg_accuracy DECIMAL(5,2),

    -- 目標達成
    goals_completed INTEGER DEFAULT 0,
    goals_total INTEGER DEFAULT 0,

    -- 最長連續
    longest_streak INTEGER DEFAULT 0,

    -- 進步指標
    cefr_progress VARCHAR(10),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, year, month)
);

-- ============================================
-- 商店商品表
-- ============================================
CREATE TABLE IF NOT EXISTS shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 商品資訊
    name_zh VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    description_zh TEXT,
    description_en TEXT,

    -- 類型
    item_type VARCHAR(50) NOT NULL,

    -- 價格 (XP)
    price_xp INTEGER NOT NULL,

    -- 效果
    effect_data JSONB,

    -- 限制
    max_per_user INTEGER,

    -- 圖片
    image_url TEXT,

    -- 狀態
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 用戶購買記錄表
-- ============================================
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(id),

    -- 購買價格
    price_paid INTEGER NOT NULL,

    -- 使用狀態
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,

    -- 過期時間
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 用戶庫存表
-- ============================================
CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 道具類型
    item_type VARCHAR(50) NOT NULL,

    -- 數量
    quantity INTEGER DEFAULT 0,

    -- 最後更新
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, item_type)
);

-- ============================================
-- 衍生學習規則表
-- ============================================
CREATE TABLE IF NOT EXISTS derivation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 來源情境
    source_scenario_id UUID NOT NULL REFERENCES learning_scenarios(id),

    -- 衍生主題
    derived_topic_code VARCHAR(100) NOT NULL,
    derived_topic_name_zh VARCHAR(200) NOT NULL,
    derived_topic_name_en VARCHAR(200),

    -- 衍生原因
    derivation_reason TEXT,

    -- 優先級
    priority INTEGER DEFAULT 1,

    -- 包含的詞彙 ID
    vocabulary_ids UUID[] DEFAULT '{}',

    -- 文化注意事項
    cultural_notes JSONB DEFAULT '[]',

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 文化知識表
-- ============================================
CREATE TABLE IF NOT EXISTS cultural_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 關聯
    scenario_id UUID REFERENCES learning_scenarios(id),
    vocabulary_id UUID REFERENCES vocabulary(id),

    -- 內容
    title_zh VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    title_ja VARCHAR(200),

    content_zh TEXT NOT NULL,
    content_en TEXT,
    content_ja TEXT,

    -- 類型
    note_type VARCHAR(50),

    -- 媒體
    image_url TEXT,

    -- 重要性
    importance INTEGER DEFAULT 3,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_mistake_user_unresolved ON mistake_records(user_id, is_resolved)
    WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_mistake_type ON mistake_records(user_id, mistake_type);
CREATE INDEX IF NOT EXISTS idx_user_notes_type ON user_notes(user_id, note_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON learning_notifications(user_id, is_read)
    WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_weekly_stats_user ON weekly_stats(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_stats_user ON monthly_stats(user_id, year DESC, month DESC);

-- ============================================
-- RLS 政策
-- ============================================
ALTER TABLE mistake_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_fsrs_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE derivation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_notes ENABLE ROW LEVEL SECURITY;

-- shop_items, derivation_rules, cultural_notes: 所有人可讀
CREATE POLICY "shop_items_select" ON shop_items FOR SELECT USING (true);
CREATE POLICY "derivation_rules_select" ON derivation_rules FOR SELECT USING (true);
CREATE POLICY "cultural_notes_select" ON cultural_notes FOR SELECT USING (true);

-- 用戶私有資料的 RLS 政策
CREATE POLICY "mistake_records_select" ON mistake_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mistake_records_insert" ON mistake_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mistake_records_update" ON mistake_records FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "mistake_patterns_select" ON mistake_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mistake_patterns_insert" ON mistake_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mistake_patterns_update" ON mistake_patterns FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_notes_select" ON user_notes FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "user_notes_insert" ON user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_notes_update" ON user_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_notes_delete" ON user_notes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "user_favorites_select" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_favorites_insert" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_favorites_delete" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "user_fsrs_parameters_select" ON user_fsrs_parameters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_fsrs_parameters_insert" ON user_fsrs_parameters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_fsrs_parameters_update" ON user_fsrs_parameters FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "learning_notifications_select" ON learning_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "learning_notifications_update" ON learning_notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reminder_settings_select" ON reminder_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reminder_settings_insert" ON reminder_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reminder_settings_update" ON reminder_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "weekly_stats_select" ON weekly_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "monthly_stats_select" ON monthly_stats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_purchases_select" ON user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_purchases_insert" ON user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_inventory_select" ON user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_inventory_insert" ON user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_inventory_update" ON user_inventory FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 預設商店商品資料
-- ============================================
INSERT INTO shop_items (name_zh, name_en, item_type, price_xp, effect_data, description_zh) VALUES
('連續保護卡', 'Streak Freeze', 'streak_freeze', 200, '{"days": 1}', '保護一天的連續記錄'),
('雙倍經驗卡 (1小時)', 'XP Boost (1 Hour)', 'xp_boost', 100, '{"multiplier": 2, "duration_hours": 1}', '一小時內獲得雙倍經驗'),
('雙倍經驗卡 (24小時)', 'XP Boost (24 Hours)', 'xp_boost', 500, '{"multiplier": 2, "duration_hours": 24}', '24小時內獲得雙倍經驗')
ON CONFLICT DO NOTHING;
