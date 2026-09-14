export interface AirportLocation {
  code: string;
  nameTh: string;
  nameEn: string;
  lat: number;
  lon: number;
  defaultTemp: number;
  defaultApparent: number;
}

export const AIRPORT_COORDINATES: Record<string, AirportLocation> = {
  BKK: { code: "BKK", nameTh: "สมุทรปราการ (สุวรรณภูมิ)", nameEn: "Bangkok (Suvarnabhumi)", lat: 13.6900, lon: 100.7501, defaultTemp: 32, defaultApparent: 37 },
  DMK: { code: "DMK", nameTh: "กรุงเทพมหานคร (ดอนเมือง)", nameEn: "Bangkok (Don Mueang)", lat: 13.9126, lon: 100.6068, defaultTemp: 32, defaultApparent: 36 },
  CNX: { code: "CNX", nameTh: "เชียงใหม่", nameEn: "Chiang Mai (CNX)", lat: 18.7677, lon: 98.9626, defaultTemp: 28, defaultApparent: 31 },
  CEI: { code: "CEI", nameTh: "เชียงราย", nameEn: "Chiang Rai (CEI)", lat: 19.9523, lon: 99.8829, defaultTemp: 27, defaultApparent: 29 },
  HKT: { code: "HKT", nameTh: "ภูเก็ต", nameEn: "Phuket (HKT)", lat: 8.1132, lon: 98.3169, defaultTemp: 30, defaultApparent: 35 },
  HDY: { code: "HDY", nameTh: "สงขลา (หาดใหญ่)", nameEn: "Hat Yai (HDY)", lat: 6.9397, lon: 100.3931, defaultTemp: 29, defaultApparent: 34 },
  KBV: { code: "KBV", nameTh: "กระบี่", nameEn: "Krabi (KBV)", lat: 8.0989, lon: 98.9862, defaultTemp: 30, defaultApparent: 35 },
  KKC: { code: "KKC", nameTh: "ขอนแก่น", nameEn: "Khon Kaen (KKC)", lat: 16.4665, lon: 102.7839, defaultTemp: 31, defaultApparent: 35 },
  CJM: { code: "CJM", nameTh: "ชุมพร", nameEn: "Chumphon (CJM)", lat: 10.7118, lon: 99.3615, defaultTemp: 29, defaultApparent: 34 },
  TST: { code: "TST", nameTh: "ตรัง", nameEn: "Trang (TST)", lat: 7.5097, lon: 99.6164, defaultTemp: 29, defaultApparent: 34 },
  MAQ: { code: "MAQ", nameTh: "ตาก (แม่สอด)", nameEn: "Mae Sot (MAQ)", lat: 16.7003, lon: 98.5447, defaultTemp: 29, defaultApparent: 33 },
  KOP: { code: "KOP", nameTh: "นครพนม", nameEn: "Nakhon Phanom (KOP)", lat: 17.3837, lon: 104.6439, defaultTemp: 30, defaultApparent: 35 },
  NST: { code: "NST", nameTh: "นครศรีธรรมราช", nameEn: "Nakhon Si Thammarat (NST)", lat: 8.5397, lon: 99.9436, defaultTemp: 29, defaultApparent: 34 },
  NAW: { code: "NAW", nameTh: "นราธิวาส", nameEn: "Narathiwat (NAW)", lat: 6.5199, lon: 101.7431, defaultTemp: 29, defaultApparent: 34 },
  NNT: { code: "NNT", nameTh: "น่าน", nameEn: "Nan (NNT)", lat: 18.8080, lon: 100.7830, defaultTemp: 28, defaultApparent: 30 },
  BFV: { code: "BFV", nameTh: "บุรีรัมย์", nameEn: "Buriram (BFV)", lat: 15.2285, lon: 103.2530, defaultTemp: 31, defaultApparent: 35 },
  HHQ: { code: "HHQ", nameTh: "ประจวบคีรีขันธ์ (หัวหิน)", nameEn: "Hua Hin (HHQ)", lat: 12.6364, lon: 99.9515, defaultTemp: 30, defaultApparent: 34 },
  PHS: { code: "PHS", nameTh: "พิษณุโลก", nameEn: "Phitsanulok (PHS)", lat: 16.7828, lon: 100.2797, defaultTemp: 30, defaultApparent: 34 },
  BTZ: { code: "BTZ", nameTh: "ยะลา (เบตง)", nameEn: "Betong (BTZ)", lat: 5.7891, lon: 101.1444, defaultTemp: 28, defaultApparent: 32 },
  ROI: { code: "ROI", nameTh: "ร้อยเอ็ด", nameEn: "Roi Et (ROI)", lat: 16.1165, lon: 103.7744, defaultTemp: 31, defaultApparent: 35 },
  UNN: { code: "UNN", nameTh: "ระนอง", nameEn: "Ranong (UNN)", lat: 9.7779, lon: 98.5852, defaultTemp: 29, defaultApparent: 34 },
  LOE: { code: "LOE", nameTh: "เลย", nameEn: "Loei (LOE)", lat: 17.4422, lon: 101.7224, defaultTemp: 28, defaultApparent: 31 },
  LPT: { code: "LPT", nameTh: "ลำปาง", nameEn: "Lampang (LPT)", lat: 18.2711, lon: 99.5053, defaultTemp: 28, defaultApparent: 30 },
  SNO: { code: "SNO", nameTh: "สกลนคร", nameEn: "Sakon Nakhon (SNO)", lat: 17.1953, lon: 104.1186, defaultTemp: 30, defaultApparent: 34 },
  URT: { code: "URT", nameTh: "สุราษฎร์ธานี", nameEn: "Surat Thani (URT)", lat: 9.1326, lon: 99.1356, defaultTemp: 30, defaultApparent: 35 },
  UTH: { code: "UTH", nameTh: "อุดรธานี", nameEn: "Udon Thani (UTH)", lat: 17.3867, lon: 102.7881, defaultTemp: 31, defaultApparent: 34 },
  UBP: { code: "UBP", nameTh: "อุบลราชธานี", nameEn: "Ubon Ratchathani (UBP)", lat: 15.2514, lon: 104.8703, defaultTemp: 31, defaultApparent: 35 },
  TDX: { code: "TDX", nameTh: "ตราด", nameEn: "Trat (TDX)", lat: 12.2743, lon: 102.3195, defaultTemp: 30, defaultApparent: 35 },
  UTP: { code: "UTP", nameTh: "ระยอง (อู่ตะเภา)", nameEn: "U-Tapao (UTP)", lat: 12.6799, lon: 101.0050, defaultTemp: 31, defaultApparent: 36 },
  USM: { code: "USM", nameTh: "สุราษฎร์ธานี (สมุย)", nameEn: "Koh Samui (USM)", lat: 9.5484, lon: 100.0622, defaultTemp: 29, defaultApparent: 34 },
  THS: { code: "THS", nameTh: "สุโขทัย", nameEn: "Sukhothai (THS)", lat: 17.2372, lon: 99.8188, defaultTemp: 30, defaultApparent: 34 },
};

