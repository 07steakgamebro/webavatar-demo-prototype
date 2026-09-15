export interface CityMeta {
  code: string;
  icao: string;
  provinceTh: string;
  provinceEn: string;
  nameEn: string;
  nameTh: string;
  fullNameTh: string;
  fullNameEn: string;
  airportEn: string;
  airportTh: string;
}

/**
 * 31 Airports according to "รายชื่อสนามบิน - ชีต1"
 * Format: สนามบิน (จังหวัด) / Airport (Province)
 */
export const PRIMARY_CITIES_CONFIG: Record<string, CityMeta> = {
  "สุวรรณภูมิ (BKK)": {
    code: "BKK",
    icao: "VTBS",
    provinceTh: "สมุทรปราการ",
    provinceEn: "Samut Prakan",
    nameEn: "Suvarnabhumi (Samut Prakan)",
    nameTh: "สุวรรณภูมิ (สมุทรปราการ)",
    fullNameTh: "จังหวัดสมุทรปราการ (ท่าอากาศยานสุวรรณภูมิ)",
    fullNameEn: "Samut Prakan (Suvarnabhumi Airport)",
    airportEn: "Suvarnabhumi Airport",
    airportTh: "ท่าอากาศยานสุวรรณภูมิ",
  },
  "ดอนเมือง (DMK)": {
    code: "DMK",
    icao: "VTBD",
    provinceTh: "กรุงเทพมหานคร",
    provinceEn: "Bangkok",
    nameEn: "Don Mueang (Bangkok)",
    nameTh: "ดอนเมือง (กรุงเทพมหานคร)",
    fullNameTh: "กรุงเทพมหานคร (ท่าอากาศยานดอนเมือง)",
    fullNameEn: "Bangkok (Don Mueang International Airport)",
    airportEn: "Don Mueang International Airport",
    airportTh: "ท่าอากาศยานดอนเมือง",
  },
  "เชียงใหม่ (CNX)": {
    code: "CNX",
    icao: "VTCC",
    provinceTh: "เชียงใหม่",
    provinceEn: "Chiang Mai",
    nameEn: "Chiang Mai",
    nameTh: "เชียงใหม่",
    fullNameTh: "จังหวัดเชียงใหม่ (ท่าอากาศยานนานาชาติเชียงใหม่)",
    fullNameEn: "Chiang Mai (Chiang Mai International Airport)",
    airportEn: "Chiang Mai International Airport",
    airportTh: "ท่าอากาศยานเชียงใหม่",
  },
  "เชียงราย (CEI)": {
    code: "CEI",
    icao: "VTCT",
    provinceTh: "เชียงราย",
    provinceEn: "Chiang Rai",
    nameEn: "Chiang Rai",
    nameTh: "เชียงราย",
    fullNameTh: "จังหวัดเชียงราย (ท่าอากาศยานแม่ฟ้าหลวง เชียงราย)",
    fullNameEn: "Chiang Rai (Mae Fah Luang Chiang Rai International Airport)",
    airportEn: "Mae Fah Luang Chiang Rai Airport",
    airportTh: "ท่าอากาศยานแม่ฟ้าหลวง เชียงราย",
  },
  "ภูเก็ต (HKT)": {
    code: "HKT",
    icao: "VTSP",
    provinceTh: "ภูเก็ต",
    provinceEn: "Phuket",
    nameEn: "Phuket",
    nameTh: "ภูเก็ต",
    fullNameTh: "จังหวัดภูเก็ต (ท่าอากาศยานนานาชาติภูเก็ต)",
    fullNameEn: "Phuket (Phuket International Airport)",
    airportEn: "Phuket International Airport",
    airportTh: "ท่าอากาศยานภูเก็ต",
  },
  "หาดใหญ่ (HDY)": {
    code: "HDY",
    icao: "VTSS",
    provinceTh: "สงขลา",
    provinceEn: "Songkhla",
    nameEn: "Hat Yai (Songkhla)",
    nameTh: "หาดใหญ่ (สงขลา)",
    fullNameTh: "จังหวัดสงขลา (ท่าอากาศยานนานาชาติหาดใหญ่)",
    fullNameEn: "Songkhla (Hat Yai International Airport)",
    airportEn: "Hat Yai International Airport",
    airportTh: "ท่าอากาศยานหาดใหญ่",
  },
  "กระบี่ (KBV)": {
    code: "KBV",
    icao: "VTSG",
    provinceTh: "กระบี่",
    provinceEn: "Krabi",
    nameEn: "Krabi",
    nameTh: "กระบี่",
    fullNameTh: "จังหวัดกระบี่ (ท่าอากาศยานนานาชาติกระบี่)",
    fullNameEn: "Krabi (Krabi International Airport)",
    airportEn: "Krabi International Airport",
    airportTh: "ท่าอากาศยานกระบี่",
  },
  "ขอนแก่น (KKC)": {
    code: "KKC",
    icao: "VTUK",
    provinceTh: "ขอนแก่น",
    provinceEn: "Khon Kaen",
    nameEn: "Khon Kaen",
    nameTh: "ขอนแก่น",
    fullNameTh: "จังหวัดขอนแก่น (ท่าอากาศยานขอนแก่น)",
    fullNameEn: "Khon Kaen (Khon Kaen Airport)",
    airportEn: "Khon Kaen Airport",
    airportTh: "ท่าอากาศยานขอนแก่น",
  },
  "ชุมพร (CJM)": {
    code: "CJM",
    icao: "VTSE",
    provinceTh: "ชุมพร",
    provinceEn: "Chumphon",
    nameEn: "Chumphon",
    nameTh: "ชุมพร",
    fullNameTh: "จังหวัดชุมพร (ท่าอากาศยานชุมพร)",
    fullNameEn: "Chumphon (Chumphon Airport)",
    airportEn: "Chumphon Airport",
    airportTh: "ท่าอากาศยานชุมพร",
  },
  "ตรัง (TST)": {
    code: "TST",
    icao: "VTST",
    provinceTh: "ตรัง",
    provinceEn: "Trang",
    nameEn: "Trang",
    nameTh: "ตรัง",
    fullNameTh: "จังหวัดตรัง (ท่าอากาศยานตรัง)",
    fullNameEn: "Trang (Trang Airport)",
    airportEn: "Trang Airport",
    airportTh: "ท่าอากาศยานตรัง",
  },
  "แม่สอด (MAQ)": {
    code: "MAQ",
    icao: "VTPM",
    provinceTh: "ตาก",
    provinceEn: "Tak",
    nameEn: "Mae Sot (Tak)",
    nameTh: "แม่สอด (ตาก)",
    fullNameTh: "จังหวัดตาก (ท่าอากาศยานแม่สอด)",
    fullNameEn: "Tak (Mae Sot Airport)",
    airportEn: "Mae Sot Airport",
    airportTh: "ท่าอากาศยานแม่สอด",
  },
  "นครพนม (KOP)": {
    code: "KOP",
    icao: "VTUW",
    provinceTh: "นครพนม",
    provinceEn: "Nakhon Phanom",
    nameEn: "Nakhon Phanom",
    nameTh: "นครพนม",
    fullNameTh: "จังหวัดนครพนม (ท่าอากาศยานนครพนม)",
    fullNameEn: "Nakhon Phanom (Nakhon Phanom Airport)",
    airportEn: "Nakhon Phanom Airport",
    airportTh: "ท่าอากาศยานนครพนม",
  },
  "นครศรีธรรมราช (NST)": {
    code: "NST",
    icao: "VTSF",
    provinceTh: "นครศรีธรรมราช",
    provinceEn: "Nakhon Si Thammarat",
    nameEn: "Nakhon Si Thammarat",
    nameTh: "นครศรีธรรมราช",
    fullNameTh: "จังหวัดนครศรีธรรมราช (ท่าอากาศยานนครศรีธรรมราช)",
    fullNameEn: "Nakhon Si Thammarat (Nakhon Si Thammarat Airport)",
    airportEn: "Nakhon Si Thammarat Airport",
    airportTh: "ท่าอากาศยานนครศรีธรรมราช",
  },
  "นราธิวาส (NAW)": {
    code: "NAW",
    icao: "VTSC",
    provinceTh: "นราธิวาส",
    provinceEn: "Narathiwat",
    nameEn: "Narathiwat",
    nameTh: "นราธิวาส",
    fullNameTh: "จังหวัดนราธิวาส (ท่าอากาศยานนราธิวาส)",
    fullNameEn: "Narathiwat (Narathiwat Airport)",
    airportEn: "Narathiwat Airport",
    airportTh: "ท่าอากาศยานนราธิวาส",
  },
  "น่านนคร (NNT)": {
    code: "NNT",
    icao: "VTCN",
    provinceTh: "น่าน",
    provinceEn: "Nan",
    nameEn: "Nan",
    nameTh: "น่าน",
    fullNameTh: "จังหวัดน่าน (ท่าอากาศยานน่านนคร)",
    fullNameEn: "Nan (Nan Nakhon Airport)",
    airportEn: "Nan Nakhon Airport",
    airportTh: "ท่าอากาศยานน่านนคร",
  },
  "บุรีรัมย์ (BFV)": {
    code: "BFV",
    icao: "VTUO",
    provinceTh: "บุรีรัมย์",
    provinceEn: "Buriram",
    nameEn: "Buriram",
    nameTh: "บุรีรัมย์",
    fullNameTh: "จังหวัดบุรีรัมย์ (ท่าอากาศยานบุรีรัมย์)",
    fullNameEn: "Buriram (Buriram Airport)",
    airportEn: "Buriram Airport",
    airportTh: "ท่าอากาศยานบุรีรัมย์",
  },
  "หัวหิน (HHQ)": {
    code: "HHQ",
    icao: "VTPH",
    provinceTh: "ประจวบคีรีขันธ์",
    provinceEn: "Prachuap Khiri Khan",
    nameEn: "Hua Hin (Prachuap Khiri Khan)",
    nameTh: "หัวหิน (ประจวบคีรีขันธ์)",
    fullNameTh: "จังหวัดประจวบคีรีขันธ์ (ท่าอากาศยานหัวหิน)",
    fullNameEn: "Prachuap Khiri Khan (Hua Hin Airport)",
    airportEn: "Hua Hin Airport",
    airportTh: "ท่าอากาศยานหัวหิน",
  },
  "พิษณุโลก (PHS)": {
    code: "PHS",
    icao: "VTPP",
    provinceTh: "พิษณุโลก",
    provinceEn: "Phitsanulok",
    nameEn: "Phitsanulok",
    nameTh: "พิษณุโลก",
    fullNameTh: "จังหวัดพิษณุโลก (ท่าอากาศยานพิษณุโลก)",
    fullNameEn: "Phitsanulok (Phitsanulok Airport)",
    airportEn: "Phitsanulok Airport",
    airportTh: "ท่าอากาศยานพิษณุโลก",
  },
  "เบตง (BTZ)": {
    code: "BTZ",
    icao: "VTSY",
    provinceTh: "ยะลา",
    provinceEn: "Yala",
    nameEn: "Betong (Yala)",
    nameTh: "เบตง (ยะลา)",
    fullNameTh: "จังหวัดยะลา (ท่าอากาศยานเบตง)",
    fullNameEn: "Yala (Betong Airport)",
    airportEn: "Betong Airport",
    airportTh: "ท่าอากาศยานเบตง",
  },
  "ร้อยเอ็ด (ROI)": {
    code: "ROI",
    icao: "VTUV",
    provinceTh: "ร้อยเอ็ด",
    provinceEn: "Roi Et",
    nameEn: "Roi Et",
    nameTh: "ร้อยเอ็ด",
    fullNameTh: "จังหวัดร้อยเอ็ด (ท่าอากาศยานร้อยเอ็ด)",
    fullNameEn: "Roi Et (Roi Et Airport)",
    airportEn: "Roi Et Airport",
    airportTh: "ท่าอากาศยานร้อยเอ็ด",
  },
  "ระนอง (UNN)": {
    code: "UNN",
    icao: "VTSR",
    provinceTh: "ระนอง",
    provinceEn: "Ranong",
    nameEn: "Ranong",
    nameTh: "ระนอง",
    fullNameTh: "จังหวัดระนอง (ท่าอากาศยานระนอง)",
    fullNameEn: "Ranong (Ranong Airport)",
    airportEn: "Ranong Airport",
    airportTh: "ท่าอากาศยานระนอง",
  },
  "เลย (LOE)": {
    code: "LOE",
    icao: "VTUL",
    provinceTh: "เลย",
    provinceEn: "Loei",
    nameEn: "Loei",
    nameTh: "เลย",
    fullNameTh: "จังหวัดเลย (ท่าอากาศยานเลย)",
    fullNameEn: "Loei (Loei Airport)",
    airportEn: "Loei Airport",
    airportTh: "ท่าอากาศยานเลย",
  },
  "ลำปาง (LPT)": {
    code: "LPT",
    icao: "VTCL",
    provinceTh: "ลำปาง",
    provinceEn: "Lampang",
    nameEn: "Lampang",
    nameTh: "ลำปาง",
    fullNameTh: "จังหวัดลำปาง (ท่าอากาศยานลำปาง)",
    fullNameEn: "Lampang (Lampang Airport)",
    airportEn: "Lampang Airport",
    airportTh: "ท่าอากาศยานลำปาง",
  },
  "สกลนคร (SNO)": {
    code: "SNO",
    icao: "VTUI",
    provinceTh: "สกลนคร",
    provinceEn: "Sakon Nakhon",
    nameEn: "Sakon Nakhon",
    nameTh: "สกลนคร",
    fullNameTh: "จังหวัดสกลนคร (ท่าอากาศยานสกลนคร)",
    fullNameEn: "Sakon Nakhon (Sakon Nakhon Airport)",
    airportEn: "Sakon Nakhon Airport",
    airportTh: "ท่าอากาศยานสกลนคร",
  },
  "สุราษฎร์ธานี (URT)": {
    code: "URT",
    icao: "VTSB",
    provinceTh: "สุราษฎร์ธานี",
    provinceEn: "Surat Thani",
    nameEn: "Surat Thani",
    nameTh: "สุราษฎร์ธานี",
    fullNameTh: "จังหวัดสุราษฎร์ธานี (ท่าอากาศยานสุราษฎร์ธานี)",
    fullNameEn: "Surat Thani (Surat Thani Airport)",
    airportEn: "Surat Thani Airport",
    airportTh: "ท่าอากาศยานสุราษฎร์ธานี",
  },
  "อุดรธานี (UTH)": {
    code: "UTH",
    icao: "VTUD",
    provinceTh: "อุดรธานี",
    provinceEn: "Udon Thani",
    nameEn: "Udon Thani",
    nameTh: "อุดรธานี",
    fullNameTh: "จังหวัดอุดรธานี (ท่าอากาศยานนานาชาติอุดรธานี)",
    fullNameEn: "Udon Thani (Udon Thani International Airport)",
    airportEn: "Udon Thani International Airport",
    airportTh: "ท่าอากาศยานอุดรธานี",
  },
  "อุบลราชธานี (UBP)": {
    code: "UBP",
    icao: "VTUU",
    provinceTh: "อุบลราชธานี",
    provinceEn: "Ubon Ratchathani",
    nameEn: "Ubon Ratchathani",
    nameTh: "อุบลราชธานี",
    fullNameTh: "จังหวัดอุบลราชธานี (ท่าอากาศยานนานาชาติอุบลราชธานี)",
    fullNameEn: "Ubon Ratchathani (Ubon Ratchathani Airport)",
    airportEn: "Ubon Ratchathani Airport",
    airportTh: "ท่าอากาศยานอุบลราชธานี",
  },
  "ตราด (TDX)": {
    code: "TDX",
    icao: "VTBO",
    provinceTh: "ตราด",
    provinceEn: "Trat",
    nameEn: "Trat",
    nameTh: "ตราด",
    fullNameTh: "จังหวัดตราด (ท่าอากาศยานตราด)",
    fullNameEn: "Trat (Trat Airport)",
    airportEn: "Trat Airport",
    airportTh: "ท่าอากาศยานตราด",
  },
  "อู่ตะเภา (UTP)": {
    code: "UTP",
    icao: "VTBU",
    provinceTh: "ระยอง",
    provinceEn: "Rayong",
    nameEn: "U-Tapao (Rayong)",
    nameTh: "อู่ตะเภา (ระยอง)",
    fullNameTh: "จังหวัดระยอง (ท่าอากาศยานนานาชาติอู่ตะเภา ระยอง-พัทยา)",
    fullNameEn: "Rayong (U-Tapao International Airport)",
    airportEn: "U-Tapao International Airport",
    airportTh: "ท่าอากาศยานอู่ตะเภา",
  },
  "สมุย (USM)": {
    code: "USM",
    icao: "VTSM",
    provinceTh: "สุราษฎร์ธานี",
    provinceEn: "Surat Thani",
    nameEn: "Samui (Surat Thani)",
    nameTh: "สมุย (สุราษฎร์ธานี)",
    fullNameTh: "จังหวัดสุราษฎร์ธานี (ท่าอากาศยานนานาชาติสมุย)",
    fullNameEn: "Surat Thani (Samui International Airport)",
    airportEn: "Samui International Airport",
    airportTh: "ท่าอากาศยานสมุย",
  },
  "สุโขทัย (THS)": {
    code: "THS",
    icao: "VTPO",
    provinceTh: "สุโขทัย",
    provinceEn: "Sukhothai",
    nameEn: "Sukhothai",
    nameTh: "สุโขทัย",
    fullNameTh: "จังหวัดสุโขทัย (ท่าอากาศยานสุโขทัย)",
    fullNameEn: "Sukhothai (Sukhothai Airport)",
    airportEn: "Sukhothai Airport",
    airportTh: "ท่าอากาศยานสุโขทัย",
  },
};

