-- 修復 trips 和 trip_members 的 RLS 循環依賴問題
BEGIN;

-- ============================================
-- 1. 刪除 trips 的 SELECT 政策
-- ============================================
DROP POLICY IF EXISTS "Users can view their trips" ON public.trips;

-- ============================================
-- 2. 刪除 trip_members 的 SELECT 政策（造成遞迴的元兇）
-- ============================================
DROP POLICY IF EXISTS "Users can view trip members" ON public.trip_members;

-- ============================================
-- 3. 建立新的 trips SELECT 政策（不會造成遞迴）
-- ============================================

-- 用戶可以看自己建立的行程
CREATE POLICY "trips_creator_read"
  ON public.trips FOR SELECT
  USING (created_by = auth.uid());

-- ============================================
-- 4. 建立新的 trip_members SELECT 政策（不會造成遞迴）
-- ============================================

-- 簡單策略：登入用戶可以看自己參與的行程成員
CREATE POLICY "trip_members_self_read"
  ON public.trip_members FOR SELECT
  USING (user_id = auth.uid());

-- 行程建立者可以看所有成員
CREATE POLICY "trip_members_owner_read"
  ON public.trip_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_members.trip_id
      AND trips.created_by = auth.uid()
    )
  );

COMMIT;
