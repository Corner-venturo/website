-- ============================================
-- Language Learning System - Views & Functions
-- Migration: 008 - Views, Functions, Triggers
-- ============================================

-- ============================================
-- 用戶今日學習統計視圖
-- ============================================
CREATE OR REPLACE VIEW user_daily_learning_stats AS
SELECT
    s.user_id,
    s.date,
    s.xp_earned,
    s.minutes_studied,
    s.lessons_completed,
    s.streak_maintained,
    p.current_streak,
    p.daily_goal_xp,
    p.daily_goal_minutes,
    CASE WHEN s.xp_earned >= p.daily_goal_xp THEN true ELSE false END as goal_achieved
FROM learning_streaks s
JOIN learning_profiles p ON p.user_id = s.user_id;

-- ============================================
-- 用戶待複習詞彙視圖
-- ============================================
CREATE OR REPLACE VIEW user_due_vocabulary AS
SELECT
    uvp.user_id,
    uvp.vocabulary_id,
    v.word_ja,
    v.word_zh,
    v.reading_hiragana,
    uvp.status,
    uvp.due_date,
    uvp.stability,
    uvp.difficulty,
    uvp.reps,
    ls.name_zh as scenario_name
FROM user_vocabulary_progress uvp
JOIN vocabulary v ON v.id = uvp.vocabulary_id
LEFT JOIN learning_scenarios ls ON ls.id = uvp.learned_in_scenario_id
WHERE uvp.status IN ('learning', 'reviewing')
  AND uvp.due_date <= NOW();

-- ============================================
-- 更新連續天數函數
-- ============================================
CREATE OR REPLACE FUNCTION update_user_learning_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_last_study_date DATE;
    v_current_streak INTEGER;
BEGIN
    -- 獲取用戶最後學習日期
    SELECT last_study_date, current_streak
    INTO v_last_study_date, v_current_streak
    FROM learning_profiles
    WHERE user_id = p_user_id;

    -- 計算連續天數
    IF v_last_study_date = CURRENT_DATE - INTERVAL '1 day' THEN
        -- 連續
        UPDATE learning_profiles
        SET current_streak = current_streak + 1,
            last_study_date = CURRENT_DATE,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSIF v_last_study_date = CURRENT_DATE THEN
        -- 今天已經學過，不做任何事
        NULL;
    ELSE
        -- 斷掉，重新開始
        UPDATE learning_profiles
        SET current_streak = 1,
            last_study_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FSRS 排程計算函數 (簡化版)
-- ============================================
CREATE OR REPLACE FUNCTION calculate_fsrs_schedule(
    p_stability DECIMAL,
    p_difficulty DECIMAL,
    p_rating INTEGER,
    p_desired_retention DECIMAL DEFAULT 0.9
)
RETURNS TABLE(
    new_stability DECIMAL,
    new_difficulty DECIMAL,
    interval_days INTEGER
) AS $$
BEGIN
    -- 簡化版 FSRS 計算
    IF p_rating = 1 THEN -- Again
        new_stability := GREATEST(p_stability * 0.2, 0.1);
        new_difficulty := LEAST(p_difficulty + 0.2, 1);
        interval_days := 1;
    ELSIF p_rating = 2 THEN -- Hard
        new_stability := p_stability * 1.2;
        new_difficulty := LEAST(p_difficulty + 0.1, 1);
        interval_days := GREATEST(ROUND(new_stability * 0.8)::INTEGER, 1);
    ELSIF p_rating = 3 THEN -- Good
        new_stability := p_stability * 2.5;
        new_difficulty := p_difficulty;
        interval_days := GREATEST(ROUND(new_stability)::INTEGER, 1);
    ELSE -- Easy (4)
        new_stability := p_stability * 3.5;
        new_difficulty := GREATEST(p_difficulty - 0.1, 0);
        interval_days := GREATEST(ROUND(new_stability * 1.3)::INTEGER, 1);
    END IF;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 記錄詞彙複習結果函數
-- ============================================
CREATE OR REPLACE FUNCTION record_vocabulary_review(
    p_user_id UUID,
    p_vocabulary_id UUID,
    p_rating INTEGER
)
RETURNS void AS $$
DECLARE
    v_current_stability DECIMAL;
    v_current_difficulty DECIMAL;
    v_new_stability DECIMAL;
    v_new_difficulty DECIMAL;
    v_interval_days INTEGER;
