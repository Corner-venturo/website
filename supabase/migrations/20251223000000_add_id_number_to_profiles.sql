-- Add id_number field to profiles for ERP binding
BEGIN;

-- 1. Add id_number column to profiles (unique, for ERP binding)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS id_number text;

-- 2. Create unique index (one id_number can only bind to one account)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_id_number_unique_idx
ON public.profiles(id_number)
WHERE id_number IS NOT NULL;

-- 3. Add comment
COMMENT ON COLUMN public.profiles.id_number IS '身分證字號，用於綁定 ERP 訂單資料，每個身分證只能綁定一個帳號';

COMMIT;
