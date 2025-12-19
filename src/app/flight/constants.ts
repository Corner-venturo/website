// 航班資訊
export const flightInfo = {
  airline: '星宇航空',
  flightNumber: 'JX850',
  aircraft: 'Airbus A330',
  status: '準時起飛',
  departure: {
    time: '08:30',
    code: 'TPE',
    terminal: '台北桃園 T1',
  },
  arrival: {
    time: '12:10',
    code: 'KIX',
    terminal: '大阪關西 T1',
  },
  date: '11月15日',
  duration: '2h 40m',
  gate: 'B6',
  seat: '12A',
  baggage: '23kg x 2',
  carryOn: '7kg x 1',
  meal: '標準餐',
  cabin: '經濟艙 (Q)',
  pnr: '6X2K9L',
  ticket: '695-234891002',
};

// 航班提醒
export const flightReminders = [
  '請於起飛前 2 小時抵達機場辦理登機手續。',
  '您的登機門可能會臨時變更，請隨時留意機場廣播。',
  '目的地大阪目前氣溫 12°C，建議攜帶薄外套。',
];

// 住宿資訊
export const stayInfo = {
  name: '大阪世紀酒店',
  rating: 4.8,
  stars: 5,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClBiVIO27lB5T_e3zUwyvCEhHPfUhyTj0ibF8BChYP5w0jvIWuSjdZkC7WKDcGya2FoRoFv-8N2ZDWoSQxApXRWutSDjTemfsUH7vAVEkLhLmv_ARuwjx8zElBSJ9fWF_phbItOYF34CnG4WXC5Ssc1XBGhfVKbJrD5a5_G8yBg9Rkpx66EtQM2WK1H1gXwsyN8ImLv4APjuyXZXcWmqJt71DvfAgdrctkBrZbUDVh6n6CS4xQyoc8fY8sonBs31MvWKi6syze9wax',
  address: '大阪府大阪市北區大深町 3-1',
  checkIn: { date: '11月15日', day: '週五', time: '15:00' },
  checkOut: { date: '11月18日', day: '週一', time: '11:00' },
  nights: 3,
  bookingId: 'HTL-88293',
  roomType: '豪華雙人房',
  bedType: '大床 x 1',
  guests: '2 位成人',
  requests: ['包含早餐', '高樓層房'],
  paymentStatus: '已付款',
  phone: '+81 6-1234-5678',
};

// 住宿提醒
export const stayReminders = [
  '入住時間：15:00 後，退房時間：11:00 前。',
  '辦理入住時請出示護照與入住憑證。',
  '飯店禁止攜帶寵物（導盲犬除外）。',
];
