-- 員工驗證：在 profiles 加入員工綁定欄位
BEGIN;

-- 添加員工相關欄位
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS employee_id UUID,
  ADD COLUMN IF NOT EXISTS employee_number TEXT,
  ADD COLUMN IF NOT EXISTS employee_roles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS employee_verified_at TIMESTAMPTZ;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_employee_number ON public.profiles(employee_number);

-- 添加註解
COMMENT ON COLUMN public.profiles.employee_id IS 'ERP 員工 ID（綁定後填入）';
COMMENT ON COLUMN public.profiles.employee_number IS 'ERP 員工編號（如 E001）';
COMMENT ON COLUMN public.profiles.employee_roles IS '員工角色陣列（如 leader, manager）';
COMMENT ON COLUMN public.profiles.employee_verified_at IS '員工驗證時間';

COMMIT;