export type WeatherIconType = "sun" | "cloud-sun" | "cloud" | "rain" | "drizzle" | "thunder" | "fog";

export interface DestinationWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  humidity?: number;
  conditionTextTh: string;
  conditionTextEn: string;
  iconType: WeatherIconType;
  cityCode: string;
  cityName: string;
  isLive: boolean;
  lastUpdated?: string;
}

export function interpretWeatherCode(code: number): {
  th: string;
  en: string;
  icon: WeatherIconType;
} {
  if (code === 0) {
    return { th: "ท้องฟ้าแจ่มใส", en: "Clear Sky", icon: "sun" };
  }
  if (code === 1 || code === 2) {
    return { th: "มีเมฆบางส่วน", en: "Partly Cloudy", icon: "cloud-sun" };
  }
  if (code === 3) {
    return { th: "มีเมฆมาก", en: "Overcast", icon: "cloud" };
  }
  if (code === 45 || code === 48) {
    return { th: "มีหมอก", en: "Foggy", icon: "fog" };
  }
  if (code >= 51 && code <= 57) {
    return { th: "ฝนตกปรอยๆ", en: "Drizzle", icon: "drizzle" };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { th: "มีฝนตก", en: "Rain", icon: "rain" };
  }
  if (code >= 95 && code <= 99) {
    return { th: "ฝนฟ้าคะนอง", en: "Thunderstorm", icon: "thunder" };
  }
  return { th: "สภาพอากาศปกติ", en: "Moderate", icon: "cloud-sun" };
}