/**
 * Full CITIES_CONFIG with legacy alias compatibility mappings
 */
export const CITIES_CONFIG: Record<string, CityMeta> = {
  ...PRIMARY_CITIES_CONFIG,
  // Backward compatibility aliases for province-first and legacy string keys
  "สมุทรปราการ (BKK)": PRIMARY_CITIES_CONFIG["สุวรรณภูมิ (BKK)"],
  "กรุงเทพมหานคร (DMK)": PRIMARY_CITIES_CONFIG["ดอนเมือง (DMK)"],
  "กรุงเทพฯ (DMK)": PRIMARY_CITIES_CONFIG["ดอนเมือง (DMK)"],
  "กรุงเทพฯ (BKK)": PRIMARY_CITIES_CONFIG["สุวรรณภูมิ (BKK)"],
  "สงขลา (HDY)": PRIMARY_CITIES_CONFIG["หาดใหญ่ (HDY)"],
  "สุราษฎร์ธานี (USM)": PRIMARY_CITIES_CONFIG["สมุย (USM)"],
  "สุราษฎร์ธานี - สมุย (USM)": PRIMARY_CITIES_CONFIG["สมุย (USM)"],
  "ระยอง (UTP)": PRIMARY_CITIES_CONFIG["อู่ตะเภา (UTP)"],
  "ตาก (MAQ)": PRIMARY_CITIES_CONFIG["แม่สอด (MAQ)"],
  "ประจวบคีรีขันธ์ (HHQ)": PRIMARY_CITIES_CONFIG["หัวหิน (HHQ)"],
  "ยะลา (BTZ)": PRIMARY_CITIES_CONFIG["เบตง (BTZ)"],
  "น่าน (NNT)": PRIMARY_CITIES_CONFIG["น่านนคร (NNT)"],
};

