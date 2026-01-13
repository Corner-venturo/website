-- ============================================
-- Language Learning System - Core Tables
-- Migration: 001 - Roles, Profiles, Streaks
-- ============================================

-- ============================================
-- 身份角色表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_zh VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ja VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 預設資料
INSERT INTO learning_roles (code, name_zh, name_en, name_ja, icon, sort_order) VALUES
('tour_leader', '領隊', 'Tour Leader', 'ツアーリーダー', '👨‍✈️', 1),
('traveler', '旅客', 'Traveler', '旅行者', '🧳', 2),
('travel_agent', '旅行社人員', 'Travel Agent', '旅行会社スタッフ', '💼', 3),
('hotel_staff', '飯店人員', 'Hotel Staff', 'ホテルスタッフ', '🏨', 4),
('restaurant_staff', '餐廳人員', 'Restaurant Staff', 'レストランスタッフ', '🍽️', 5)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 用戶學習檔案表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 基本資料
    display_name VARCHAR(100),
    gender VARCHAR(20),

    -- 學習設定
    role_id UUID REFERENCES learning_roles(id),
    target_language VARCHAR(10) NOT NULL DEFAULT 'ja',
    native_language VARCHAR(10) NOT NULL DEFAULT 'zh-TW',
    cefr_level VARCHAR(5) DEFAULT 'A1',

    -- 每日目標
    daily_goal_minutes INTEGER DEFAULT 15,
    daily_goal_xp INTEGER DEFAULT 50,

    -- 通知設定
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '09:00:00',

    -- 統計
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    total_study_minutes INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

-- ============================================
-- 連續天數記錄表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    minutes_studied INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    streak_maintained BOOLEAN DEFAULT false,
    streak_freeze_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, date)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_learning_streaks_user_date ON learning_streaks(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_profiles_user ON learning_profiles(user_id);

-- ============================================
-- RLS 政策
-- ============================================
ALTER TABLE learning_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;

-- learning_roles: 所有人可讀
CREATE POLICY "learning_roles_select" ON learning_roles
    FOR SELECT USING (true);

-- learning_profiles: 用戶只能存取自己的資料
CREATE POLICY "learning_profiles_select" ON learning_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "learning_profiles_insert" ON learning_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_profiles_update" ON learning_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- learning_streaks: 用戶只能存取自己的資料
CREATE POLICY "learning_streaks_select" ON learning_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "learning_streaks_insert" ON learning_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_streaks_update" ON learning_streaks
    FOR UPDATE USING (auth.uid() = user_id);
