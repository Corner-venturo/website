-- Add split groups for flexible expense sharing
-- Split groups can be linked to a trip or exist independently (for daily expenses)
BEGIN;

-- ============================================
-- 1. Create split_groups table (分帳群組)
-- ============================================
CREATE TABLE IF NOT EXISTS public.split_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name text NOT NULL,                              -- 群組名稱（如：陳家餐費、閨蜜購物）
  description text,                                -- 群組說明
  cover_image text,                                -- 封面圖

  -- Optional trip link
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,  -- 可選：關聯旅遊團

  -- Settings
  default_currency text DEFAULT 'TWD',

  -- Owner
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS split_groups_trip_idx ON public.split_groups(trip_id);
CREATE INDEX IF NOT EXISTS split_groups_created_by_idx ON public.split_groups(created_by);

-- Enable RLS
ALTER TABLE public.split_groups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Create split_group_members table (群組成員)
-- ============================================
CREATE TABLE IF NOT EXISTS public.split_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.split_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Display name in this group
  nickname text,

  -- Role
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),

  -- Join date
  joined_at timestamptz DEFAULT now(),

  UNIQUE(group_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS split_group_members_group_idx ON public.split_group_members(group_id);
CREATE INDEX IF NOT EXISTS split_group_members_user_idx ON public.split_group_members(user_id);

-- Enable RLS
ALTER TABLE public.split_group_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Modify expenses table
-- ============================================
-- Add split_group_id column
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS split_group_id uuid REFERENCES public.split_groups(id) ON DELETE CASCADE;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS expenses_split_group_idx ON public.expenses(split_group_id);

-- ============================================
-- 4. Modify settlements table
-- ============================================
-- Add split_group_id column
ALTER TABLE public.settlements
ADD COLUMN IF NOT EXISTS split_group_id uuid REFERENCES public.split_groups(id) ON DELETE CASCADE;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS settlements_split_group_idx ON public.settlements(split_group_id);

-- ============================================
-- 5. RLS Policies for split_groups
-- ============================================

-- Users can view groups they are a member of
CREATE POLICY "Users can view their split groups"
  ON public.split_groups FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.split_group_members
      WHERE group_id = split_groups.id AND user_id = auth.uid()
    )
  );

-- Users can create groups
CREATE POLICY "Users can create split groups"
  ON public.split_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Group creators can update
CREATE POLICY "Group creators can update"
  ON public.split_groups FOR UPDATE
  USING (created_by = auth.uid());

-- Group creators can delete
CREATE POLICY "Group creators can delete"
  ON public.split_groups FOR DELETE
  USING (created_by = auth.uid());

-- ============================================
-- 6. RLS Policies for split_group_members
-- ============================================

-- Users can view members of groups they belong to
CREATE POLICY "Users can view group members"
  ON public.split_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = split_group_members.group_id AND sgm.user_id = auth.uid()
    )
  );

-- Group owners/admins can add members
CREATE POLICY "Group admins can add members"
  ON public.split_group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.split_groups sg
      WHERE sg.id = split_group_members.group_id AND sg.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = split_group_members.group_id
        AND sgm.user_id = auth.uid()
        AND sgm.role IN ('owner', 'admin')
    )
  );

-- Group owners/admins can remove members
CREATE POLICY "Group admins can remove members"
  ON public.split_group_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.split_groups sg
      WHERE sg.id = split_group_members.group_id AND sg.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = split_group_members.group_id
        AND sgm.user_id = auth.uid()
        AND sgm.role IN ('owner', 'admin')
    ) OR
    -- Users can remove themselves
    user_id = auth.uid()
  );

-- ============================================
-- 7. Update expenses policies to include split_group access
-- ============================================

-- Drop existing policies if they exist (to recreate with new logic)
DROP POLICY IF EXISTS "Users can view trip expenses" ON public.expenses;
DROP POLICY IF EXISTS "Trip members can create expenses" ON public.expenses;

-- Users can view expenses from their trips OR split groups
CREATE POLICY "Users can view expenses"
  ON public.expenses FOR SELECT
  USING (
    -- Via trip membership
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = expenses.trip_id AND tm.user_id = auth.uid()
    ) OR
    -- Via split group membership
    EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = expenses.split_group_id AND sgm.user_id = auth.uid()
    )
  );

-- Users can create expenses in their trips OR split groups
CREATE POLICY "Users can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    -- Via trip membership
    (trip_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = expenses.trip_id AND tm.user_id = auth.uid()
    )) OR
    -- Via split group membership
    (split_group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = expenses.split_group_id AND sgm.user_id = auth.uid()
    ))
  );

-- ============================================
-- 8. Update settlements policies
-- ============================================

-- Drop existing policies to recreate
DROP POLICY IF EXISTS "Users can view trip settlements" ON public.settlements;
DROP POLICY IF EXISTS "Trip members can create settlements" ON public.settlements;

-- Users can view settlements
CREATE POLICY "Users can view settlements"
  ON public.settlements FOR SELECT
  USING (
    from_user = auth.uid() OR to_user = auth.uid() OR
    -- Via trip membership
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = settlements.trip_id AND tm.user_id = auth.uid()
    ) OR
    -- Via split group membership
    EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = settlements.split_group_id AND sgm.user_id = auth.uid()
    )
  );

-- Users can create settlements
CREATE POLICY "Users can create settlements"
  ON public.settlements FOR INSERT
  WITH CHECK (
    -- Via trip membership
    (trip_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = settlements.trip_id AND tm.user_id = auth.uid()
    )) OR
    -- Via split group membership
    (split_group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.split_group_members sgm
      WHERE sgm.group_id = settlements.split_group_id AND sgm.user_id = auth.uid()
    ))
  );

-- ============================================
-- 9. Update triggers for updated_at
-- ============================================
CREATE TRIGGER update_split_groups_updated_at
  BEFORE UPDATE ON public.split_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