/**
 * Ordered list of 31 cities according to sheet "รายชื่อสนามบิน - ชีต1"
 */
export const CITIES = Object.keys(PRIMARY_CITIES_CONFIG);

/**
 * Direct route connectivity matrix according to "รายชื่อสนามบิน - ชีต1"
 * Mapping: Origin Airport Code -> Array of Allowed Destination Airport Codes
 */
export const FLIGHT_ROUTES_MAP: Record<string, string[]> = {
  BKK: ["CNX", "CEI", "HKT", "HDY", "KBV", "KKC", "NST", "NAW", "BFV", "LPT", "URT", "UTH", "UBP", "TDX", "USM", "THS"],
  DMK: ["CNX", "CEI", "HKT", "HDY", "KBV", "KKC", "CJM", "TST", "MAQ", "KOP", "NST", "NAW", "NNT", "BFV", "PHS", "ROI", "UNN", "LOE", "LPT", "SNO", "URT", "UTH", "UBP", "USM"],
  CNX: ["BKK", "DMK", "HKT", "KBV", "KKC", "HHQ", "URT", "UTH", "UTP", "USM"],
  CEI: ["BKK", "DMK", "HKT"],
  HKT: ["BKK", "DMK", "CNX", "CEI", "HDY", "UTH", "UTP", "USM"],
  HDY: ["BKK", "DMK", "CNX", "HKT", "BTZ", "UTH"],
  KBV: ["BKK", "DMK", "CNX", "USM"],
  KKC: ["BKK", "DMK", "CNX"],
  CJM: ["DMK"],
  TST: ["DMK"],
  MAQ: ["DMK"],
  KOP: ["DMK"],
  NST: ["BKK", "DMK"],
  NAW: ["BKK", "DMK"],
  NNT: ["DMK"],
  BFV: ["BKK", "DMK"],
  HHQ: ["CNX"],
  PHS: ["DMK"],
  BTZ: ["HDY"],
  ROI: ["DMK"],
  UNN: ["DMK"],
  LOE: ["DMK"],
  LPT: ["BKK", "DMK"],
  SNO: ["DMK"],
  URT: ["BKK", "DMK", "CNX"],
  UTH: ["BKK", "DMK", "CNX", "HKT", "HDY", "UTP"],
  UBP: ["BKK", "DMK"],
  TDX: ["BKK"],
  UTP: ["CNX", "HKT", "UTH", "USM"],
  USM: ["BKK", "DMK", "CNX", "HKT", "KBV", "UTP"],
  THS: ["BKK"],
};

