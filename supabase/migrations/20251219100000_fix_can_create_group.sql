-- 修正 can_create_group 函數：直接計算進行中的活動數量（不依賴 active_group_count 欄位）
CREATE OR REPLACE FUNCTION public.can_create_group(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_level text;
  active_count integer;
  max_allowed integer;
BEGIN
  -- 取得用戶等級
  SELECT member_level INTO user_level
  FROM public.profiles WHERE id = user_id;

  -- 計算目前進行中的活動數量
  SELECT COUNT(*) INTO active_count
  FROM public.groups
  WHERE created_by = user_id AND status IN ('draft', 'active', 'full');

  -- 根據會員等級設定上限
  CASE COALESCE(user_level, 'basic')
    WHEN 'basic' THEN max_allowed := 1;
    WHEN 'premium' THEN max_allowed := 3;
    WHEN 'vip' THEN max_allowed := 999;
    ELSE max_allowed := 1;
  END CASE;

  RETURN active_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
