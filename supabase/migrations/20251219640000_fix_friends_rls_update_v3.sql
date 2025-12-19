-- 修復好友 RLS UPDATE 政策 v3

-- 刪除舊的 UPDATE 政策
DROP POLICY IF EXISTS "Users can respond to friend requests" ON friends;

-- 新的 UPDATE 政策
-- USING 已經限制了誰可以更新哪些記錄
-- WITH CHECK 設為 true，因為 USING 已經做了充分的權限檢查
CREATE POLICY "Users can respond to friend requests" ON friends
  FOR UPDATE
  USING (
    -- 只有 pending 狀態的記錄可以被更新
    status = 'pending' AND (
      -- friend_id 可以回應收到的邀請
      auth.uid() = friend_id
      OR
      -- user_id 可以更新自己發出的邀請（邀請連結場景）
      auth.uid() = user_id
    )
  )
  WITH CHECK (true);