export const MULTI_LANG_CITIES: Record<string, { th: string; en: string }> = Object.values(PRIMARY_CITIES_CONFIG).reduce(
  (acc, meta) => {
    acc[meta.code] = {
      th: meta.nameTh,
      en: meta.nameEn,
    };
    return acc;
  },
  {} as Record<string, { th: string; en: string }>
);

/**
 * Extract airport code from any city string or code
 */
export function getAirportCode(cityStrOrCode: string): string {
  if (!cityStrOrCode) return "DMK";
  const trimmed = cityStrOrCode.trim();
  if (FLIGHT_ROUTES_MAP[trimmed.toUpperCase()]) {
    return trimmed.toUpperCase();
  }
  const match = trimmed.match(/\b([A-Z]{3})\b/);
  if (match && FLIGHT_ROUTES_MAP[match[1]]) {
    return match[1];
  }
  const meta = CITIES_CONFIG[trimmed];
  if (meta) return meta.code;
  for (const [, val] of Object.entries(CITIES_CONFIG)) {
    if (trimmed.includes(val.code) || trimmed.includes(val.provinceTh) || trimmed.includes(val.nameTh) || trimmed.includes(val.airportTh)) {
      return val.code;
    }
  }
  return "DMK";
}

/**
 * Find the primary city key in CITIES for a given code or string
 */
