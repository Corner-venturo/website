-- ============================================
-- 邀請系統完整重構
-- 1. 新增 trip_invitations 表
-- 2. 新增 split_group_invitations 表
-- 3. friends 表加 expires_at 欄位
-- 4. 新增邀請碼功能
-- ============================================
BEGIN;

-- ============================================
-- 1. 修改 friends 表，新增 expires_at
-- ============================================
ALTER TABLE friends
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invite_message TEXT;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_friends_expires_at ON friends(expires_at);
CREATE INDEX IF NOT EXISTS idx_friends_invite_code ON friends(invite_code);

-- 更新 RLS：允許發送者撤回邀請
DROP POLICY IF EXISTS "Users can delete own friendships" ON friends;
CREATE POLICY "Users can delete own friendships" ON friends
  FOR DELETE USING (
    auth.uid() = user_id OR
    (auth.uid() = friend_id AND status = 'accepted')
  );

-- ============================================
-- 2. 建立 trip_invitations 表（行程邀請）
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  -- 邀請人
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 被邀請人（可為空，支援邀請碼模式）
  invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 邀請碼（用於分享連結）
  invite_code TEXT UNIQUE,

  -- 狀態
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),

  -- 邀請訊息
  message TEXT,

  -- 角色（加入後的角色）
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),

  -- 過期時間
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- 響應時間
  responded_at TIMESTAMPTZ,

  -- 時間戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 確保同一用戶不重複邀請同一行程
  CONSTRAINT unique_trip_invitation UNIQUE (trip_id, invitee_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_trip_invitations_trip ON trip_invitations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_inviter ON trip_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_invitee ON trip_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_status ON trip_invitations(status);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_code ON trip_invitations(invite_code);

-- RLS
ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;

-- 查看：邀請人或被邀請人可查看
CREATE POLICY "Users can view their trip invitations" ON trip_invitations
  FOR SELECT USING (
    auth.uid() = inviter_id OR
    auth.uid() = invitee_id OR
    -- 或者是行程成員可以看到該行程的邀請
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = trip_invitations.trip_id AND tm.user_id = auth.uid()
    )
  );

-- 建立：行程成員可邀請
CREATE POLICY "Trip members can create invitations" ON trip_invitations
  FOR INSERT WITH CHECK (
    auth.uid() = inviter_id AND
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = trip_invitations.trip_id AND tm.user_id = auth.uid()
    )
  );

-- 更新：邀請人可撤回，被邀請人可接受/拒絕
CREATE POLICY "Users can update trip invitations" ON trip_invitations
  FOR UPDATE USING (
    (auth.uid() = inviter_id) OR
    (auth.uid() = invitee_id AND status = 'pending')
  );

-- 刪除：邀請人可刪除
CREATE POLICY "Inviters can delete invitations" ON trip_invitations
  FOR DELETE USING (auth.uid() = inviter_id);

-- ============================================
-- 3. 建立 split_group_invitations 表（分帳群組邀請）
-- ============================================
CREATE TABLE IF NOT EXISTS public.split_group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 關聯
  group_id UUID NOT NULL REFERENCES public.split_groups(id) ON DELETE CASCADE,

  -- 邀請人
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 被邀請人（可為空，支援邀請碼模式）
  invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 邀請碼（用於分享連結）
  invite_code TEXT UNIQUE,

  -- 狀態
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),

  -- 邀請訊息
  message TEXT,

  -- 過期時間
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- 響應時間
  responded_at TIMESTAMPTZ,

  -- 時間戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 確保同一用戶不重複邀請同一群組
  CONSTRAINT unique_split_group_invitation UNIQUE (group_id, invitee_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_split_group_invitations_group ON split_group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_split_group_invitations_inviter ON split_group_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_split_group_invitations_invitee ON split_group_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_split_group_invitations_status ON split_group_invitations(status);
CREATE INDEX IF NOT EXISTS idx_split_group_invitations_code ON split_group_invitations(invite_code);

-- RLS
ALTER TABLE split_group_invitations ENABLE ROW LEVEL SECURITY;

-- 查看：邀請人或被邀請人可查看
CREATE POLICY "Users can view their split group invitations" ON split_group_invitations
  FOR SELECT USING (
    auth.uid() = inviter_id OR
    auth.uid() = invitee_id OR
    -- 或者是群組成員可以看到該群組的邀請
    EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = split_group_invitations.group_id AND sgm.user_id = auth.uid()
    )
  );

-- 建立：群組成員可邀請
CREATE POLICY "Group members can create invitations" ON split_group_invitations
  FOR INSERT WITH CHECK (
    auth.uid() = inviter_id AND
    EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = split_group_invitations.group_id AND sgm.user_id = auth.uid()
    )
  );

-- 更新：邀請人可撤回，被邀請人可接受/拒絕
CREATE POLICY "Users can update split group invitations" ON split_group_invitations
  FOR UPDATE USING (
    (auth.uid() = inviter_id) OR
    (auth.uid() = invitee_id AND status = 'pending')
  );

-- 刪除：邀請人可刪除
CREATE POLICY "Inviters can delete split group invitations" ON split_group_invitations
  FOR DELETE USING (auth.uid() = inviter_id);

-- ============================================
-- 4. 觸發器：自動更新 updated_at
-- ============================================
CREATE TRIGGER update_trip_invitations_updated_at
  BEFORE UPDATE ON trip_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_split_group_invitations_updated_at
  BEFORE UPDATE ON split_group_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. 函數：生成邀請碼
-- ============================================
CREATE OR REPLACE FUNCTION generate_invite_code(length INT DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 函數：自動過期邀請
-- ============================================
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  -- 過期好友邀請
  UPDATE friends
  SET status = 'rejected'
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  -- 過期行程邀請
  UPDATE trip_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();

  -- 過期分帳群組邀請
  UPDATE split_group_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMIT;
