-- ============================================
-- 支援虛擬成員（不需要真實帳號的分帳成員）
-- ============================================

-- 新增欄位到 split_group_members
ALTER TABLE public.split_group_members
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT FALSE;

-- 新增註解
COMMENT ON COLUMN public.split_group_members.display_name IS '顯示名稱（虛擬成員專用）';
COMMENT ON COLUMN public.split_group_members.is_virtual IS '是否為虛擬成員（不需要真實帳號）';

-- 為虛擬成員移除 user_id 的 foreign key 限制
-- 虛擬成員的 user_id 會是 virtual_xxx 格式，不會對應到真實 profiles
