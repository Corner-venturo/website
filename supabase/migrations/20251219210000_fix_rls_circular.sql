-- 修復 RLS 循環依賴問題
BEGIN;

-- ============================================
-- 1. 先刪除所有現有的 groups SELECT 政策
-- ============================================
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.groups;
DROP POLICY IF EXISTS "Private groups viewable by creator" ON public.groups;
DROP POLICY IF EXISTS "Private groups viewable by members" ON public.groups;
DROP POLICY IF EXISTS "Creators can view own groups" ON public.groups;

-- ============================================
-- 2. 刪除 group_members 的 SELECT 政策
-- ============================================
DROP POLICY IF EXISTS "Anyone can view group members of public groups" ON public.group_members;

-- ============================================
-- 3. 建立簡化的 groups SELECT 政策（不查詢其他表）
-- ============================================

-- 任何人都可以看公開且進行中的活動
CREATE POLICY "groups_select_public"
  ON public.groups FOR SELECT
  USING (is_private = false AND status IN ('active', 'full'));

-- 登入用戶可以看自己創建的所有活動
CREATE POLICY "groups_select_own"
  ON public.groups FOR SELECT
  USING (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- ============================================
-- 4. 建立簡化的 group_members SELECT 政策
-- ============================================

-- 任何登入用戶都可以看成員列表（簡化版本）
CREATE POLICY "group_members_select_all"
  ON public.group_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

COMMIT;