BEGIN
    -- 獲取當前參數
    SELECT stability, difficulty
    INTO v_current_stability, v_current_difficulty
    FROM user_vocabulary_progress
    WHERE user_id = p_user_id AND vocabulary_id = p_vocabulary_id;

    -- 如果是新詞，設定初始值
    IF v_current_stability IS NULL OR v_current_stability = 0 THEN
        v_current_stability := 1;
        v_current_difficulty := 0.3;
    END IF;

    -- 計算新的排程
    SELECT f.new_stability, f.new_difficulty, f.interval_days
    INTO v_new_stability, v_new_difficulty, v_interval_days
    FROM calculate_fsrs_schedule(v_current_stability, v_current_difficulty, p_rating) f;

    -- 更新進度
    INSERT INTO user_vocabulary_progress (
        user_id, vocabulary_id, status, stability, difficulty,
        due_date, last_review, reps,
        correct_count, incorrect_count, updated_at
    )
    VALUES (
        p_user_id, p_vocabulary_id, 'reviewing', v_new_stability, v_new_difficulty,
        NOW() + (v_interval_days || ' days')::INTERVAL, NOW(), 1,
        CASE WHEN p_rating >= 3 THEN 1 ELSE 0 END,
        CASE WHEN p_rating < 3 THEN 1 ELSE 0 END,
        NOW()
    )
    ON CONFLICT (user_id, vocabulary_id) DO UPDATE SET
        status = CASE
            WHEN EXCLUDED.reps > 5 AND p_rating >= 3 THEN 'mastered'
            ELSE 'reviewing'
        END,
        stability = v_new_stability,
        difficulty = v_new_difficulty,
        due_date = NOW() + (v_interval_days || ' days')::INTERVAL,
        last_review = NOW(),
        reps = user_vocabulary_progress.reps + 1,
        lapses = user_vocabulary_progress.lapses + CASE WHEN p_rating = 1 THEN 1 ELSE 0 END,
        correct_count = user_vocabulary_progress.correct_count + CASE WHEN p_rating >= 3 THEN 1 ELSE 0 END,
        incorrect_count = user_vocabulary_progress.incorrect_count + CASE WHEN p_rating < 3 THEN 1 ELSE 0 END,
        mastered_at = CASE
            WHEN user_vocabulary_progress.reps > 5 AND p_rating >= 3 THEN NOW()
            ELSE user_vocabulary_progress.mastered_at
        END,
        updated_at = NOW();

    -- 更新連續天數
    PERFORM update_user_learning_streak(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 獲取用戶今日待複習數量函數
-- ============================================
CREATE OR REPLACE FUNCTION get_due_review_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM user_vocabulary_progress
    WHERE user_id = p_user_id
      AND status IN ('learning', 'reviewing')
      AND due_date <= NOW();

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 獲取用戶學習統計函數
-- ============================================
CREATE OR REPLACE FUNCTION get_user_learning_stats(p_user_id UUID)
RETURNS TABLE(
    total_xp INTEGER,
    current_streak INTEGER,
    longest_streak INTEGER,
    words_learned INTEGER,
    words_reviewing INTEGER,
    words_mastered INTEGER,
    due_today INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(lp.total_xp, 0),
        COALESCE(lp.current_streak, 0),
        COALESCE(lp.longest_streak, 0),
        COALESCE(lp.words_learned, 0),
        COALESCE((
            SELECT COUNT(*)::INTEGER
            FROM user_vocabulary_progress uvp
            WHERE uvp.user_id = p_user_id AND uvp.status = 'reviewing'
        ), 0),
        COALESCE((
            SELECT COUNT(*)::INTEGER
            FROM user_vocabulary_progress uvp
            WHERE uvp.user_id = p_user_id AND uvp.status = 'mastered'
        ), 0),
        COALESCE((
            SELECT COUNT(*)::INTEGER
            FROM user_vocabulary_progress uvp
            WHERE uvp.user_id = p_user_id
              AND uvp.status IN ('learning', 'reviewing')
              AND uvp.due_date <= NOW()
        ), 0)
    FROM learning_profiles lp
    WHERE lp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 更新用戶 XP 函數
-- ============================================
CREATE OR REPLACE FUNCTION add_user_xp(
    p_user_id UUID,
    p_xp_amount INTEGER
)
RETURNS void AS $$
BEGIN
    -- 更新 profile 總 XP
    UPDATE learning_profiles
    SET total_xp = total_xp + p_xp_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 更新今日 streak 記錄
    INSERT INTO learning_streaks (user_id, date, xp_earned)
    VALUES (p_user_id, CURRENT_DATE, p_xp_amount)
    ON CONFLICT (user_id, date) DO UPDATE
    SET xp_earned = learning_streaks.xp_earned + p_xp_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 檢查並獲發徽章函數
-- ============================================
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS SETOF UUID AS $$
DECLARE
    v_badge RECORD;
    v_should_award BOOLEAN;
    v_user_streak INTEGER;
    v_user_words INTEGER;
BEGIN
    -- 獲取用戶統計
    SELECT current_streak, words_learned
    INTO v_user_streak, v_user_words
    FROM learning_profiles
    WHERE user_id = p_user_id;

    -- 檢查每個徽章
    FOR v_badge IN
        SELECT id, code, criteria
        FROM learning_badges
        WHERE is_active = true
          AND id NOT IN (
              SELECT badge_id FROM user_learning_badges WHERE user_id = p_user_id
          )
    LOOP
        v_should_award := false;

        -- 檢查連續天數徽章
        IF v_badge.criteria->>'type' = 'streak' THEN
            IF v_user_streak >= (v_badge.criteria->>'days')::INTEGER THEN
                v_should_award := true;
            END IF;
        END IF;

        -- 檢查詞彙數量徽章
        IF v_badge.criteria->>'type' = 'vocabulary' THEN
            IF v_user_words >= (v_badge.criteria->>'count')::INTEGER THEN
                v_should_award := true;
            END IF;
        END IF;

        -- 如果符合條件，頒發徽章
        IF v_should_award THEN
            INSERT INTO user_learning_badges (user_id, badge_id)
            VALUES (p_user_id, v_badge.id)
            ON CONFLICT DO NOTHING;

            -- 返回獲得的徽章 ID
            RETURN NEXT v_badge.id;
        END IF;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 自動更新 updated_at 觸發器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為需要的表格添加觸發器
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'learning_profiles',
        'learning_goals',
        'vocabulary',
        'sentence_patterns',
        'dialogues',
        'user_vocabulary_progress',
        'user_pattern_progress',
        'user_dialogue_progress',
        'mistake_records',
        'mistake_patterns',
        'user_notes',
        'user_fsrs_parameters',
        'reminder_settings',
        'friend_challenges'
    ]
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- ============================================
-- 生成每週統計的函數
-- ============================================
CREATE OR REPLACE FUNCTION generate_weekly_stats(p_user_id UUID, p_week_start DATE)
RETURNS void AS $$
DECLARE
    v_week_end DATE;
BEGIN
    v_week_end := p_week_start + INTERVAL '6 days';

    INSERT INTO weekly_stats (
        user_id, week_start, week_end,
        total_minutes, total_xp,
        new_words_learned, words_reviewed,
        streak_days
    )
    SELECT
        p_user_id,
        p_week_start,
        v_week_end,
        COALESCE(SUM(ls.duration_seconds) / 60, 0),
        COALESCE(SUM(ls.xp_earned), 0),
        COALESCE(SUM(ls.vocabulary_learned), 0),
        COALESCE(SUM(ls.vocabulary_reviewed), 0),
        (SELECT COUNT(*) FROM learning_streaks
         WHERE user_id = p_user_id
           AND date BETWEEN p_week_start AND v_week_end
           AND streak_maintained = true)
    FROM learning_sessions ls
    WHERE ls.user_id = p_user_id
      AND ls.started_at::DATE BETWEEN p_week_start AND v_week_end
    ON CONFLICT (user_id, week_start) DO UPDATE SET
        total_minutes = EXCLUDED.total_minutes,
        total_xp = EXCLUDED.total_xp,
        new_words_learned = EXCLUDED.new_words_learned,
        words_reviewed = EXCLUDED.words_reviewed,
        streak_days = EXCLUDED.streak_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
