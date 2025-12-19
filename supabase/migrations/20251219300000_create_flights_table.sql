-- 建立航班記錄表
CREATE TABLE IF NOT EXISTS flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_airport VARCHAR(10) NOT NULL,
  from_city VARCHAR(100),
  from_country VARCHAR(10),
  to_airport VARCHAR(10) NOT NULL,
  to_city VARCHAR(100),
  to_country VARCHAR(10),
  flight_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(flight_date DESC);
CREATE INDEX IF NOT EXISTS idx_flights_to_country ON flights(to_country);

-- 啟用 RLS
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

-- RLS 政策：用戶只能看自己的航班
CREATE POLICY "Users can view own flights"
  ON flights FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 政策：用戶可以新增自己的航班
CREATE POLICY "Users can insert own flights"
  ON flights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 政策：用戶可以更新自己的航班
CREATE POLICY "Users can update own flights"
  ON flights FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 政策：用戶可以刪除自己的航班
CREATE POLICY "Users can delete own flights"
  ON flights FOR DELETE
  USING (auth.uid() = user_id);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_flights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS flights_updated_at ON flights;
CREATE TRIGGER flights_updated_at
  BEFORE UPDATE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_flights_updated_at();
