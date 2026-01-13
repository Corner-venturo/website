-- 完整版記帳功能：帳戶、預算、分類階層

-- =====================
-- 1. 帳戶表 (accounts)
-- =====================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card', 'debit_card', 'e_wallet', 'investment', 'other')),
  icon TEXT DEFAULT 'account_balance_wallet',
  color TEXT DEFAULT '#10B981',
  currency TEXT DEFAULT 'TWD',

  -- 餘額相關
  initial_balance DECIMAL(12, 2) DEFAULT 0,
  current_balance DECIMAL(12, 2) DEFAULT 0,

  -- 信用卡專用欄位
  credit_limit DECIMAL(12, 2),
  billing_day INTEGER CHECK (billing_day >= 1 AND billing_day <= 31),
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),

  -- 排序與狀態
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  include_in_total BOOLEAN DEFAULT true,

  -- 備註
  note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(user_id, type);

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- 2. 更新分類表支援階層
-- =====================
-- 先刪除舊的 expense_categories 表（如果是空的或預設的）
DROP TABLE IF EXISTS expense_categories CASCADE;

CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'category',
  color TEXT NOT NULL DEFAULT '#6B7280',
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')) DEFAULT 'expense',

  -- 是否為系統預設分類
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_expense_categories_user ON expense_categories(user_id);
CREATE INDEX idx_expense_categories_parent ON expense_categories(parent_id);
CREATE INDEX idx_expense_categories_type ON expense_categories(type);

-- RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system and own categories"
  ON expense_categories FOR SELECT
  USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own categories"
  ON expense_categories FOR ALL
  USING (auth.uid() = user_id OR is_system = true)
  WITH CHECK (auth.uid() = user_id);

