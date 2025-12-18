-- Add founding member fields and create split (expense sharing) tables
BEGIN;

-- ============================================
-- 1. Add founding member fields to profiles
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_founding_member boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS member_number integer;

-- Create unique index for member_number (only for founding members)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_member_number_idx
ON public.profiles(member_number)
WHERE member_number IS NOT NULL;

-- Add constraint to ensure member_number is between 1-100
ALTER TABLE public.profiles
ADD CONSTRAINT member_number_range
CHECK (member_number IS NULL OR (member_number >= 1 AND member_number <= 100));

-- Function to assign founding member number
CREATE OR REPLACE FUNCTION public.assign_founding_member_number()
RETURNS trigger AS $$
DECLARE
  next_number integer;
BEGIN
  -- Only assign if not already a founding member and within limit
  IF NEW.is_founding_member = true AND NEW.member_number IS NULL THEN
    SELECT COALESCE(MAX(member_number), 0) + 1 INTO next_number
    FROM public.profiles
    WHERE member_number IS NOT NULL;

    -- Only assign if under 100
    IF next_number <= 100 THEN
      NEW.member_number := next_number;
    ELSE
      NEW.is_founding_member := false;
      NEW.member_number := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign founding member number
DROP TRIGGER IF EXISTS assign_founding_member ON public.profiles;
CREATE TRIGGER assign_founding_member
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_founding_member_number();

-- Update handle_new_user to mark first 100 users as founding members
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  current_count integer;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO current_count FROM public.profiles;

  INSERT INTO public.profiles (id, full_name, display_name, avatar_url, is_founding_member)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    current_count < 100  -- First 100 users are founding members
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Create trips table (旅程)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title text NOT NULL,                           -- 旅程名稱
  description text,                              -- 旅程描述
  cover_image text,                              -- 封面圖片 URL

  -- Trip dates
  start_date date,                               -- 開始日期
  end_date date,                                 -- 結束日期

  -- Status
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'upcoming', 'ongoing', 'completed')),

  -- Owner
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Currency settings
  default_currency text DEFAULT 'TWD',           -- 預設貨幣

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS trips_created_by_idx ON public.trips(created_by);
CREATE INDEX IF NOT EXISTS trips_status_idx ON public.trips(status);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Create trip_members table (旅程成員)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Role in trip
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),

  -- Display name for this trip (can differ from profile)
  nickname text,

  -- Join date
  joined_at timestamptz DEFAULT now(),

  UNIQUE(trip_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS trip_members_trip_idx ON public.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS trip_members_user_idx ON public.trip_members(user_id);

-- Enable RLS
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Create expenses table (費用記錄)
-- ============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,

  -- Expense info
  title text NOT NULL,                           -- 費用標題
  description text,                              -- 備註說明
  category text DEFAULT 'other' CHECK (category IN (
    'transport', 'accommodation', 'food', 'ticket', 'shopping', 'insurance', 'other'
  )),                                            -- 類別

  -- Amount
  amount decimal(12, 2) NOT NULL,                -- 金額
  currency text DEFAULT 'TWD',                   -- 貨幣

  -- Who paid
  paid_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Date
  expense_date date DEFAULT CURRENT_DATE,

  -- Receipt
  receipt_url text,                              -- 收據照片 URL

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS expenses_trip_idx ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS expenses_paid_by_idx ON public.expenses(paid_by);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON public.expenses(expense_date);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Create expense_splits table (費用分攤)
-- ============================================
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Split amount
  amount decimal(12, 2) NOT NULL,                -- 應分攤金額

  -- Whether this user has settled
  is_settled boolean DEFAULT false,
  settled_at timestamptz,

  UNIQUE(expense_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS expense_splits_expense_idx ON public.expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS expense_splits_user_idx ON public.expense_splits(user_id);

-- Enable RLS
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. Create settlements table (結算記錄)
-- ============================================
CREATE TABLE IF NOT EXISTS public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,

  -- Settlement details
  from_user uuid REFERENCES public.profiles(id) ON DELETE SET NULL,  -- 付款人
  to_user uuid REFERENCES public.profiles(id) ON DELETE SET NULL,    -- 收款人
  amount decimal(12, 2) NOT NULL,                                     -- 金額
  currency text DEFAULT 'TWD',

  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),

  -- Notes
  note text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS settlements_trip_idx ON public.settlements(trip_id);
CREATE INDEX IF NOT EXISTS settlements_from_idx ON public.settlements(from_user);
CREATE INDEX IF NOT EXISTS settlements_to_idx ON public.settlements(to_user);

-- Enable RLS
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS Policies for all tables
-- ============================================

-- Trips: Users can see trips they're a member of
CREATE POLICY "Users can view their trips"
  ON public.trips FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trips.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Trip owners can update"
  ON public.trips FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Trip owners can delete"
  ON public.trips FOR DELETE
  USING (created_by = auth.uid());

-- Trip members: Users can see members of their trips
CREATE POLICY "Users can view trip members"
  ON public.trip_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = trip_members.trip_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip owners can manage members"
  ON public.trip_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_members.trip_id AND t.created_by = auth.uid()
    )
  );

-- Expenses: Users can see expenses from their trips
CREATE POLICY "Users can view trip expenses"
  ON public.expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = expenses.trip_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = expenses.trip_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Expense creators can update"
  ON public.expenses FOR UPDATE
  USING (paid_by = auth.uid());

CREATE POLICY "Expense creators can delete"
  ON public.expenses FOR DELETE
  USING (paid_by = auth.uid());

-- Expense splits: Users can see splits from their trips
CREATE POLICY "Users can view expense splits"
  ON public.expense_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      JOIN public.trip_members tm ON tm.trip_id = e.trip_id
      WHERE e.id = expense_splits.expense_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can manage splits"
  ON public.expense_splits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      JOIN public.trip_members tm ON tm.trip_id = e.trip_id
      WHERE e.id = expense_splits.expense_id AND tm.user_id = auth.uid()
    )
  );

-- Settlements: Users can see settlements from their trips
CREATE POLICY "Users can view trip settlements"
  ON public.settlements FOR SELECT
  USING (
    from_user = auth.uid() OR to_user = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = settlements.trip_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create settlements"
  ON public.settlements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = settlements.trip_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Settlement parties can update"
  ON public.settlements FOR UPDATE
  USING (from_user = auth.uid() OR to_user = auth.uid());

-- ============================================
-- 8. Update triggers for updated_at
-- ============================================
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
