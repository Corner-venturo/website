// 常用機場資料
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
}

export const airports: Airport[] = [
  // 台灣
  { code: 'TPE', name: '桃園國際機場', city: '台北', country: '台灣', countryCode: 'TW' },
  { code: 'TSA', name: '松山機場', city: '台北', country: '台灣', countryCode: 'TW' },
  { code: 'KHH', name: '高雄國際機場', city: '高雄', country: '台灣', countryCode: 'TW' },
  { code: 'RMQ', name: '台中國際機場', city: '台中', country: '台灣', countryCode: 'TW' },

  // 日本
  { code: 'NRT', name: '成田國際機場', city: '東京', country: '日本', countryCode: 'JP' },
  { code: 'HND', name: '羽田機場', city: '東京', country: '日本', countryCode: 'JP' },
  { code: 'KIX', name: '關西國際機場', city: '大阪', country: '日本', countryCode: 'JP' },
  { code: 'ITM', name: '伊丹機場', city: '大阪', country: '日本', countryCode: 'JP' },
  { code: 'NGO', name: '中部國際機場', city: '名古屋', country: '日本', countryCode: 'JP' },
  { code: 'CTS', name: '新千歲機場', city: '札幌', country: '日本', countryCode: 'JP' },
  { code: 'FUK', name: '福岡機場', city: '福岡', country: '日本', countryCode: 'JP' },
  { code: 'OKA', name: '那霸機場', city: '沖繩', country: '日本', countryCode: 'JP' },

  // 韓國
  { code: 'ICN', name: '仁川國際機場', city: '首爾', country: '韓國', countryCode: 'KR' },
  { code: 'GMP', name: '金浦機場', city: '首爾', country: '韓國', countryCode: 'KR' },
  { code: 'PUS', name: '金海機場', city: '釜山', country: '韓國', countryCode: 'KR' },
  { code: 'CJU', name: '濟州機場', city: '濟州', country: '韓國', countryCode: 'KR' },

  // 泰國
  { code: 'BKK', name: '素萬那普機場', city: '曼谷', country: '泰國', countryCode: 'TH' },
  { code: 'DMK', name: '廊曼機場', city: '曼谷', country: '泰國', countryCode: 'TH' },
  { code: 'CNX', name: '清邁機場', city: '清邁', country: '泰國', countryCode: 'TH' },
  { code: 'HKT', name: '普吉機場', city: '普吉', country: '泰國', countryCode: 'TH' },

  // 越南
  { code: 'SGN', name: '新山一機場', city: '胡志明市', country: '越南', countryCode: 'VN' },
  { code: 'HAN', name: '內排機場', city: '河內', country: '越南', countryCode: 'VN' },
  { code: 'DAD', name: '峴港機場', city: '峴港', country: '越南', countryCode: 'VN' },

  // 新加坡
  { code: 'SIN', name: '樟宜機場', city: '新加坡', country: '新加坡', countryCode: 'SG' },

  // 馬來西亞
  { code: 'KUL', name: '吉隆坡國際機場', city: '吉隆坡', country: '馬來西亞', countryCode: 'MY' },

  // 香港
  { code: 'HKG', name: '香港國際機場', city: '香港', country: '香港', countryCode: 'HK' },

  // 澳門
  { code: 'MFM', name: '澳門國際機場', city: '澳門', country: '澳門', countryCode: 'MO' },

  // 中國
  { code: 'PVG', name: '浦東國際機場', city: '上海', country: '中國', countryCode: 'CN' },
  { code: 'SHA', name: '虹橋機場', city: '上海', country: '中國', countryCode: 'CN' },
  { code: 'PEK', name: '首都國際機場', city: '北京', country: '中國', countryCode: 'CN' },
  { code: 'PKX', name: '大興國際機場', city: '北京', country: '中國', countryCode: 'CN' },

  // 菲律賓
  { code: 'MNL', name: '尼諾伊·艾奎諾機場', city: '馬尼拉', country: '菲律賓', countryCode: 'PH' },
  { code: 'CEB', name: '麥克坦機場', city: '宿霧', country: '菲律賓', countryCode: 'PH' },

  // 印尼
  { code: 'CGK', name: '蘇加諾-哈達機場', city: '雅加達', country: '印尼', countryCode: 'ID' },
  { code: 'DPS', name: '伍拉·賴機場', city: '峇里島', country: '印尼', countryCode: 'ID' },

  // 澳洲
  { code: 'SYD', name: '雪梨機場', city: '雪梨', country: '澳洲', countryCode: 'AU' },
  { code: 'MEL', name: '墨爾本機場', city: '墨爾本', country: '澳洲', countryCode: 'AU' },
  { code: 'BNE', name: '布里斯班機場', city: '布里斯班', country: '澳洲', countryCode: 'AU' },

  // 紐西蘭
  { code: 'AKL', name: '奧克蘭機場', city: '奧克蘭', country: '紐西蘭', countryCode: 'NZ' },

  // 美國
  { code: 'LAX', name: '洛杉磯國際機場', city: '洛杉磯', country: '美國', countryCode: 'US' },
  { code: 'SFO', name: '舊金山機場', city: '舊金山', country: '美國', countryCode: 'US' },
  { code: 'JFK', name: '甘迺迪機場', city: '紐約', country: '美國', countryCode: 'US' },
  { code: 'SEA', name: '西雅圖機場', city: '西雅圖', country: '美國', countryCode: 'US' },

  // 加拿大
  { code: 'YVR', name: '溫哥華機場', city: '溫哥華', country: '加拿大', countryCode: 'CA' },
  { code: 'YYZ', name: '皮爾遜機場', city: '多倫多', country: '加拿大', countryCode: 'CA' },

  // 英國
  { code: 'LHR', name: '希斯洛機場', city: '倫敦', country: '英國', countryCode: 'GB' },
  { code: 'LGW', name: '蓋威克機場', city: '倫敦', country: '英國', countryCode: 'GB' },

  // 法國
  { code: 'CDG', name: '戴高樂機場', city: '巴黎', country: '法國', countryCode: 'FR' },
  { code: 'ORY', name: '奧利機場', city: '巴黎', country: '法國', countryCode: 'FR' },

  // 德國
  { code: 'FRA', name: '法蘭克福機場', city: '法蘭克福', country: '德國', countryCode: 'DE' },
  { code: 'MUC', name: '慕尼黑機場', city: '慕尼黑', country: '德國', countryCode: 'DE' },

  // 荷蘭
  { code: 'AMS', name: '史基浦機場', city: '阿姆斯特丹', country: '荷蘭', countryCode: 'NL' },

  // 義大利
  { code: 'FCO', name: '菲烏米奇諾機場', city: '羅馬', country: '義大利', countryCode: 'IT' },
  { code: 'MXP', name: '馬爾彭薩機場', city: '米蘭', country: '義大利', countryCode: 'IT' },

  // 西班牙
  { code: 'MAD', name: '馬德里機場', city: '馬德里', country: '西班牙', countryCode: 'ES' },
  { code: 'BCN', name: '巴塞隆納機場', city: '巴塞隆納', country: '西班牙', countryCode: 'ES' },

  // 瑞士
  { code: 'ZRH', name: '蘇黎世機場', city: '蘇黎世', country: '瑞士', countryCode: 'CH' },

  // 阿聯酋
  { code: 'DXB', name: '杜拜國際機場', city: '杜拜', country: '阿聯酋', countryCode: 'AE' },
];

