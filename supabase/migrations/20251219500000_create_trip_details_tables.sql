-- 建立行程相關詳細資料表
BEGIN;

-- ============================================
-- 1. 航班資料表 trip_flights
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  -- 航班類型：outbound(去程) / return(回程)
  flight_type TEXT NOT NULL CHECK (flight_type IN ('outbound', 'return')),

  -- 航班基本資訊
  airline TEXT NOT NULL,              -- 航空公司名稱
  flight_no TEXT NOT NULL,            -- 航班號碼
  aircraft TEXT,                      -- 機型

  -- 起飛資訊
  departure_time TIME NOT NULL,       -- 起飛時間
  departure_date DATE NOT NULL,       -- 起飛日期
  departure_airport TEXT NOT NULL,    -- 起飛機場名稱
  departure_code TEXT NOT NULL,       -- 起飛機場代碼 (TPE, OKA, etc.)
  departure_terminal TEXT,            -- 航廈

  -- 抵達資訊
  arrival_time TIME NOT NULL,         -- 抵達時間
  arrival_date DATE NOT NULL,         -- 抵達日期
  arrival_airport TEXT NOT NULL,      -- 抵達機場名稱
  arrival_code TEXT NOT NULL,         -- 抵達機場代碼
  arrival_terminal TEXT,              -- 航廈

  -- 訂位資訊
  pnr TEXT,                           -- 訂位代號
  ticket_number TEXT,                 -- 電子機票號碼

  -- 行李和餐點
  baggage_allowance TEXT,             -- 托運行李額度
  carry_on_allowance TEXT,            -- 手提行李額度
  meal_type TEXT,                     -- 機上餐點
  cabin_class TEXT,                   -- 艙等

  -- 集合資訊
  meeting_time TIME,                  -- 集合時間
  meeting_location TEXT,              -- 集合地點

  -- 狀態
  status TEXT DEFAULT 'confirmed',    -- confirmed, delayed, cancelled
  gate TEXT,                          -- 登機門

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_trip_flights_trip_id ON public.trip_flights(trip_id);

-- ============================================
-- 2. 住宿資料表 trip_accommodations
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  -- 飯店基本資訊
  name TEXT NOT NULL,                 -- 飯店名稱
  name_en TEXT,                       -- 英文名稱

  -- 地址和聯絡
  address TEXT NOT NULL,              -- 地址
  phone TEXT,                         -- 電話
  email TEXT,                         -- Email
  website TEXT,                       -- 網站
  map_url TEXT,                       -- Google Maps 連結

  -- 入住資訊
  check_in_date DATE NOT NULL,        -- 入住日期
  check_out_date DATE NOT NULL,       -- 退房日期
  check_in_time TIME DEFAULT '15:00', -- 入住時間
  check_out_time TIME DEFAULT '11:00',-- 退房時間

  -- 房間資訊
  room_type TEXT,                     -- 房型
  room_count INTEGER DEFAULT 1,       -- 房間數
  guests_count INTEGER,               -- 入住人數

  -- 訂房資訊
  confirmation_number TEXT,           -- 訂房確認號
  booking_platform TEXT,              -- 訂房平台

  -- 圖片
  cover_image TEXT,                   -- 封面圖片 URL

  -- 備註
  notes TEXT,                         -- 備註

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_trip_accommodations_trip_id ON public.trip_accommodations(trip_id);