export function getWeatherConditionText(code: number, lang: string = "en"): string {
  const dict: Record<string, Record<string, string>> = {
    clear: { th: "ท้องฟ้าแจ่มใส", en: "Clear Sky", zh: "晴朗", ja: "快晴", ko: "맑음", es: "Cielo despejado", fr: "Ciel dégagé" },
    partly_cloudy: { th: "มีเมฆบางส่วน", en: "Partly Cloudy", zh: "多云", ja: "晴れ時々曇り", ko: "구름 조금", es: "Parcialmente nublado", fr: "Partiellement nuageux" },
    overcast: { th: "มีเมฆมาก", en: "Overcast", zh: "阴天", ja: "曇り", ko: "흐림", es: "Nublado", fr: "Couvert" },
    fog: { th: "มีหมอก", en: "Foggy", zh: "有雾", ja: "霧", ko: "안개", es: "Niebla", fr: "Brouillard" },
    drizzle: { th: "ฝนตกปรอยๆ", en: "Drizzle", zh: "毛毛雨", ja: "霧雨", ko: "이슬비", es: "Llovizna", fr: "Bruine" },
    rain: { th: "มีฝนตก", en: "Rain", zh: "有雨", ja: "雨", ko: "비", es: "Lluvia", fr: "Pluie" },
    thunder: { th: "ฝนฟ้าคะนอง", en: "Thunderstorm", zh: "雷阵雨", ja: "雷雨", ko: "뇌우", es: "Tormenta", fr: "Orage" },
    moderate: { th: "สภาพอากาศปกติ", en: "Moderate", zh: "适中", ja: "穏やか", ko: "보통", es: "Moderado", fr: "Modéré" },
  };

  let key = "moderate";
  if (code === 0) key = "clear";
  else if (code === 1 || code === 2) key = "partly_cloudy";
  else if (code === 3) key = "overcast";
  else if (code === 45 || code === 48) key = "fog";
  else if (code >= 51 && code <= 57) key = "drizzle";
  else if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) key = "rain";
  else if (code >= 95 && code <= 99) key = "thunder";

  const entry = dict[key] || dict.moderate;
  return entry[lang] || entry.en || entry.th;
}

// In-memory cache to avoid duplicate API calls
const weatherCache = new Map<string, { data: DestinationWeather; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export async function fetchLiveDestinationWeather(destCode: string): Promise<DestinationWeather> {
  const code = (destCode || "CNX").toUpperCase();
  const location = AIRPORT_COORDINATES[code] || AIRPORT_COORDINATES["CNX"];

  // Check cache
  const cached = weatherCache.get(code);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m&timezone=Asia%2FBangkok`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather API returned ${res.status}`);
    }
    const json = await res.json();
    const current = json.current;

    const weatherInfo = interpretWeatherCode(current.weather_code);
    const result: DestinationWeather = {
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature),
      weatherCode: current.weather_code,
      humidity: current.relative_humidity_2m,
      conditionTextTh: weatherInfo.th,
      conditionTextEn: weatherInfo.en,
      iconType: weatherInfo.icon,
      cityCode: location.code,
      cityName: location.nameTh,
      isLive: true,
      lastUpdated: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    };

    weatherCache.set(code, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn(`[Weather] Failed to fetch live weather for ${code}, falling back to defaults:`, err);
    const weatherInfo = interpretWeatherCode(1);
    const fallback: DestinationWeather = {
      temperature: location.defaultTemp,
      apparentTemperature: location.defaultApparent,
      weatherCode: 1,
      humidity: 65,
      conditionTextTh: weatherInfo.th,
      conditionTextEn: weatherInfo.en,
      iconType: weatherInfo.icon,
      cityCode: location.code,
      cityName: location.nameTh,
      isLive: false,
    };
    return fallback;
  }
}