// 根據機場代碼查詢機場資訊
export const getAirportByCode = (code: string): Airport | undefined => {
  return airports.find((a) => a.code.toUpperCase() === code.toUpperCase());
};

// 根據機場代碼查詢國家代碼
export const getCountryByAirportCode = (code: string): string | undefined => {
  return getAirportByCode(code)?.countryCode;
};

// 搜尋機場（支援代碼、城市、名稱）
export const searchAirports = (query: string): Airport[] => {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return airports.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  );
};

// 國家代碼對應顏色
export const countryColors: Record<string, string> = {
  JP: '#cfa5a5',
  KR: '#e0c080',
  TH: '#a8bfa6',
  VN: '#a5bccf',
  SG: '#cfa5a5',
  MY: '#cfb9a5',
  HK: '#a5bccf',
  MO: '#e0d6a8',
  CN: '#cfa5a5',
  PH: '#a8bfa6',
  ID: '#cfb9a5',
  AU: '#a5bccf',
  NZ: '#a8bfa6',
  US: '#cfb9a5',
  CA: '#cfa5a5',
  GB: '#a5bccf',
  FR: '#cfa5a5',
  DE: '#e0c080',
  NL: '#a5bccf',
  IT: '#a8bfa6',
  ES: '#e0c080',
  CH: '#cfa5a5',
  AE: '#cfb9a5',
  TW: '#a8bfa6',
};

// 國家代碼對應中文名稱
export const countryNames: Record<string, string> = {
  JP: '日本',
  KR: '韓國',
  TH: '泰國',
  VN: '越南',
  SG: '新加坡',
  MY: '馬來西亞',
  HK: '香港',
  MO: '澳門',
  CN: '中國',
  PH: '菲律賓',
  ID: '印尼',
  AU: '澳洲',
  NZ: '紐西蘭',
  US: '美國',
  CA: '加拿大',
  GB: '英國',
  FR: '法國',
  DE: '德國',
  NL: '荷蘭',
  IT: '義大利',
  ES: '西班牙',
  CH: '瑞士',
  AE: '阿聯酋',
  TW: '台灣',
};
