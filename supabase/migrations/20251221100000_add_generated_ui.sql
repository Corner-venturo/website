-- 生成的 UI 代碼記錄表
CREATE TABLE public.generated_ui (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                              -- 用戶命名（如：景點詳情頁 v1）
  code text NOT NULL,                              -- 生成的程式碼
  prompt text,                                     -- 原始需求描述
  page_type text DEFAULT 'page',                   -- 頁面類型
  thumbnail_url text,                              -- 預覽縮圖（可選）
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_generated_ui_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_generated_ui_updated_at
  BEFORE UPDATE ON public.generated_ui
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_ui_updated_at();

-- 索引
CREATE INDEX idx_generated_ui_created_at ON public.generated_ui(created_at DESC);