-- ============================================
-- 3. 行程項目資料表 trip_itinerary_items
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  -- 時間
  day_number INTEGER NOT NULL,        -- 第幾天
  item_date DATE NOT NULL,            -- 日期
  start_time TIME,                    -- 開始時間
  end_time TIME,                      -- 結束時間

  -- 基本資訊
  title TEXT NOT NULL,                -- 標題
  description TEXT,                   -- 描述
  category TEXT,                      -- 類別：景點、美食、體驗、住宿、交通、購物、其他

  -- 地點
  location_name TEXT,                 -- 地點名稱
  location_address TEXT,              -- 地址
  location_url TEXT,                  -- Google Maps 連結
  latitude DECIMAL(10, 8),            -- 緯度
  longitude DECIMAL(11, 8),           -- 經度

  -- 費用
  estimated_cost DECIMAL(10, 2),      -- 預估費用
  currency TEXT DEFAULT 'TWD',        -- 幣別
  paid_by UUID REFERENCES public.profiles(id), -- 誰墊付

  -- 圖片和 icon
  icon TEXT,                          -- Material icon 名稱
  image_url TEXT,                     -- 圖片 URL
  color TEXT,                         -- 顏色標記

  -- 排序
  sort_order INTEGER DEFAULT 0,       -- 排序順序

  -- 出席詢問
  inquiry_by UUID REFERENCES public.profiles(id), -- 誰發起詢問

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_trip_itinerary_items_trip_id ON public.trip_itinerary_items(trip_id);
CREATE INDEX idx_trip_itinerary_items_day ON public.trip_itinerary_items(trip_id, day_number);

-- ============================================
-- 4. 行程項目出席記錄 trip_item_attendance
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_item_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.trip_itinerary_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'pending')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(item_id, user_id)
);

-- 建立索引
CREATE INDEX idx_trip_item_attendance_item_id ON public.trip_item_attendance(item_id);

-- ============================================
-- 5. 好友關係資料表 friendships
-- ============================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 發起者和接收者
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 狀態：pending(等待中), accepted(已接受), blocked(已封鎖)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 確保不會重複建立關係
  UNIQUE(requester_id, addressee_id),
  -- 不能加自己為好友
  CHECK (requester_id != addressee_id)
);

-- 建立索引
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);

-- ============================================
-- 6. 啟用 RLS
-- ============================================

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_item_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS 政策 - trip_flights
-- ============================================

-- 行程成員可以查看航班
CREATE POLICY "trip_flights_member_read" ON public.trip_flights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = trip_flights.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

-- 行程建立者可以新增/修改/刪除航班
CREATE POLICY "trip_flights_owner_all" ON public.trip_flights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_flights.trip_id
      AND trips.created_by = auth.uid()
    )
  );

-- ============================================
-- 8. RLS 政策 - trip_accommodations
-- ============================================

CREATE POLICY "trip_accommodations_member_read" ON public.trip_accommodations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = trip_accommodations.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "trip_accommodations_owner_all" ON public.trip_accommodations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_accommodations.trip_id
      AND trips.created_by = auth.uid()
    )
  );

-- ============================================
-- 9. RLS 政策 - trip_itinerary_items
-- ============================================

CREATE POLICY "trip_itinerary_items_member_read" ON public.trip_itinerary_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = trip_itinerary_items.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "trip_itinerary_items_owner_all" ON public.trip_itinerary_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_itinerary_items.trip_id
      AND trips.created_by = auth.uid()
    )
  );

-- ============================================
-- 10. RLS 政策 - trip_item_attendance
-- ============================================

-- 可以查看自己相關行程的出席記錄
CREATE POLICY "trip_item_attendance_member_read" ON public.trip_item_attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_itinerary_items item
      JOIN public.trip_members tm ON tm.trip_id = item.trip_id
      WHERE item.id = trip_item_attendance.item_id
      AND tm.user_id = auth.uid()
    )
  );

-- 可以更新自己的出席狀態
CREATE POLICY "trip_item_attendance_self_update" ON public.trip_item_attendance
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "trip_item_attendance_self_insert" ON public.trip_item_attendance
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- 11. RLS 政策 - friendships
-- ============================================

-- 可以查看自己的好友關係
CREATE POLICY "friendships_self_read" ON public.friendships
  FOR SELECT USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

-- 可以發起好友請求
CREATE POLICY "friendships_self_insert" ON public.friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- 可以更新自己收到的請求（接受/拒絕）
CREATE POLICY "friendships_addressee_update" ON public.friendships
  FOR UPDATE USING (addressee_id = auth.uid());

-- 可以刪除自己發起或收到的請求
CREATE POLICY "friendships_self_delete" ON public.friendships
  FOR DELETE USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

COMMIT;
