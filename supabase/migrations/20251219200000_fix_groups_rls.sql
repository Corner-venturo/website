-- 修復 groups 表的 RLS 政策
BEGIN;

-- 先刪除現有的 SELECT 政策
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;

-- 重新建立更簡單的 SELECT 政策
-- 公開活動：任何人都可以看
CREATE POLICY "Public groups are viewable by everyone"
  ON public.groups FOR SELECT
  USING (is_private = false);

-- 私密活動：只有創建者和成員可以看
CREATE POLICY "Private groups viewable by creator"
  ON public.groups FOR SELECT
  USING (is_private = true AND created_by = auth.uid());

CREATE POLICY "Private groups viewable by members"
  ON public.groups FOR SELECT
  USING (
    is_private = true AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'approved'
    )
  );

-- 創建者可以看自己所有的活動（包含 draft）
CREATE POLICY "Creators can view own groups"
  ON public.groups FOR SELECT
  USING (created_by = auth.uid());

COMMIT;
