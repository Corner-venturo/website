-- ============================================
-- 新增投票截止時間欄位
-- ============================================

-- 新增 inquiry_deadline 欄位到 trip_itinerary_items
ALTER TABLE public.trip_itinerary_items
ADD COLUMN IF NOT EXISTS inquiry_deadline TIMESTAMPTZ;

-- 新增註解
COMMENT ON COLUMN public.trip_itinerary_items.inquiry_deadline IS '出席詢問截止時間（選填）';
