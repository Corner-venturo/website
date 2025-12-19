-- 修復 current_members 計數問題
-- 問題：預設值是 1，但觸發器又會 +1，導致顯示 2
BEGIN;

-- 修改 current_members 預設值為 0
-- 當組織者被加入 group_members 時，觸發器會正確地 +1
ALTER TABLE public.groups
ALTER COLUMN current_members SET DEFAULT 0;

-- 修正現有資料：重新計算所有 groups 的 current_members
UPDATE public.groups g
SET current_members = (
  SELECT COUNT(*)
  FROM public.group_members gm
  WHERE gm.group_id = g.id
  AND gm.status = 'approved'
);

COMMIT;
