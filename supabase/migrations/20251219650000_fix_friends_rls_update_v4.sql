-- 修復好友 RLS UPDATE 政策 v4：允許更新 rejected 狀態的記錄

-- 刪除舊的 UPDATE 政策
DROP POLICY IF EXISTS "Users can respond to friend requests" ON friends;

-- 新的 UPDATE 政策
-- 允許更新 pending 或 rejected 狀態的記錄（邀請連結場景可能需要重新接受之前被拒絕的邀請）
CREATE POLICY "Users can respond to friend requests" ON friends
  FOR UPDATE
  USING (
    -- pending 或 rejected 狀態的記錄可以被更新
    status IN ('pending', 'rejected') AND (
      -- friend_id 可以回應收到的邀請
      auth.uid() = friend_id
      OR
      -- user_id 可以更新自己發出的邀請（邀請連結場景）
      auth.uid() = user_id
    )
  )
  WITH CHECK (true);
