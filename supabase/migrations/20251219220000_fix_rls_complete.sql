-- 完整修復 RLS 循環依賴問題
-- 原因：groups 政策查詢 group_members，group_members 政策又查詢 groups，造成無限迴圈
BEGIN;

-- ============================================
-- 1. 刪除 groups 所有 SELECT 政策
-- ============================================
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.groups;
DROP POLICY IF EXISTS "Private groups viewable by creator" ON public.groups;
DROP POLICY IF EXISTS "Private groups viewable by members" ON public.groups;
DROP POLICY IF EXISTS "Creators can view own groups" ON public.groups;
DROP POLICY IF EXISTS "groups_select_public" ON public.groups;
DROP POLICY IF EXISTS "groups_select_own" ON public.groups;

-- ============================================
-- 2. 刪除 group_members 所有 SELECT 政策
-- ============================================
DROP POLICY IF EXISTS "Anyone can view group members of public groups" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_all" ON public.group_members;

-- ============================================
-- 3. 建立新的 groups SELECT 政策（不查詢其他表）
-- ============================================

-- 公開活動：任何人（包含未登入）都可以看
CREATE POLICY "groups_public_read"
  ON public.groups FOR SELECT
  USING (is_private = false);

-- 自己創建的活動：登入用戶可以看（包含草稿、私密）
CREATE POLICY "groups_creator_read"
  ON public.groups FOR SELECT
  USING (created_by = auth.uid());

-- ============================================
-- 4. 建立新的 group_members SELECT 政策（不查詢其他表）
-- ============================================

-- 簡單策略：登入用戶可以看所有成員資料
-- （前端/應用層再根據需求過濾）
CREATE POLICY "group_members_authenticated_read"
  ON public.group_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. 確保 INSERT/UPDATE/DELETE 政策存在且正確
-- ============================================

-- groups INSERT（已存在，確認正確）
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "groups_insert"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- groups UPDATE（已存在，確認正確）
DROP POLICY IF EXISTS "Organizers can update their groups" ON public.groups;
CREATE POLICY "groups_update"
  ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- groups DELETE（已存在，確認正確）
DROP POLICY IF EXISTS "Organizers can delete their groups" ON public.groups;
CREATE POLICY "groups_delete"
  ON public.groups FOR DELETE
  USING (created_by = auth.uid());

-- group_members INSERT
DROP POLICY IF EXISTS "Authenticated users can apply to groups" ON public.group_members;
CREATE POLICY "group_members_insert"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- group_members UPDATE（組織者管理）
DROP POLICY IF EXISTS "Organizers can manage members" ON public.group_members;
CREATE POLICY "group_members_update"
  ON public.group_members FOR UPDATE
  USING (
    -- 使用 subquery 但只查詢 groups，不會造成循環
    -- 因為 groups 的 SELECT 政策不再查詢 group_members
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_members.group_id
      AND groups.created_by = auth.uid()
    )
  );

-- group_members DELETE
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
CREATE POLICY "group_members_delete"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_members.group_id
      AND groups.created_by = auth.uid()
    )
  );

COMMIT;
