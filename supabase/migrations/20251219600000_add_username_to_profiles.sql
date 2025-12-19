-- 在 profiles 表加入 username 欄位
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 建立函數檢查 username 格式（只允許小寫字母、數字、底線）
CREATE OR REPLACE FUNCTION check_username_format()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    -- 檢查格式：3-20字元，只允許小寫字母、數字、底線
    IF NEW.username !~ '^[a-z0-9_]{3,20}$' THEN
      RAISE EXCEPTION 'Username must be 3-20 characters, lowercase letters, numbers, and underscores only';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器
DROP TRIGGER IF EXISTS check_username_format_trigger ON profiles;
CREATE TRIGGER check_username_format_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_username_format();
