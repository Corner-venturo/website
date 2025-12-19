-- 修復好友 RLS 政策：允許 user_id 在邀請連結場景下也能更新狀態

-- 刪除舊的 UPDATE 政策
DROP POLICY IF EXISTS "Users can respond to friend requests" ON friends;

-- 新的 UPDATE 政策：允許 friend_id 回應邀請，或 user_id 接受（邀請連結場景）
-- 場景1: friend_id 可以回應收到的邀請（接受/拒絕）
-- 場景2: user_id 可以在對方透過邀請連結同意時更新為 accepted
CREATE POLICY "Users can respond to friend requests" ON friends
  FOR UPDATE USING (
    -- friend_id 可以回應收到的 pending 邀請
    (auth.uid() = friend_id AND status = 'pending')
    OR
    -- user_id 可以將自己發出的邀請更新為 accepted（邀請連結場景）
    (auth.uid() = user_id AND status = 'pending')
  );