export function getCityKeyByCode(codeOrStr: string): string {
  const code = getAirportCode(codeOrStr);
  const found = CITIES.find(c => PRIMARY_CITIES_CONFIG[c]?.code === code);
  return found || CITIES[1] || "ดอนเมือง (DMK)";
}

/**
 * Get available destination city keys from a given origin city/code
 */
export function getAvailableDestinations(originCityOrCode: string): string[] {
  const originCode = getAirportCode(originCityOrCode);
  const destCodes = FLIGHT_ROUTES_MAP[originCode] || [];
  return CITIES.filter(c => {
    const meta = PRIMARY_CITIES_CONFIG[c];
    return meta && destCodes.includes(meta.code);
  });
}

/**
 * Check if a direct flight route is available between origin and destination
 */
export function isRouteAvailable(originCityOrCode: string, destCityOrCode: string): boolean {
  const oCode = getAirportCode(originCityOrCode);
  const dCode = getAirportCode(destCityOrCode);
  const allowed = FLIGHT_ROUTES_MAP[oCode] || [];
  return allowed.includes(dCode);
}

/**
 * Get available origin city keys that have at least one route
 */
export function getAvailableOrigins(): string[] {
  return CITIES.filter(c => {
    const meta = PRIMARY_CITIES_CONFIG[c];
    return meta && (FLIGHT_ROUTES_MAP[meta.code] || []).length > 0;
  });
}