-- 插入系統預設分類（支出）
INSERT INTO expense_categories (id, name, icon, color, type, is_system, sort_order) VALUES
  -- 餐飲大類
  ('10000000-0000-0000-0000-000000000001', '餐飲', 'restaurant', '#FF6B6B', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000002', '早餐', 'free_breakfast', '#FF8A80', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000003', '午餐', 'lunch_dining', '#FF6B6B', 'expense', true, 2),
  ('10000000-0000-0000-0000-000000000004', '晚餐', 'dinner_dining', '#FF5252', 'expense', true, 3),
  ('10000000-0000-0000-0000-000000000005', '飲料', 'local_cafe', '#FFAB91', 'expense', true, 4),
  ('10000000-0000-0000-0000-000000000006', '零食', 'icecream', '#FFD180', 'expense', true, 5),

  -- 交通大類
  ('10000000-0000-0000-0000-000000000010', '交通', 'directions_car', '#4ECDC4', 'expense', true, 2),
  ('10000000-0000-0000-0000-000000000011', '大眾運輸', 'directions_transit', '#4DB6AC', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000012', '計程車', 'local_taxi', '#26A69A', 'expense', true, 2),
  ('10000000-0000-0000-0000-000000000013', '加油', 'local_gas_station', '#00897B', 'expense', true, 3),
  ('10000000-0000-0000-0000-000000000014', '停車', 'local_parking', '#00796B', 'expense', true, 4),

  -- 購物大類
  ('10000000-0000-0000-0000-000000000020', '購物', 'shopping_bag', '#45B7D1', 'expense', true, 3),
  ('10000000-0000-0000-0000-000000000021', '服飾', 'checkroom', '#4FC3F7', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000022', '3C產品', 'devices', '#29B6F6', 'expense', true, 2),
  ('10000000-0000-0000-0000-000000000023', '生活用品', 'shopping_cart', '#03A9F4', 'expense', true, 3),

  -- 娛樂大類
  ('10000000-0000-0000-0000-000000000030', '娛樂', 'movie', '#96CEB4', 'expense', true, 4),
  ('10000000-0000-0000-0000-000000000031', '電影', 'theaters', '#81C784', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000032', '遊戲', 'sports_esports', '#66BB6A', 'expense', true, 2),
  ('10000000-0000-0000-0000-000000000033', '音樂', 'music_note', '#4CAF50', 'expense', true, 3),
  ('10000000-0000-0000-0000-000000000034', '運動', 'fitness_center', '#43A047', 'expense', true, 4),

  -- 住宿大類
  ('10000000-0000-0000-0000-000000000040', '住宿', 'hotel', '#FFEAA7', 'expense', true, 5),
  ('10000000-0000-0000-0000-000000000041', '房租', 'home', '#FFE082', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000042', '水電瓦斯', 'bolt', '#FFD54F', 'expense', true, 2),
  ('10000000-0000-0000-0000-000000000043', '網路', 'wifi', '#FFCA28', 'expense', true, 3),

  -- 醫療大類
  ('10000000-0000-0000-0000-000000000050', '醫療', 'local_hospital', '#DDA0DD', 'expense', true, 6),
  ('10000000-0000-0000-0000-000000000051', '看診', 'medical_services', '#CE93D8', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000052', '藥品', 'medication', '#BA68C8', 'expense', true, 2),
  ('10000000-0000-0000-0000-000000000053', '保健品', 'health_and_safety', '#AB47BC', 'expense', true, 3),

  -- 教育大類
  ('10000000-0000-0000-0000-000000000060', '教育', 'school', '#98D8C8', 'expense', true, 7),
  ('10000000-0000-0000-0000-000000000061', '書籍', 'menu_book', '#80CBC4', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000062', '課程', 'cast_for_education', '#4DB6AC', 'expense', true, 2),

  -- 社交大類
  ('10000000-0000-0000-0000-000000000070', '社交', 'groups', '#F8B195', 'expense', true, 8),
  ('10000000-0000-0000-0000-000000000071', '禮物', 'card_giftcard', '#F7A399', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000072', '紅包', 'redeem', '#F69289', 'expense', true, 2),

  -- 通訊大類
  ('10000000-0000-0000-0000-000000000080', '通訊', 'phone', '#BB8FCE', 'expense', true, 9),
  ('10000000-0000-0000-0000-000000000081', '手機費', 'smartphone', '#B39DDB', 'expense', true, 1),
  ('10000000-0000-0000-0000-000000000082', '訂閱服務', 'subscriptions', '#9575CD', 'expense', true, 2),

  -- 其他支出
  ('10000000-0000-0000-0000-000000000090', '其他支出', 'more_horiz', '#95A5A6', 'expense', true, 99);

-- 設定子分類的 parent_id
UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000001'
  WHERE id IN ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003',
               '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005',
               '10000000-0000-0000-0000-000000000006');

UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000010'
  WHERE id IN ('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000012',
               '10000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000014');

UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000020'
  WHERE id IN ('10000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000022',
               '10000000-0000-0000-0000-000000000023');

UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000030'
  WHERE id IN ('10000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000032',
               '10000000-0000-0000-0000-000000000033', '10000000-0000-0000-0000-000000000034');

UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000040'
  WHERE id IN ('10000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000042',
               '10000000-0000-0000-0000-000000000043');

UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000050'
  WHERE id IN ('10000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000052',
               '10000000-0000-0000-0000-000000000053');

UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000060'
  WHERE id IN ('10000000-0000-0000-0000-000000000061', '10000000-0000-0000-0000-000000000062');

UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000070'
  WHERE id IN ('10000000-0000-0000-0000-000000000071', '10000000-0000-0000-0000-000000000072');

UPDATE expense_categories SET parent_id = '10000000-0000-0000-0000-000000000080'
  WHERE id IN ('10000000-0000-0000-0000-000000000081', '10000000-0000-0000-0000-000000000082');

-- 插入系統預設分類（收入）
INSERT INTO expense_categories (id, name, icon, color, type, is_system, sort_order) VALUES
  ('20000000-0000-0000-0000-000000000001', '薪資收入', 'payments', '#2ECC71', 'income', true, 1),
  ('20000000-0000-0000-0000-000000000002', '獎金', 'card_giftcard', '#F39C12', 'income', true, 2),
  ('20000000-0000-0000-0000-000000000003', '投資收益', 'trending_up', '#3498DB', 'income', true, 3),
  ('20000000-0000-0000-0000-000000000004', '利息', 'account_balance', '#9B59B6', 'income', true, 4),
  ('20000000-0000-0000-0000-000000000005', '退款', 'replay', '#1ABC9C', 'income', true, 5),
  ('20000000-0000-0000-0000-000000000006', '紅包收入', 'redeem', '#E74C3C', 'income', true, 6),
  ('20000000-0000-0000-0000-000000000007', '副業收入', 'work', '#34495E', 'income', true, 7),
  ('20000000-0000-0000-0000-000000000099', '其他收入', 'more_horiz', '#95A5A6', 'income', true, 99);

-- =====================
-- 3. 預算表 (budgets)
-- =====================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 可以是總預算或分類預算
  category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,

  name TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')) DEFAULT 'monthly',

  -- 預算週期
  start_date DATE,

  -- 提醒設定
  alert_threshold INTEGER DEFAULT 80, -- 達到百分比時提醒
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);

-- RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets"
  ON budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- 4. 更新 personal_expenses 表
-- =====================
-- 添加帳戶關聯欄位
ALTER TABLE personal_expenses
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL;

-- 索引
CREATE INDEX IF NOT EXISTS idx_personal_expenses_account ON personal_expenses(account_id);
CREATE INDEX IF NOT EXISTS idx_personal_expenses_category_id ON personal_expenses(category_id);

-- =====================
-- 5. 帳戶交易記錄觸發器
-- =====================
-- 當新增/更新/刪除支出記錄時，自動更新帳戶餘額
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- 處理 INSERT
  IF TG_OP = 'INSERT' AND NEW.account_id IS NOT NULL THEN
    IF NEW.type = 'expense' THEN
      UPDATE accounts SET current_balance = current_balance - NEW.amount, updated_at = NOW()
        WHERE id = NEW.account_id;
    ELSE
      UPDATE accounts SET current_balance = current_balance + NEW.amount, updated_at = NOW()
        WHERE id = NEW.account_id;
    END IF;
  END IF;

  -- 處理 DELETE
  IF TG_OP = 'DELETE' AND OLD.account_id IS NOT NULL THEN
    IF OLD.type = 'expense' THEN
      UPDATE accounts SET current_balance = current_balance + OLD.amount, updated_at = NOW()
        WHERE id = OLD.account_id;
    ELSE
      UPDATE accounts SET current_balance = current_balance - OLD.amount, updated_at = NOW()
        WHERE id = OLD.account_id;
    END IF;
    RETURN OLD;
  END IF;

  -- 處理 UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- 先還原舊的
    IF OLD.account_id IS NOT NULL THEN
      IF OLD.type = 'expense' THEN
        UPDATE accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
      ELSE
        UPDATE accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
      END IF;
    END IF;
    -- 再套用新的
    IF NEW.account_id IS NOT NULL THEN
      IF NEW.type = 'expense' THEN
        UPDATE accounts SET current_balance = current_balance - NEW.amount, updated_at = NOW()
          WHERE id = NEW.account_id;
      ELSE
        UPDATE accounts SET current_balance = current_balance + NEW.amount, updated_at = NOW()
          WHERE id = NEW.account_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器
DROP TRIGGER IF EXISTS trigger_update_account_balance ON personal_expenses;
CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON personal_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();

-- =====================
-- 6. 記帳成就/遊戲化表
-- =====================
CREATE TABLE IF NOT EXISTS expense_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_record_date DATE,

  total_records INTEGER DEFAULT 0,
  total_expense_amount DECIMAL(12, 2) DEFAULT 0,
  total_income_amount DECIMAL(12, 2) DEFAULT 0,

  -- 成就
  achievements JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_expense_streaks_user ON expense_streaks(user_id);

-- RLS
ALTER TABLE expense_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own streaks"
  ON expense_streaks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 更新連續記帳天數的函數
CREATE OR REPLACE FUNCTION update_expense_streak()
RETURNS TRIGGER AS $$
DECLARE
  streak_record expense_streaks%ROWTYPE;
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - 1;
BEGIN
  -- 取得或建立 streak 記錄
  SELECT * INTO streak_record FROM expense_streaks WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    INSERT INTO expense_streaks (user_id, current_streak, last_record_date, total_records)
    VALUES (NEW.user_id, 1, today, 1);
  ELSE
    -- 更新連續天數
    IF streak_record.last_record_date = today THEN
      -- 同一天已記帳，只增加總數
      UPDATE expense_streaks
      SET total_records = total_records + 1,
          total_expense_amount = CASE WHEN NEW.type = 'expense' THEN total_expense_amount + NEW.amount ELSE total_expense_amount END,
          total_income_amount = CASE WHEN NEW.type = 'income' THEN total_income_amount + NEW.amount ELSE total_income_amount END,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF streak_record.last_record_date = yesterday THEN
      -- 連續記帳
      UPDATE expense_streaks
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_record_date = today,
          total_records = total_records + 1,
          total_expense_amount = CASE WHEN NEW.type = 'expense' THEN total_expense_amount + NEW.amount ELSE total_expense_amount END,
          total_income_amount = CASE WHEN NEW.type = 'income' THEN total_income_amount + NEW.amount ELSE total_income_amount END,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSE
      -- 斷掉了，重新開始
      UPDATE expense_streaks
      SET current_streak = 1,
          last_record_date = today,
          total_records = total_records + 1,
          total_expense_amount = CASE WHEN NEW.type = 'expense' THEN total_expense_amount + NEW.amount ELSE total_expense_amount END,
          total_income_amount = CASE WHEN NEW.type = 'income' THEN total_income_amount + NEW.amount ELSE total_income_amount END,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器
DROP TRIGGER IF EXISTS trigger_update_expense_streak ON personal_expenses;
CREATE TRIGGER trigger_update_expense_streak
  AFTER INSERT ON personal_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_expense_streak();
