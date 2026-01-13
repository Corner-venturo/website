-- ============================================
-- Language Learning System - Gamification
-- Migration: 006 - Badges, Leaderboards, Sessions, Tasks
-- ============================================

-- ============================================
-- 徽章定義表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,

    -- 名稱
    name_zh VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    name_ja VARCHAR(200),

    -- 描述
    description_zh TEXT,
    description_en TEXT,

    -- 類型
    badge_type VARCHAR(50) NOT NULL,

    -- 稀有度
    rarity VARCHAR(20) DEFAULT 'common',

    -- 圖片
    icon_url TEXT,

    -- 獲得條件
    criteria JSONB NOT NULL,

    -- XP 獎勵
    xp_reward INTEGER DEFAULT 0,

    -- 排序
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 用戶徽章表
-- ============================================
CREATE TABLE IF NOT EXISTS user_learning_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES learning_badges(id) ON DELETE CASCADE,

    -- 獲得時間
    earned_at TIMESTAMPTZ DEFAULT NOW(),

    -- 展示設定
    is_displayed BOOLEAN DEFAULT false,
    display_order INTEGER,

    UNIQUE(user_id, badge_id)
);

-- ============================================
-- 排行榜表 (週更新)
-- ============================================
CREATE TABLE IF NOT EXISTS learning_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 時間範圍
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,

    -- 類型
    leaderboard_type VARCHAR(50) NOT NULL,

    -- 關聯 (可選)
    role_id UUID REFERENCES learning_roles(id),
    trip_id UUID,

    -- 排名資料 (JSONB)
    rankings JSONB NOT NULL DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(week_start, leaderboard_type, role_id, trip_id)
);

-- ============================================
-- 學習 Session 表
-- ============================================
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 學習目標
    goal_id UUID REFERENCES learning_goals(id),
    scenario_id UUID REFERENCES learning_scenarios(id),

    -- Session 類型
    session_type VARCHAR(50),

    -- 時間
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- 成果
    xp_earned INTEGER DEFAULT 0,
    vocabulary_reviewed INTEGER DEFAULT 0,
    vocabulary_learned INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,

    -- 設備資訊
    device_type VARCHAR(50),
    app_version VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 每日任務定義表
-- ============================================
CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 任務類型
    task_type VARCHAR(50) NOT NULL,

    -- 名稱
    name_zh VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),

    -- 描述
    description_zh TEXT,
    description_en TEXT,

    -- 目標值
    target_value INTEGER NOT NULL,

    -- 獎勵
    xp_reward INTEGER DEFAULT 10,

    -- 難度
    difficulty VARCHAR(20) DEFAULT 'normal',

    -- 出現權重
    weight INTEGER DEFAULT 100,

    -- 條件
    prerequisites JSONB DEFAULT '{}',

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 用戶每日任務表
-- ============================================
CREATE TABLE IF NOT EXISTS user_daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES daily_tasks(id),

    -- 日期
    task_date DATE NOT NULL,

    -- 進度
    current_value INTEGER DEFAULT 0,
    target_value INTEGER NOT NULL,

    -- 狀態
    status VARCHAR(20) DEFAULT 'active',

    -- 完成時間
    completed_at TIMESTAMPTZ,

    -- 是否領取獎勵
    reward_claimed BOOLEAN DEFAULT false,
    reward_claimed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, task_id, task_date)
);

-- ============================================
-- 好友挑戰表
-- ============================================
CREATE TABLE IF NOT EXISTS friend_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 挑戰者與被挑戰者
    challenger_id UUID NOT NULL REFERENCES auth.users(id),
    challenged_id UUID NOT NULL REFERENCES auth.users(id),

    -- 挑戰類型
    challenge_type VARCHAR(50) NOT NULL,

    -- 挑戰參數
    challenge_params JSONB,

    -- 時間範圍
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    -- 進度
    challenger_score INTEGER DEFAULT 0,
    challenged_score INTEGER DEFAULT 0,

    -- 狀態
    status VARCHAR(20) DEFAULT 'pending',

    -- 結果
    winner_id UUID REFERENCES auth.users(id),

    -- 賭注 (可選)
    stake_xp INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_date ON user_daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_friend_challenges_users ON friend_challenges(challenger_id, challenged_id);

