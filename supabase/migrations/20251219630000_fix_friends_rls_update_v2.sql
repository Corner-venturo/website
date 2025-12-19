-- 修復好友 RLS UPDATE 政策：正確處理狀態變更

-- 刪除舊的 UPDATE 政策
DROP POLICY IF EXISTS "Users can respond to friend requests" ON friends;

-- 新的 UPDATE 政策
-- USING: 控制哪些列可以被更新（檢查更新前的值）
-- WITH CHECK: 控制更新後的值是否有效（檢查更新後的值）
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
  WITH CHECK (
    -- 更新後的狀態必須是 accepted 或 rejected
    status IN ('accepted', 'rejected')
  );
