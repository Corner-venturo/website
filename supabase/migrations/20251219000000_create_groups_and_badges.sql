-- Create groups (揪團) and badges (徽章) tables
BEGIN;

-- ============================================
-- 1. Create groups table (揪團活動)
-- ============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title text NOT NULL,                           -- 活動名稱
  description text,                              -- 活動描述
  cover_image text,                              -- 封面圖片 URL
  category text DEFAULT 'other' CHECK (category IN (
    'food', 'photo', 'outdoor', 'party', 'music', 'coffee', 'other'
  )),                                            -- 活動類別

  -- Location
  location_name text,                            -- 地點名稱
  location_address text,                         -- 詳細地址
  latitude decimal(10, 8),                       -- 緯度
  longitude decimal(11, 8),                      -- 經度

  -- Time
  event_date date NOT NULL,                      -- 活動日期
  start_time time,                               -- 開始時間
  end_time time,                                 -- 結束時間

  -- Participants
  max_members integer DEFAULT 10,                -- 人數上限
  current_members integer DEFAULT 1,             -- 目前人數
  gender_limit text DEFAULT 'all' CHECK (gender_limit IN ('all', 'male', 'female')),

  -- Settings
  require_approval boolean DEFAULT true,         -- 需要審核
  is_private boolean DEFAULT false,              -- 私密活動
  estimated_cost decimal(10, 2),                 -- 預估費用

  -- Status
  status text DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'full', 'completed', 'cancelled'
  )),

  -- Creator
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz                       -- 發布時間
);

-- Create indexes
CREATE INDEX IF NOT EXISTS groups_created_by_idx ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS groups_status_idx ON public.groups(status);
CREATE INDEX IF NOT EXISTS groups_category_idx ON public.groups(category);
CREATE INDEX IF NOT EXISTS groups_event_date_idx ON public.groups(event_date);
CREATE INDEX IF NOT EXISTS groups_location_idx ON public.groups(latitude, longitude);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Create group_members table (揪團參加者)
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Role
  role text DEFAULT 'member' CHECK (role IN ('organizer', 'member')),

  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Timestamps
  applied_at timestamptz DEFAULT now(),
  approved_at timestamptz,

  UNIQUE(group_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS group_members_group_idx ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS group_members_user_idx ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS group_members_status_idx ON public.group_members(status);

-- Enable RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Create user_badges table (用戶徽章)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Badge info
  badge_type text NOT NULL CHECK (badge_type IN (
    'founding_member',   -- 創始會員
    'group_newbie',      -- 揪團小白 (首次發起揪團)
    'group_pro',         -- 揪團達人 (完成 5 次揪團)
    'popular_host',      -- 人氣王 (揪團滿員 3 次)
    'group_master',      -- 揪團大師 (完成 20 次揪團)
    'trip_planner',      -- 行程規劃師
    'expense_tracker',   -- 記帳達人
    'early_bird',        -- 早鳥優惠
    'social_butterfly'   -- 社交蝴蝶
  )),

  -- Metadata
  metadata jsonb DEFAULT '{}',                   -- 額外資料

  -- Timestamps
  earned_at timestamptz DEFAULT now(),

  UNIQUE(user_id, badge_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_badges_user_idx ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS user_badges_type_idx ON public.user_badges(badge_type);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Create group_tags table (活動標籤)
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  tag text NOT NULL,

  UNIQUE(group_id, tag)
);

CREATE INDEX IF NOT EXISTS group_tags_group_idx ON public.group_tags(group_id);
CREATE INDEX IF NOT EXISTS group_tags_tag_idx ON public.group_tags(tag);

ALTER TABLE public.group_tags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Add member_level to profiles
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS member_level text DEFAULT 'basic' CHECK (member_level IN ('basic', 'premium', 'vip')),
ADD COLUMN IF NOT EXISTS active_group_count integer DEFAULT 0;

-- ============================================
-- 6. RLS Policies
-- ============================================

-- Groups: Public groups are visible to everyone, private only to members
CREATE POLICY "Anyone can view public groups"
  ON public.groups FOR SELECT
  USING (
    is_private = false AND status IN ('active', 'full') OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Organizers can update their groups"
  ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Organizers can delete their groups"
  ON public.groups FOR DELETE
  USING (created_by = auth.uid());

-- Group members
CREATE POLICY "Anyone can view group members of public groups"
  ON public.group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id AND (
        g.is_private = false OR
        g.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.group_members gm2
          WHERE gm2.group_id = g.id AND gm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Authenticated users can apply to groups"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can manage members"
  ON public.group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    )
  );

-- User badges: Users can see all badges, only system can grant
CREATE POLICY "Anyone can view badges"
  ON public.user_badges FOR SELECT
  USING (true);

-- Group tags
CREATE POLICY "Anyone can view group tags"
  ON public.group_tags FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage tags"
  ON public.group_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_tags.group_id AND g.created_by = auth.uid()
    )
  );

-- ============================================
-- 7. Functions for group management
-- ============================================

-- Function to check if user can create more groups
CREATE OR REPLACE FUNCTION public.can_create_group(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_level text;
  active_count integer;
  max_allowed integer;
BEGIN
  SELECT member_level, active_group_count INTO user_level, active_count
  FROM public.profiles WHERE id = user_id;

  -- Set limits based on member level
  CASE user_level
    WHEN 'basic' THEN max_allowed := 1;
    WHEN 'premium' THEN max_allowed := 3;
    WHEN 'vip' THEN max_allowed := 999;
    ELSE max_allowed := 1;
  END CASE;

  RETURN active_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant badge
CREATE OR REPLACE FUNCTION public.grant_badge(
  p_user_id uuid,
  p_badge_type text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO public.user_badges (user_id, badge_type, metadata)
  VALUES (p_user_id, p_badge_type, p_metadata)
  ON CONFLICT (user_id, badge_type) DO NOTHING;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update group member count
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE public.groups
    SET current_members = current_members + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE public.groups
    SET current_members = current_members - 1
    WHERE id = OLD.group_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    UPDATE public.groups
    SET current_members = current_members + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.groups
    SET current_members = current_members - 1
    WHERE id = NEW.group_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for member count
CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();

-- Function to check if group is full and update status
CREATE OR REPLACE FUNCTION public.check_group_full()
RETURNS trigger AS $$
BEGIN
  IF NEW.current_members >= NEW.max_members AND NEW.status = 'active' THEN
    NEW.status := 'full';
  ELSIF NEW.current_members < NEW.max_members AND NEW.status = 'full' THEN
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_group_full_trigger
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.check_group_full();

-- Update trigger for groups
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. Grant founding_member badge to existing founding members
-- ============================================
INSERT INTO public.user_badges (user_id, badge_type, metadata)
SELECT id, 'founding_member', jsonb_build_object('member_number', member_number)
FROM public.profiles
WHERE is_founding_member = true AND member_number IS NOT NULL
ON CONFLICT (user_id, badge_type) DO NOTHING;

COMMIT;
