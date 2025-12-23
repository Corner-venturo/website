-- ============================================
-- 效能優化：新增資料庫索引
-- ============================================

-- split_group_members 索引
CREATE INDEX IF NOT EXISTS idx_split_group_members_group_id
ON public.split_group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_split_group_members_user_id
ON public.split_group_members(user_id);

-- expenses 索引
CREATE INDEX IF NOT EXISTS idx_expenses_split_group_id
ON public.expenses(split_group_id);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_id
ON public.expenses(trip_id);

CREATE INDEX IF NOT EXISTS idx_expenses_paid_by
ON public.expenses(paid_by);

CREATE INDEX IF NOT EXISTS idx_expenses_expense_date
ON public.expenses(expense_date DESC);

-- expense_splits 索引
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id
ON public.expense_splits(expense_id);

CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id
ON public.expense_splits(user_id);

-- settlements 索引
CREATE INDEX IF NOT EXISTS idx_settlements_group_id
ON public.settlements(split_group_id);

CREATE INDEX IF NOT EXISTS idx_settlements_from_user
ON public.settlements(from_user);

CREATE INDEX IF NOT EXISTS idx_settlements_to_user
ON public.settlements(to_user);

-- split_groups 索引
CREATE INDEX IF NOT EXISTS idx_split_groups_created_by
ON public.split_groups(created_by);

CREATE INDEX IF NOT EXISTS idx_split_groups_trip_id
ON public.split_groups(trip_id);

-- trip 相關索引
CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id
ON public.trip_members(trip_id);

CREATE INDEX IF NOT EXISTS idx_trip_members_user_id
ON public.trip_members(user_id);

CREATE INDEX IF NOT EXISTS idx_trip_itinerary_items_trip_id
ON public.trip_itinerary_items(trip_id);

CREATE INDEX IF NOT EXISTS idx_trips_created_by
ON public.trips(created_by);

-- 分析表以更新統計資料
ANALYZE public.split_group_members;
ANALYZE public.expenses;
ANALYZE public.expense_splits;
ANALYZE public.settlements;
ANALYZE public.split_groups;
ANALYZE public.trip_members;
ANALYZE public.trip_itinerary_items;
ANALYZE public.trips;