export function getCityDetails(cityStr: string, language: string = "en") {
  let meta = CITIES_CONFIG[cityStr];
  let code = meta?.code;

  if (!meta && cityStr) {
    const codeExtracted = getAirportCode(cityStr);
    code = codeExtracted;
    for (const key of Object.keys(CITIES_CONFIG)) {
      if (CITIES_CONFIG[key].code === code) {
        meta = CITIES_CONFIG[key];
        break;
      }
    }
  }

  code = code || meta?.code || "DMK";
  const rawName = meta ? (language === "th" ? meta.nameTh : meta.nameEn) : (cityStr || "Don Mueang (Bangkok)");
  const multi = MULTI_LANG_CITIES[code];
  const localizedName = language === "th"
    ? (multi?.th || meta?.nameTh || rawName)
    : (multi?.en || meta?.nameEn || rawName);

  if (meta) {
    return {
      code: meta.code,
      icao: meta.icao,
      province: language === "th" ? meta.provinceTh : meta.provinceEn,
      cityName: localizedName,
      fullName: language === "th" ? meta.fullNameTh : meta.fullNameEn,
      airportName: language === "th" ? meta.airportTh : meta.airportEn,
    };
  }

  return {
    code,
    icao: "",
    province: localizedName,
    cityName: localizedName,
    fullName: localizedName,
    airportName: `${localizedName} Airport`,
  };
}

export function getCityFullName(cityStr: string, language: string = "en") {
  if (!cityStr) return "";
  const meta = CITIES_CONFIG[cityStr];
  if (meta) {
    return language === "th" ? meta.fullNameTh : meta.fullNameEn;
  }
  for (const [, val] of Object.entries(CITIES_CONFIG)) {
    if (cityStr.includes(val.code) || cityStr.includes(val.nameTh) || cityStr.includes(val.nameEn) || cityStr.includes(val.provinceTh)) {
      return language === "th" ? val.fullNameTh : val.fullNameEn;
    }
  }
  const details = getCityDetails(cityStr, language);
  return details.fullName || details.cityName || cityStr;
}

export const getPromoDiscountRate = (code?: string): number => {
  const upper = (code || "").trim().toUpperCase();
  if (["SKYPROMO2026", "SKYPROMO", "SKY15", "BOTNOI15"].includes(upper)) return 0.15;
  if (["PROMO2026", "PROMO", "BOTNOI20"].includes(upper)) return 0.20;
  return 0;
};
