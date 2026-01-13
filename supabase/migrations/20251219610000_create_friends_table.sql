-- 好友/朋友關係表
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 確保不能自己加自己
  CONSTRAINT no_self_friend CHECK (user_id != friend_id),
  -- 確保同一對用戶只有一筆記錄
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- 索引加速查詢
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- RLS 政策
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- 用戶可以查看自己相關的好友記錄
CREATE POLICY "Users can view own friendships" ON friends
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- 用戶可以發送好友邀請
CREATE POLICY "Users can send friend requests" ON friends
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- 用戶可以更新收到的好友邀請（接受/拒絕）
CREATE POLICY "Users can respond to friend requests" ON friends
  FOR UPDATE USING (
    auth.uid() = friend_id AND status = 'pending'
  );

-- 用戶可以刪除自己發出的邀請或已建立的好友關係
CREATE POLICY "Users can delete own friendships" ON friends
  FOR DELETE USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- 更新時間觸發器
CREATE OR REPLACE FUNCTION update_friends_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_friends_updated_at();