-- ============================================
-- RLS 政策
-- ============================================
ALTER TABLE learning_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_challenges ENABLE ROW LEVEL SECURITY;

-- learning_badges & daily_tasks: 所有人可讀
CREATE POLICY "learning_badges_select" ON learning_badges FOR SELECT USING (true);
CREATE POLICY "daily_tasks_select" ON daily_tasks FOR SELECT USING (true);
CREATE POLICY "learning_leaderboards_select" ON learning_leaderboards FOR SELECT USING (true);

-- user_learning_badges: 用戶只能存取自己的資料，其他人可查看
CREATE POLICY "user_learning_badges_select" ON user_learning_badges FOR SELECT USING (true);
CREATE POLICY "user_learning_badges_insert" ON user_learning_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_learning_badges_update" ON user_learning_badges
    FOR UPDATE USING (auth.uid() = user_id);

-- learning_sessions: 用戶只能存取自己的資料
CREATE POLICY "learning_sessions_select" ON learning_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "learning_sessions_insert" ON learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learning_sessions_update" ON learning_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- user_daily_tasks: 用戶只能存取自己的資料
CREATE POLICY "user_daily_tasks_select" ON user_daily_tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_daily_tasks_insert" ON user_daily_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_daily_tasks_update" ON user_daily_tasks
    FOR UPDATE USING (auth.uid() = user_id);

-- friend_challenges: 參與者可以存取
CREATE POLICY "friend_challenges_select" ON friend_challenges
    FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
CREATE POLICY "friend_challenges_insert" ON friend_challenges
    FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "friend_challenges_update" ON friend_challenges
    FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- ============================================
-- 預設徽章資料
-- ============================================
INSERT INTO learning_badges (code, name_zh, name_en, badge_type, rarity, criteria, xp_reward, sort_order) VALUES
('streak_7', '一週連續', '7 Day Streak', 'streak', 'common', '{"type": "streak", "days": 7}', 50, 1),
('streak_30', '一月連續', '30 Day Streak', 'streak', 'uncommon', '{"type": "streak", "days": 30}', 200, 2),
('streak_100', '百日連續', '100 Day Streak', 'streak', 'rare', '{"type": "streak", "days": 100}', 500, 3),
('streak_365', '一年連續', '365 Day Streak', 'streak', 'legendary', '{"type": "streak", "days": 365}', 2000, 4),
('vocab_100', '百詞達人', '100 Words', 'vocabulary', 'common', '{"type": "vocabulary", "count": 100}', 100, 10),
('vocab_500', '五百詞達人', '500 Words', 'vocabulary', 'uncommon', '{"type": "vocabulary", "count": 500}', 300, 11),
('vocab_1000', '千詞達人', '1000 Words', 'vocabulary', 'rare', '{"type": "vocabulary", "count": 1000}', 800, 12),
('scenario_restaurant', '餐廳達人', 'Restaurant Expert', 'scenario', 'common', '{"type": "scenario_complete", "scenario_code": "restaurant_booking"}', 150, 20),
('scenario_shopping', '購物達人', 'Shopping Expert', 'scenario', 'common', '{"type": "scenario_complete", "scenario_code": "basic_shopping"}', 150, 21),
('perfect_pronunciation', '發音完美', 'Perfect Pronunciation', 'special', 'epic', '{"type": "perfect_pronunciation", "count": 10}', 500, 30)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 預設每日任務資料
-- ============================================
INSERT INTO daily_tasks (task_type, name_zh, name_en, description_zh, target_value, xp_reward, difficulty) VALUES
('review_vocabulary', '複習詞彙', 'Review Vocabulary', '複習 20 個詞彙', 20, 20, 'normal'),
('learn_new_words', '學習新詞', 'Learn New Words', '學習 5 個新詞彙', 5, 30, 'normal'),
('complete_dialogue', '完成對話', 'Complete Dialogue', '完成 1 個對話練習', 1, 25, 'normal'),
('ai_conversation', 'AI 對話', 'AI Conversation', '進行 1 次 AI 對話練習', 1, 40, 'hard'),
('perfect_pronunciation', '完美發音', 'Perfect Pronunciation', '獲得 3 次 90+ 發音評分', 3, 50, 'hard'),
('streak_maintain', '維持連續', 'Maintain Streak', '完成今日學習目標', 1, 15, 'easy')
ON CONFLICT DO NOTHING;
