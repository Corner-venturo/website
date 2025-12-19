-- 為沖繩行程插入測試資料
BEGIN;

-- 先清除舊資料
DELETE FROM public.trip_flights WHERE trip_id = 'fe9b114d-f2b6-4d44-9352-ce9b9068b1f5';
DELETE FROM public.trip_accommodations WHERE trip_id = 'fe9b114d-f2b6-4d44-9352-ce9b9068b1f5';

-- 插入去程航班
INSERT INTO public.trip_flights (
  trip_id, flight_type, airline, flight_no,
  departure_time, departure_date, departure_airport, departure_code, departure_terminal,
  arrival_time, arrival_date, arrival_airport, arrival_code,
  baggage_allowance, carry_on_allowance, meal_type, cabin_class,
  meeting_time, meeting_location, status
) VALUES (
  'fe9b114d-f2b6-4d44-9352-ce9b9068b1f5', 'outbound', '泰越捷航空', 'VZ568',
  '14:45', '2024-12-23', '桃園國際機場', 'TPE', 'T1',
  '17:10', '2024-12-23', '那霸機場', 'OKA',
  '20kg', '7kg', '機上購買', '經濟艙',
  '12:00', '桃園國際機場 第一航廈 出境大廳', 'confirmed'
);

-- 插入回程航班
INSERT INTO public.trip_flights (
  trip_id, flight_type, airline, flight_no,
  departure_time, departure_date, departure_airport, departure_code,
  arrival_time, arrival_date, arrival_airport, arrival_code, arrival_terminal,
  baggage_allowance, carry_on_allowance, meal_type, cabin_class, status
) VALUES (
  'fe9b114d-f2b6-4d44-9352-ce9b9068b1f5', 'return', '泰越捷航空', 'VZ569',
  '18:05', '2024-12-27', '那霸機場', 'OKA',
  '18:45', '2024-12-27', '桃園國際機場', 'TPE', 'T1',
  '20kg', '7kg', '機上購買', '經濟艙', 'confirmed'
);

-- 插入住宿資料
INSERT INTO public.trip_accommodations (
  trip_id, name, name_en, address, phone, website, map_url,
  check_in_date, check_out_date, check_in_time, check_out_time,
  room_type, room_count, guests_count, booking_platform, notes
) VALUES (
  'fe9b114d-f2b6-4d44-9352-ce9b9068b1f5',
  'Orion 那霸國際通飯店',
  'Hotel Orion Motobu Resort & Spa',
  '〒900-0013 沖繩縣那霸市牧志1-2-21',
  '+81-98-862-5533',
  'https://www.okinawa-orion.com/',
  'https://maps.app.goo.gl/jWsPR4zTMZfMzyHPA',
  '2024-12-23', '2024-12-27', '15:00', '11:00',
  '標準雙人房', 2, 4, 'Agoda', '飯店位於國際通上，交通便利'
);

COMMIT;
