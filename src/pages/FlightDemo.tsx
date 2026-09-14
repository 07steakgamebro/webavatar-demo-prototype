import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { useTranslation } from "@/lib/LanguageContext";
import { formatDate, getLocaleTag, formatFlightDuration } from "@/lib/dateUtils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Plane, ChevronDown, Check,
  ArrowLeft, Ticket, ChevronRight, Home,
  ArrowLeftRight, Search, X
} from "lucide-react";
import {
  saveBooking,
  getBookings,
  getLockedSeats,
  getAircraftCabinType,
  type CabinType,
  MOCK_FLEET,
  type Booking,
} from "@/lib/bookings";
import { toast, Toaster } from "sonner";
import PageSkeleton from "@/components/PageSkeleton";
import botnoiAirLogo from "../assets/BOTNOI-AIR-logo.png";
import flightHeroRunway from "../assets/flight-hero-runway.jpg";
import promoChiangmai from "../assets/promo-chiangmai.jpg";
import promoPhuket from "../assets/promo-phuket.jpg";
import promoHatyai from "../assets/promo-hatyai.jpg";

interface TypewriterHeadingProps {
  text: string;
  className?: string;
}

const TypewriterHeading: React.FC<TypewriterHeadingProps> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let i = 0;
    setDisplayText("");
    setIsTyping(true);
    let doneTimer: ReturnType<typeof setTimeout> | undefined;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        doneTimer = setTimeout(() => {
          setIsTyping(false);
        }, 1200);
      }
    }, 45);

    return () => {
      clearInterval(timer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [text, isInView]);

  return (
    <h2 ref={containerRef} className={className}>
      <span>{displayText}</span>
      <AnimatePresence>
        {isTyping && (
          <motion.span
            className="inline-block ml-0.5 text-primary font-normal select-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          >
            |
          </motion.span>
        )}
      </AnimatePresence>
    </h2>
  );
};
import {
  type CityMeta,
  CITIES_CONFIG,
  PRIMARY_CITIES_CONFIG,
  CITIES,
  FLIGHT_ROUTES_MAP,
  getAirportCode,
  getCityKeyByCode,
  getAvailableDestinations,
  isRouteAvailable,
  getAvailableOrigins,
  getCityDetails,
  getCityFullName,
  getPromoDiscountRate,
} from "@/lib/cities";

export {
  type CityMeta,
  CITIES_CONFIG,
  PRIMARY_CITIES_CONFIG,
  CITIES,
  FLIGHT_ROUTES_MAP,
  getAirportCode,
  getCityKeyByCode,
  getAvailableDestinations,
  isRouteAvailable,
  getAvailableOrigins,
  getCityDetails,
  getCityFullName,
  getPromoDiscountRate,
};

export function parseDateForCard(dateStr: string, fallbackDays = 0, language: string = 'en') {
  let target = dateStr;
  if (!target) {
    const d = new Date();
    d.setDate(d.getDate() + fallbackDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    target = `${y}-${m}-${day}`;
  }
  const d = new Date(target + "T00:00:00");
  const locale = getLocaleTag(language);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return {
      day: "02",
      month: now.toLocaleString(locale, { month: "long" }),
      weekday: now.toLocaleString(locale, { weekday: "long" }),
      year: "2026"
    };
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString(locale, { month: "long" });
  const weekday = d.toLocaleString(locale, { weekday: "long" });
  const year = String(d.getFullYear());
  return { day, month, weekday, year };
}

export function getCityLabelForLang(city: string, language: string) {
  if (!city) return "";
  const details = getCityDetails(city, language);
  return `${details.cityName} (${details.code})`;
}

export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextDayString(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


interface BookingForm {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  promoCode: string;
  passengerName: string;
  email: string;
  phone: string;
  seat: string;
}

export default function FlightDemo() {
  const { t, language } = useTranslation();
  const today = useMemo(() => getTodayString(), []);
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 500], [0, 150]);
  const getCityLabel = (city: string) => getCityLabelForLang(city, language);
  const getSameCityErrorText = (lang: string) => {
    switch (lang) {
      case 'th': return 'กรุณาเลือกเมืองต้นทางและปลายทางที่แตกต่างกัน';
      case 'zh': return '出发地和目的地不能相同';
      case 'ja': return '出発地と目的地は異なる都市を選択してください';
      case 'ko': return '출발지와 도착지는 서로 다른 도시를 선택해주세요';
      case 'es': return 'Por favor seleccione ciudades de origen y destino diferentes';
      case 'fr': return 'Veuillez sélectionner des villes d\'origine et de destination différentes';
      default: return 'Please select different origin and destination cities';
    }
  };
  const [isReady, setIsReady] = useState(false);
  const [tripType, setTripType] = useState<"round" | "oneway" | "multicity">("round");
  const [ticketBooking, setTicketBooking] = useState<any | null>(null);
  const [boardingPassOpen, setBoardingPassOpen] = useState(false);
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  const [seatMapActiveLegIndex, setSeatMapActiveLegIndex] = useState(0);
  const [legSeats, setLegSeats] = useState<Record<number, string>>({});

  const [fareType, setFareType] = useState<"regular" | "student">("regular");
  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);
  const [cabinDropdownOpen, setCabinDropdownOpen] = useState(false);
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [multiCitySearch, setMultiCitySearch] = useState("");

  // Multi-City States
  const [multiCityLegs, setMultiCityLegs] = useState<Array<{ id: string; from: string; to: string; date: string }>>([
    { id: "leg-1", from: "ดอนเมือง (DMK)", to: "เชียงใหม่ (CNX)", date: today },
    { id: "leg-2", from: "เชียงใหม่ (CNX)", to: "ภูเก็ต (HKT)", date: getNextDayString(today) },
  ]);
  const [activeLegIndex, setActiveLegIndex] = useState<number>(0);
  const [selectedMultiCityFlights, setSelectedMultiCityFlights] = useState<any[]>([]);
  const [openMultiCityPicker, setOpenMultiCityPicker] = useState<{ legIndex: number; type: "from" | "to" } | null>(null);

  const handleAddLeg = () => {
    if (multiCityLegs.length >= 4) {
      toast.info(language === "th" ? "เพิ่มเที่ยวบินได้สูงสุด 4 เที่ยวบิน" : "Maximum 4 flights allowed");
      return;
    }
    const lastLeg = multiCityLegs[multiCityLegs.length - 1];
    const newFrom = lastLeg.to;
    const allowedDests = getAvailableDestinations(newFrom);
    const newTo = allowedDests.find(c => c !== newFrom) || allowedDests[0] || "เชียงใหม่ (CNX)";
    const newDate = getNextDayString(lastLeg.date || today);

    setMultiCityLegs(prev => [
      ...prev,
      {
        id: `leg-${Date.now()}`,
        from: newFrom,
        to: newTo,
        date: newDate,
      }
    ]);
  };

  const handleRemoveLeg = (idx: number) => {
    if (multiCityLegs.length <= 2) {
      toast.info(language === "th" ? "การเดินทางหลายเมืองต้องมีอย่างน้อย 2 เที่ยวบิน" : "Multi-City requires at least 2 flights");
      return;
    }
    setMultiCityLegs(prev => prev.filter((_, i) => i !== idx));
    setOpenMultiCityPicker(null);
  };

  const handleUpdateLegCity = (legIndex: number, field: "from" | "to", newCity: string) => {
    setMultiCityLegs(prev => {
      const updated = [...prev];
      const oldTo = updated[legIndex].to;
      if (field === "from") {
        const allowedDests = getAvailableDestinations(newCity);
        const curTo = updated[legIndex].to;
        const validTo = allowedDests.includes(curTo) ? curTo : (allowedDests[0] || "");
        updated[legIndex] = { ...updated[legIndex], from: newCity, to: validTo };
      } else {
        updated[legIndex] = { ...updated[legIndex], to: newCity };
        if (legIndex + 1 < updated.length && updated[legIndex + 1].from === oldTo) {
          const nextAllowed = getAvailableDestinations(newCity);
          const nextCurTo = updated[legIndex + 1].to;
          const nextValidTo = nextAllowed.includes(nextCurTo) ? nextCurTo : (nextAllowed[0] || "");
          updated[legIndex + 1] = { ...updated[legIndex + 1], from: newCity, to: nextValidTo };
        }
      }
      return updated;
    });
    setOpenMultiCityPicker(null);
    setMultiCitySearch("");
  };

  const handleSwapLegCities = (legIndex: number) => {
    setMultiCityLegs(prev => {
      const updated = [...prev];
      const cur = updated[legIndex];
      if (isRouteAvailable(cur.to, cur.from)) {
        updated[legIndex] = { ...cur, from: cur.to, to: cur.from };
        toast.success(language === 'th' ? 'สลับเมืองต้นทางและปลายทางแล้ว' : 'Swapped cities!');
      } else {
        const allowed = getAvailableDestinations(cur.to);
        if (allowed.length > 0) {
          updated[legIndex] = { ...cur, from: cur.to, to: allowed[0] };
          toast.info(language === 'th' ? `สลับต้นทางเป็น ${getCityDetails(cur.to, language).cityName} แล้ว (เลือกปลายทางที่บินได้)` : `Swapped to ${getCityDetails(cur.to, language).cityName}`);
        } else {
          toast.error(language === 'th' ? `สนามบิน ${getCityDetails(cur.to, language).cityName} ไม่มีเส้นทางบินตรง` : `No direct routes from ${getCityDetails(cur.to, language).cityName}`);
        }
      }
      return updated;
    });
  };

  const handleUpdateLegDate = (legIndex: number, newDate: string) => {
    setMultiCityLegs(prev => {
      const updated = [...prev];
      updated[legIndex] = { ...updated[legIndex], date: newDate };
      for (let j = legIndex + 1; j < updated.length; j++) {
        if (updated[j].date < updated[j - 1].date) {
          updated[j] = { ...updated[j], date: updated[j - 1].date };
        }
      }
      return updated;
    });
  };

  const departDateInputRef = useRef<HTMLInputElement>(null);
  const returnDateInputRef = useRef<HTMLInputElement>(null);
  const passengerNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const seatFieldRef = useRef<HTMLDivElement>(null);
  const [passengerFormSubmitted, setPassengerFormSubmitted] = useState(false);

  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (!ref.current) return;
    try {
      if (typeof ref.current.showPicker === "function") {
        ref.current.showPicker();
        return;
      }
    } catch (e) {}
    try {
      ref.current.focus();
      ref.current.click();
    } catch (e) {}
  };

  const [form, setForm] = useState<BookingForm>({
    from: "ดอนเมือง (DMK)",
    to: "เชียงใหม่ (CNX)",
    departDate: today,
    returnDate: getNextDayString(today),
    passengers: 1,
    promoCode: "",
    passengerName: "",
    email: "",
    phone: "",
    seat: "",
  });

  // Flight Selection States
  const [bookingStep, setBookingStep] = useState<"search" | "select_flight" | "passenger_details">("search");
  const [isReturnSelection, setIsReturnSelection] = useState(false);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<any | null>(null);
  const [selectedInboundFlight, setSelectedInboundFlight] = useState<any | null>(null);
  const [expandedDetailsIndex, setExpandedDetailsIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"cheapest" | "best" | "quickest">("cheapest");

  // Advanced Filters States
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [selectedClass, setSelectedClass] = useState<"all" | "economy" | "business">("all");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const mockAirlines = useMemo(() => [
    { name: language === 'th' ? "บอทน้อยแอร์" : "Botnoi Air", code: "BTN", logoBg: "bg-sky-600", rating: 4.8 },
    { name: language === 'th' ? "การบินไทย" : "Thai Airways", code: "THA", logoBg: "bg-purple-800", rating: 4.7 },
    { name: language === 'th' ? "บางกอกแอร์เวย์ส" : "Bangkok Airways", code: "BKP", logoBg: "bg-sky-400", rating: 4.6 }
  ], [language]);

  const getMockFlights = (isReturn: boolean, customFrom?: string, customTo?: string) => {
    const toCity = customTo || (isReturn ? form.from : form.to);
    const fromCity = customFrom || (isReturn ? form.to : form.from);

    const fromCode = getAirportCode(fromCity);
    const toCode = getAirportCode(toCity);

    if (!isRouteAvailable(fromCity, toCity)) {
      return [];
    }

    // Look for matching aircraft in MOCK_FLEET
    const matchedFleet = MOCK_FLEET.filter((p) => p.originCode === fromCode && p.destCode === toCode);
    if (matchedFleet.length === 0) {
      return [];
    }
    const baseAircraft = matchedFleet[0];

    const basePrice = baseAircraft?.price || (toCity.includes("ภูเก็ต") || toCity.includes("หาดใหญ่") ? 990 : 890);
    const baseDepTime = baseAircraft?.depTime || (isReturn ? "07:00" : "06:15");
    const baseArrTime = baseAircraft?.arrTime || (isReturn ? "08:15" : "07:30");
    const baseDuration = baseAircraft?.durationStr || "1h 15m";

    const list = [
      {
        id: isReturn ? "ret-1" : customFrom ? `mc-${fromCity}-${toCity}-1` : "out-1",
        airline: mockAirlines[0], // Botnoi Air
        flightNo: baseAircraft?.flightNo || (isReturn ? "BTN901" : "BTN201"),
        departTime: baseDepTime,
        arrivalTime: baseArrTime,
        duration: baseDuration,
        price: basePrice,
        class: "economy",
        aircraft: {
          model: baseAircraft?.model || "Airbus A320-200",
          tailNumber: baseAircraft?.tailNumber || (isReturn ? "HS-BNB" : "HS-BNA"),
          type: baseAircraft?.type || "Narrow-body Jet",
        },
        timeOfDay: "morning",
        type: "cheapest",
        discount: language === 'th' ? 'ลด 15%' : `15% ${t('flight.off_tag')}`
      },
      {
        id: isReturn ? "ret-2" : customFrom ? `mc-${fromCity}-${toCity}-2` : "out-2",
        airline: mockAirlines[1], // Thai Airways
        flightNo: isReturn ? "THA304" : "THA302",
        departTime: isReturn ? "10:30" : "09:45",
        arrivalTime: isReturn ? "11:45" : "11:00",
        duration: baseDuration,
        price: Math.round(basePrice * 1.15),
        class: "economy",
        aircraft: {
          model: "Airbus A350-900",
          tailNumber: isReturn ? "HS-THD" : "HS-THB",
          type: "Wide-body Jet",
        },
        timeOfDay: "morning",
        type: "best",
        discount: "None"
      },
      {
        id: isReturn ? "ret-3" : customFrom ? `mc-${fromCity}-${toCity}-3` : "out-3",
        airline: mockAirlines[0], // Botnoi Air
        flightNo: isReturn ? "BTN903" : "BTN203",
        departTime: isReturn ? "13:15" : "13:30",
        arrivalTime: isReturn ? "14:30" : "14:45",
        duration: baseDuration,
        price: Math.round(basePrice * 0.9), // Promo
        class: "economy",
        aircraft: {
          model: "Airbus A321neo",
          tailNumber: isReturn ? "HS-BND" : "HS-BNC",
          type: "Narrow-body Jet",
        },
        timeOfDay: "afternoon",
        type: "cheapest",
        discount: language === 'th' ? 'ลด 20%' : `20% ${t('flight.off_tag')}`
      },
      {
        id: isReturn ? "ret-4" : customFrom ? `mc-${fromCity}-${toCity}-4` : "out-4",
        airline: mockAirlines[2], // Bangkok Airways
        flightNo: isReturn ? "BKP404" : "BKP402",
        departTime: isReturn ? "16:45" : "15:15",
        arrivalTime: isReturn ? "18:00" : "16:30",
        duration: baseDuration,
        price: Math.round(basePrice * 1.3),
        class: "business",
        aircraft: {
          model: "ATR 72-600",
          tailNumber: isReturn ? "HS-PGB" : "HS-PGA",
          type: "Regional Turboprop",
        },
        timeOfDay: "afternoon",
        type: "best",
        discount: "None"
      },
      {
        id: isReturn ? "ret-5" : customFrom ? `mc-${fromCity}-${toCity}-5` : "out-5",
        airline: mockAirlines[1], // Thai Airways
        flightNo: isReturn ? "THA308" : "THA306",
        departTime: isReturn ? "19:30" : "18:45",
        arrivalTime: isReturn ? "20:45" : "20:00",
        duration: baseDuration,
        price: Math.round(basePrice * 2.2), // Business Premium
        class: "business",
        aircraft: {
          model: "Boeing 777-300ER",
          tailNumber: isReturn ? "HS-TTB" : "HS-TTA",
          type: "Wide-body Jet",
        },
        timeOfDay: "evening",
        type: "quickest",
        discount: "None"
      },
      {
        id: isReturn ? "ret-6" : customFrom ? `mc-${fromCity}-${toCity}-6` : "out-6",
        airline: mockAirlines[2], // Bangkok Airways
        flightNo: isReturn ? "BKP408" : "BKP406",
        departTime: isReturn ? "21:30" : "21:00",
        arrivalTime: isReturn ? "22:45" : "22:15",
        duration: baseDuration,
        price: Math.round(basePrice * 1.1),
        class: "economy",
        aircraft: {
          model: "Airbus A320-200",
          tailNumber: isReturn ? "HS-PGD" : "HS-PGC",
          type: "Narrow-body Jet",
        },
        timeOfDay: "evening",
        type: "quickest",
        discount: language === 'th' ? 'ลด 10%' : `10% ${t('flight.off_tag')}`
      }
    ];

    let filtered = list;

    // Apply Price Filter
    filtered = filtered.filter(f => f.price <= maxPrice);

    // Apply Class Filter
    if (selectedClass !== "all") {
      filtered = filtered.filter(f => f.class === selectedClass);
    }

    // Apply Time of Day Filter
    if (selectedTimeOfDay.length > 0) {
      filtered = filtered.filter(f => selectedTimeOfDay.includes(f.timeOfDay));
    }

    // Apply Airline Filter
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => selectedAirlines.includes(f.airline.code));
    }

    if (activeFilter === "cheapest") {
      return [...filtered].sort((a, b) => a.price - b.price);
    } else if (activeFilter === "quickest") {
      return filtered;
    } else {
      return [...filtered].sort((a, b) => b.airline.rating - a.airline.rating);
    }
  };

  const handleSelectPromo = (fromCity: string, toCity: string) => {
    setForm((prev) => ({
      ...prev,
      from: fromCity,
      to: toCity,
    }));
    const fLabel = getCityLabelForLang(fromCity, language).split('(')[0].trim();
    const tLabel = getCityLabelForLang(toCity, language).split('(')[0].trim();
    toast.success(
      (t('flight.promo_selected') || "Selected route: {from} to {to}")
        .replace('{from}', fLabel)
        .replace('{to}', tLabel)
    );
    setSelectedOutboundFlight(null);
    setSelectedInboundFlight(null);
    setIsReturnSelection(false);
    setBookingStep("search");
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Show page skeleton until first paint completes
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsReady(true));
    try {
      const saved = window.localStorage.getItem("botnoi-air-last-booking");
      if (saved) {
        setTicketBooking(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load last booking:", e);
    }
    return () => cancelAnimationFrame(id);
  }, []);

  const allFlightLegs: SeatMapLegInfo[] = useMemo(() => {
    if (tripType === "multicity") {
      return multiCityLegs.map((leg, idx) => {
        const flight = selectedMultiCityFlights[idx];
        const routeFleet = MOCK_FLEET.filter(
          (p) => p.originCode === getAirportCode(leg.from) && p.destCode === getAirportCode(leg.to)
        );
        const routeAircraft = routeFleet.length > 0 ? (routeFleet[idx % routeFleet.length] || routeFleet[0]) : undefined;
        return {
          legIndex: idx,
          label: language === "th" ? `เที่ยวบินที่ ${idx + 1}` : `Flight ${idx + 1}`,
          from: leg.from,
          to: leg.to,
          departDate: leg.date,
          flightNo: flight?.flightNo || routeAircraft?.flightNo || `BTN20${idx + 1}`,
          aircraftModel: flight?.aircraft?.model || routeAircraft?.model || "Airbus A320-200",
          aircraftTail: flight?.aircraft?.tailNumber || routeAircraft?.tailNumber || "HS-BNA",
          cabinClass: flight?.class || (selectedClass !== "all" ? selectedClass : "economy"),
          departTime: flight?.departTime || routeAircraft?.depTime || "08:00",
          arrivalTime: flight?.arrivalTime || routeAircraft?.arrTime || "09:15",
          airlineName: flight?.airline?.name || routeAircraft?.airlineName || "Botnoi Air",
          airlineCode: flight?.airline?.code || routeAircraft?.airlineCode || "BTN",
          price: flight?.price || routeAircraft?.price || 890,
        };
      });
    } else if (tripType === "round") {
      const outFleet = MOCK_FLEET.filter(
        (p) => p.originCode === getAirportCode(form.from) && p.destCode === getAirportCode(form.to)
      );
      const inFleet = MOCK_FLEET.filter(
        (p) => p.originCode === getAirportCode(form.to) && p.destCode === getAirportCode(form.from)
      );
      const outAircraft = outFleet[0];
      const inAircraft = inFleet.length > 1 ? inFleet[1] : (inFleet[0] || undefined);
      return [
        {
          legIndex: 0,
          label: language === "th" ? "ขาไป (Outbound)" : "Outbound",
          from: form.from,
          to: form.to,
          departDate: form.departDate,
          flightNo: selectedOutboundFlight?.flightNo || outAircraft?.flightNo || "BTN201",
          aircraftModel: selectedOutboundFlight?.aircraft?.model || outAircraft?.model || "Airbus A320-200",
          aircraftTail: selectedOutboundFlight?.aircraft?.tailNumber || outAircraft?.tailNumber || "HS-BNA",
          cabinClass: selectedOutboundFlight?.class || (selectedClass !== "all" ? selectedClass : "economy"),
          departTime: selectedOutboundFlight?.departTime || outAircraft?.depTime || "08:00",
          arrivalTime: selectedOutboundFlight?.arrivalTime || outAircraft?.arrTime || "09:15",
          airlineName: selectedOutboundFlight?.airline?.name || outAircraft?.airlineName || "Botnoi Air",
          airlineCode: selectedOutboundFlight?.airline?.code || outAircraft?.airlineCode || "BTN",
          price: selectedOutboundFlight?.price || outAircraft?.price || 890,
        },
        {
          legIndex: 1,
          label: language === "th" ? "ขากลับ (Return)" : "Return",
          from: form.to,
          to: form.from,
          departDate: form.returnDate,
          flightNo: selectedInboundFlight?.flightNo || inAircraft?.flightNo || "BTN202",
          aircraftModel: selectedInboundFlight?.aircraft?.model || inAircraft?.model || "Airbus A350-900",
          aircraftTail: selectedInboundFlight?.aircraft?.tailNumber || inAircraft?.tailNumber || "HS-BNB",
          cabinClass: selectedInboundFlight?.class || (selectedClass !== "all" ? selectedClass : "economy"),
          departTime: selectedInboundFlight?.departTime || inAircraft?.depTime || "17:00",
          arrivalTime: selectedInboundFlight?.arrivalTime || inAircraft?.arrTime || "18:15",
          airlineName: selectedInboundFlight?.airline?.name || inAircraft?.airlineName || "Botnoi Air",
          airlineCode: selectedInboundFlight?.airline?.code || inAircraft?.airlineCode || "BTN",
          price: selectedInboundFlight?.price || inAircraft?.price || 890,
        },
      ];
    } else {
      const routeFleet = MOCK_FLEET.filter(
        (p) => p.originCode === getAirportCode(form.from) && p.destCode === getAirportCode(form.to)
      );
      const routeAircraft = routeFleet[0];
      return [
        {
          legIndex: 0,
          label: language === "th" ? "เที่ยวบินขาไป" : "Outbound",
          from: form.from,
          to: form.to,
          departDate: form.departDate,
          flightNo: selectedOutboundFlight?.flightNo || routeAircraft?.flightNo || "BTN201",
          aircraftModel: selectedOutboundFlight?.aircraft?.model || routeAircraft?.model || "Airbus A320-200",
          aircraftTail: selectedOutboundFlight?.aircraft?.tailNumber || routeAircraft?.tailNumber || "HS-BNA",
          cabinClass: selectedOutboundFlight?.class || (selectedClass !== "all" ? selectedClass : "economy"),
          departTime: selectedOutboundFlight?.departTime || routeAircraft?.depTime || "08:00",
          arrivalTime: selectedOutboundFlight?.arrivalTime || routeAircraft?.arrTime || "09:15",
          airlineName: selectedOutboundFlight?.airline?.name || routeAircraft?.airlineName || "Botnoi Air",
          airlineCode: selectedOutboundFlight?.airline?.code || routeAircraft?.airlineCode || "BTN",
          price: selectedOutboundFlight?.price || routeAircraft?.price || 890,
        },
      ];
    }
  }, [
    tripType,
    multiCityLegs,
    selectedMultiCityFlights,
    selectedOutboundFlight,
    selectedInboundFlight,
    form.from,
    form.to,
    form.departDate,
    form.returnDate,
    selectedClass,
    language,
  ]);

  const handleSaveLegSeats = (newLegSeats: Record<number, string>) => {
    setLegSeats(newLegSeats);
    if (allFlightLegs.length === 1) {
      setForm((prev) => ({ ...prev, seat: newLegSeats[0] || "" }));
    } else if (tripType === "round") {
      const outS = newLegSeats[0] || "";
      const inS = newLegSeats[1] || "";
      const formatted = [
        outS ? `${language === 'th' ? 'ขาไป' : 'Outbound'}: ${outS}` : "",
        inS ? `${language === 'th' ? 'ขากลับ' : 'Return'}: ${inS}` : "",
      ].filter(Boolean).join(" | ");
      setForm((prev) => ({ ...prev, seat: formatted || outS }));
    } else {
      const formatted = allFlightLegs
        .map((l, i) => {
          const s = newLegSeats[i];
          if (!s) return "";
          const fromCode = getAirportCode(l.from);
          const toCode = getAirportCode(l.to);
          return `${fromCode}→${toCode}: ${s}`;
        })
        .filter(Boolean)
        .join(" | ");
      setForm((prev) => ({ ...prev, seat: formatted || Object.values(newLegSeats).filter(Boolean).join(", ") }));
    }
  };

  // Synchronize and trim selected seats whenever passenger count (form.passengers) changes
  useEffect(() => {
    if (!form.passengers || form.passengers < 1) return;

    setLegSeats((prev) => {
      let updated = false;
      const nextLegSeats: Record<number, string> = {};

      Object.keys(prev).forEach((keyStr) => {
        const key = Number(keyStr);
        const seatStr = prev[key] || "";
        if (!seatStr) {
          nextLegSeats[key] = "";
          return;
        }
        const seats = seatStr.split(",").map((s) => s.trim()).filter(Boolean);
        if (seats.length > form.passengers) {
          updated = true;
          nextLegSeats[key] = seats.slice(0, form.passengers).join(", ");
        } else {
          nextLegSeats[key] = seatStr;
        }
      });

      if (updated) {
        if (allFlightLegs.length === 1) {
          setForm((f) => ({ ...f, seat: nextLegSeats[0] || "" }));
        } else if (tripType === "round") {
          const outS = nextLegSeats[0] || "";
          const inS = nextLegSeats[1] || "";
          const formatted = [
            outS ? `${language === 'th' ? 'ขาไป' : 'Outbound'}: ${outS}` : "",
            inS ? `${language === 'th' ? 'ขากลับ' : 'Return'}: ${inS}` : "",
          ].filter(Boolean).join(" | ");
          setForm((f) => ({ ...f, seat: formatted || outS }));
        } else {
          const formatted = allFlightLegs
            .map((l, i) => {
              const s = nextLegSeats[i];
              if (!s) return "";
              const fromCode = getAirportCode(l.from);
              const toCode = getAirportCode(l.to);
              return `${fromCode}→${toCode}: ${s}`;
            })
            .filter(Boolean)
            .join(" | ");
          setForm((f) => ({ ...f, seat: formatted || Object.values(nextLegSeats).filter(Boolean).join(", ") }));
        }
        return nextLegSeats;
      }
      return prev;
    });

    setForm((prevForm) => {
      if (!prevForm.seat || prevForm.seat.includes(":")) return prevForm;
      const seats = prevForm.seat.split(",").map((s) => s.trim()).filter(Boolean);
      if (seats.length > prevForm.passengers) {
        return {
          ...prevForm,
          seat: seats.slice(0, prevForm.passengers).join(", "),
        };
      }
      return prevForm;
    });
  }, [form.passengers, allFlightLegs, tripType, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passengers || form.passengers < 1) {
      toast.error(t('flight.err_min_passengers') || 'จำนวนผู้โดยสารต้องมีอย่างน้อย 1 ท่าน');
      setForm((prev) => ({ ...prev, passengers: 1 }));
      return;
    }
    if (form.passengers > 10) {
      toast.error(t('flight.err_max_passengers') || 'จำนวนผู้โดยสารสูงสุดไม่เกิน 10 ท่าน');
      setForm((prev) => ({ ...prev, passengers: 10 }));
      return;
    }

    if (tripType === "multicity") {
      for (let i = 0; i < multiCityLegs.length; i++) {
        const leg = multiCityLegs[i];
        if (leg.from === leg.to) {
          toast.error(`${language === 'th' ? `เที่ยวบินที่ ${i + 1}:` : `Flight ${i + 1}:`} ${getSameCityErrorText(language)}`);
          return;
        }
        if (!leg.date) {
          toast.error(`${language === 'th' ? `เที่ยวบินที่ ${i + 1}:` : `Flight ${i + 1}:`} ${t('flight.err_dep_date')}`);
          return;
        }
        if (leg.date < today) {
          toast.error(`${language === 'th' ? `เที่ยวบินที่ ${i + 1}:` : `Flight ${i + 1}:`} ${t('flight.err_past_date') || 'ไม่สามารถเลือกวันเดินทางย้อนหลังได้'}`);
          return;
        }
        if (i > 0 && leg.date < multiCityLegs[i - 1].date) {
          toast.error(language === 'th' ? `วันเดินทางเที่ยวบินที่ ${i + 1} ต้องไม่ก่อนหน้าเที่ยวบินที่ ${i}` : `Flight ${i + 1} date cannot be earlier than Flight ${i} date`);
          return;
        }
      }
      setSelectedMultiCityFlights([]);
      setActiveLegIndex(0);
      setBookingStep("select_flight");
      const bookingSection = document.getElementById("booking");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (form.from === form.to) {
      return;
    }
    if (!form.departDate) {
      toast.error(t('flight.err_dep_date'));
      return;
    }
    if (form.departDate < today) {
      toast.error(t('flight.err_past_date') || 'ไม่สามารถเลือกวันเดินทางย้อนหลังได้');
      return;
    }
    if (tripType === "round") {
      if (!form.returnDate) {
        toast.error(t('flight.err_ret_date'));
        return;
      }
      if (form.returnDate <= form.departDate) {
        toast.error(t('flight.err_invalid_return_date') || 'วันเดินทางกลับต้องอยู่หลังวันเดินทางไปอย่างน้อย 1 วัน');
        return;
      }
    }
    setSelectedOutboundFlight(null);
    setSelectedInboundFlight(null);
    setIsReturnSelection(false);
    setBookingStep("select_flight");
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassengerFormSubmitted(true);

    if (!form.passengers || form.passengers < 1) {
      toast.error(t('flight.err_min_passengers') || 'จำนวนผู้โดยสารต้องมีอย่างน้อย 1 ท่าน');
      setForm((prev) => ({ ...prev, passengers: 1 }));
      return;
    }
    if (form.passengers > 10) {
      toast.error(t('flight.err_max_passengers') || 'จำนวนผู้โดยสารสูงสุดไม่เกิน 10 ท่าน');
      setForm((prev) => ({ ...prev, passengers: 10 }));
      return;
    }

    if (tripType === "multicity") {
      for (let i = 0; i < multiCityLegs.length; i++) {
        const leg = multiCityLegs[i];
        if (!leg.date || leg.date < today) {
          toast.error(`${language === 'th' ? `เที่ยวบินที่ ${i + 1}:` : `Flight ${i + 1}:`} ${t('flight.err_past_date') || 'ไม่สามารถเลือกวันเดินทางย้อนหลังได้'}`);
          return;
        }
      }
    } else {
      if (!form.departDate || form.departDate < today) {
        toast.error(t('flight.err_past_date') || 'ไม่สามารถเลือกวันเดินทางย้อนหลังได้');
        return;
      }
      if (tripType === "round" && (!form.returnDate || form.returnDate <= form.departDate)) {
        toast.error(t('flight.err_invalid_return_date') || 'วันเดินทางกลับต้องอยู่หลังวันเดินทางไปอย่างน้อย 1 วัน');
        return;
      }
    }

    if (!form.passengerName || !form.passengerName.trim()) {
      passengerNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      passengerNameInputRef.current?.focus();
      return;
    }

    if (!form.email || !form.email.trim() || !form.email.includes('@')) {
      emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      emailInputRef.current?.focus();
      return;
    }

    const cleanPhone = (form.phone || '').trim();
    if (!cleanPhone || cleanPhone.length !== 10) {
      phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      phoneInputRef.current?.focus();
      return;
    }

    // Validate that every leg has required number of seats selected
    const incompleteLegIndex = allFlightLegs.findIndex((_, idx) => {
      const seats = (legSeats[idx] || (idx === 0 && allFlightLegs.length === 1 ? form.seat : ""))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return seats.length < form.passengers;
    });

    if (incompleteLegIndex !== -1) {
      const targetLeg = allFlightLegs[incompleteLegIndex];
      toast.error(
        language === 'th'
          ? `กรุณาเลือกที่นั่งสำหรับ ${targetLeg.label} (${targetLeg.flightNo}) ให้ครบ ${form.passengers} ที่นั่ง`
          : `Please select ${form.passengers} seat(s) for ${targetLeg.label} (${targetLeg.flightNo})`
      );
      setSeatMapActiveLegIndex(incompleteLegIndex);
      seatFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSeatMapOpen(true);
      return;
    }

    const cleanPromo = (form.promoCode || "").trim().toUpperCase();
    if (cleanPromo.length > 0 && getPromoDiscountRate(cleanPromo) === 0) {
      toast.error(language === 'th' ? 'โค้ดส่วนลดไม่ถูกต้อง กรุณาตรวจสอบหรือลบออกก่อนทำการจอง' : 'Invalid promo code. Please verify or clear it to proceed.');
      return;
    }

    // Prevent duplicate seat bookings across legs
    const existingBookings = getBookings();
    for (let i = 0; i < allFlightLegs.length; i++) {
      const leg = allFlightLegs[i];
      const checkSeats = (legSeats[i] || (i === 0 && allFlightLegs.length === 1 ? form.seat : ""))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const checkOrigCode = getAirportCode(leg.from);
      const checkDestCode = getAirportCode(leg.to);

      const takenSeat = checkSeats.find((seat) =>
        existingBookings.some((b: Booking) => {
          // Check outbound
          if (getAirportCode(b.from) === checkOrigCode && getAirportCode(b.to) === checkDestCode) {
            const seats = (b.seat || "").split(",").map((s) => s.trim());
            if (seats.includes(seat) && (!leg.departDate || b.departDate === leg.departDate)) return true;
          }
          // Check return
          if (b.tripType === "round" && getAirportCode(b.to) === checkOrigCode && getAirportCode(b.from) === checkDestCode) {
            const seats = (b.returnSeat || b.seat || "").split(",").map((s) => s.trim());
            if (seats.includes(seat) && (!leg.departDate || b.returnDate === leg.departDate)) return true;
          }
          // Check legs
          if (b.legs && b.legs.length > 0) {
            return b.legs.some((l) => {
              const lOrig = getAirportCode(l.from);
              const lDest = getAirportCode(l.to);
              if (lOrig === checkOrigCode && lDest === checkDestCode) {
                const seats = (l.seat || b.seat || "").split(",").map((s) => s.trim());
                return seats.includes(seat) && (!leg.departDate || l.departDate === leg.departDate);
              }
              return false;
            });
          }
          return false;
        })
      );

      if (takenSeat) {
        toast.error(
          language === 'th'
            ? `ที่นั่ง ${takenSeat} บนเที่ยวบิน ${leg.label} (${leg.flightNo}) มีผู้จองแล้ว กรุณาเลือกที่นั่งอื่น`
            : `Seat ${takenSeat} on ${leg.label} (${leg.flightNo}) is already booked. Please select another seat.`
        );
        setSeatMapActiveLegIndex(i);
        seatFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSeatMapOpen(true);
        return;
      }
    }

    let pricePerPax = 0;
    let newBooking: any = null;

    const sanitizeSeats = (seatStr: string = "") => {
      if (!seatStr) return "";
      const seats = seatStr.split(",").map((s) => s.trim()).filter(Boolean);
      return seats.slice(0, form.passengers).join(", ");
    };

    if (tripType === "multicity") {
      pricePerPax = selectedMultiCityFlights.reduce((sum, f) => sum + (f?.price || 890), 0);
      const legs = allFlightLegs.map((leg, idx) => ({
        from: leg.from,
        to: leg.to,
        departDate: leg.departDate || multiCityLegs[idx]?.date || today,
        flightNo: leg.flightNo,
        departTime: leg.departTime || "08:00",
        arrivalTime: leg.arrivalTime || "09:15",
        airlineName: leg.airlineName || "Botnoi Air",
        airlineCode: leg.airlineCode || "BTN",
        price: leg.price || 890,
        seat: sanitizeSeats(legSeats[idx] || (idx === 0 ? form.seat : "")),
        aircraftModel: leg.aircraftModel,
        aircraftTail: leg.aircraftTail,
        class: leg.cabinClass,
      }));

      newBooking = {
        tripType: "multicity",
        ...form,
        from: multiCityLegs[0].from,
        to: multiCityLegs[multiCityLegs.length - 1].to,
        departDate: multiCityLegs[0].date,
        legs,
        seat: Object.values(legSeats).map(s => sanitizeSeats(s)).filter(Boolean).join(" | ") || sanitizeSeats(form.seat),
        pricePerPax,
        class: selectedClass !== "all" ? selectedClass : (selectedMultiCityFlights[0]?.class || "economy"),
        aircraftModel: selectedMultiCityFlights[0]?.aircraft?.model || "Airbus A320-200",
        aircraftTail: selectedMultiCityFlights[0]?.aircraft?.tailNumber || "HS-BNA",
        outboundFlightNo: legs[0]?.flightNo,
        outboundTime: legs[0]?.departTime,
      };
    } else if (tripType === "round") {
      pricePerPax = (selectedOutboundFlight?.price || 890) + (selectedInboundFlight?.price || 0);
      const legs = allFlightLegs.map((leg, idx) => ({
        from: leg.from,
        to: leg.to,
        departDate: leg.departDate || (idx === 0 ? form.departDate : form.returnDate) || today,
        flightNo: leg.flightNo,
        departTime: leg.departTime || (idx === 0 ? "08:00" : "17:00"),
        arrivalTime: leg.arrivalTime || (idx === 0 ? "09:15" : "18:15"),
        airlineName: leg.airlineName || "Botnoi Air",
        airlineCode: leg.airlineCode || "BTN",
        price: leg.price || 890,
        seat: sanitizeSeats(legSeats[idx] || (idx === 0 ? form.seat : "")),
        aircraftModel: leg.aircraftModel,
        aircraftTail: leg.aircraftTail,
        class: leg.cabinClass,
      }));

      newBooking = {
        tripType: "round",
        ...form,
        seat: sanitizeSeats(legSeats[0] || form.seat),
        returnSeat: sanitizeSeats(legSeats[1] || ""),
        legs,
        pricePerPax,
        class: selectedOutboundFlight?.class || "economy",
        aircraftModel: selectedOutboundFlight?.aircraft?.model || "Airbus A320-200",
        aircraftTail: selectedOutboundFlight?.aircraft?.tailNumber || "HS-BNA",
        outboundFlightNo: selectedOutboundFlight?.flightNo,
        outboundTime: selectedOutboundFlight?.departTime,
        inboundFlightNo: selectedInboundFlight?.flightNo,
        inboundTime: selectedInboundFlight?.departTime,
        inboundAircraftModel: selectedInboundFlight?.aircraft?.model,
        inboundAircraftTail: selectedInboundFlight?.aircraft?.tailNumber,
      };
    } else {
      pricePerPax = selectedOutboundFlight?.price || 890;
      const legs = allFlightLegs.map((leg) => ({
        from: leg.from,
        to: leg.to,
        departDate: leg.departDate || form.departDate || today,
        flightNo: leg.flightNo,
        departTime: leg.departTime || "08:00",
        arrivalTime: leg.arrivalTime || "09:15",
        airlineName: leg.airlineName || "Botnoi Air",
        airlineCode: leg.airlineCode || "BTN",
        price: leg.price || 890,
        seat: sanitizeSeats(legSeats[0] || form.seat),
        aircraftModel: leg.aircraftModel,
        aircraftTail: leg.aircraftTail,
        class: leg.cabinClass,
      }));

      newBooking = {
        tripType: "oneway",
        ...form,
        seat: sanitizeSeats(legSeats[0] || form.seat),
        legs,
        pricePerPax,
        class: selectedOutboundFlight?.class || "economy",
        aircraftModel: selectedOutboundFlight?.aircraft?.model || "Airbus A320-200",
        aircraftTail: selectedOutboundFlight?.aircraft?.tailNumber || "HS-BNA",
        outboundFlightNo: selectedOutboundFlight?.flightNo,
        outboundTime: selectedOutboundFlight?.departTime,
      };
    }

    saveBooking(newBooking);
    toast.success(t('flight.booking_success'));
    setTicketBooking(newBooking);
    try {
      window.localStorage.setItem("botnoi-air-last-booking", JSON.stringify(newBooking));
    } catch (err) {
      console.error("Failed to save booking:", err);
    }
    setBoardingPassOpen(true);

    // Reset steps
    setPassengerFormSubmitted(false);
    setBookingStep("search");
    setSelectedOutboundFlight(null);
    setSelectedInboundFlight(null);
    setSelectedMultiCityFlights([]);
    setActiveLegIndex(0);
    setLegSeats({});
    setSeatMapActiveLegIndex(0);
    setIsReturnSelection(false);
    setForm({
      from: "กรุงเทพมหานคร (DMK)",
      to: "เชียงใหม่ (CNX)",
      departDate: today,
      returnDate: getNextDayString(today),
      passengers: 1,
      promoCode: "",
      passengerName: "",
      email: "",
      phone: "",
      seat: "",
    });

    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const fromDetails = useMemo(() => getCityDetails(form.from, language), [form.from, language]);
  const toDetails = useMemo(() => getCityDetails(form.to, language), [form.to, language]);
  const departDateParts = useMemo(() => parseDateForCard(form.departDate, 0, language), [form.departDate, language]);
  const returnDateParts = useMemo(() => parseDateForCard(form.returnDate, 2, language), [form.returnDate, language]);

  const handleSwapCities = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curFrom = form.from;
    const curTo = form.to;
    if (isRouteAvailable(curTo, curFrom)) {
      setForm(prev => ({
        ...prev,
        from: curTo,
        to: curFrom,
      }));
      toast.success(language === 'th' ? 'สลับเมืองต้นทางและปลายทางแล้ว' : 'Swapped origin and destination!');
    } else {
      const allowed = getAvailableDestinations(curTo);
      if (allowed.length > 0) {
        setForm(prev => ({
          ...prev,
          from: curTo,
          to: allowed[0],
        }));
        toast.info(
          language === 'th'
            ? `สลับต้นทางเป็น ${getCityDetails(curTo, language).cityName} แล้ว (เลือกปลายทางที่บินได้)`
            : `Swapped origin to ${getCityDetails(curTo, language).cityName}`
        );
      } else {
        toast.error(
          language === 'th'
            ? `สนามบิน ${getCityDetails(curTo, language).cityName} ไม่มีเส้นทางบินตรง`
            : `No direct flights from ${getCityDetails(curTo, language).cityName}`
        );
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isReady && <PageSkeleton variant="flight" />}
      </AnimatePresence>
      <div className="flight-theme min-h-screen bg-background relative text-foreground overflow-x-hidden">
        <style>{`
          div[data-sonner-toaster],
          section[data-sonner-toaster],
          ol[data-sonner-toaster] {
            position: fixed !important;
            top: 84px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            bottom: auto !important;
            right: auto !important;
            z-index: 99999999 !important;
            margin: 0 !important;
            pointer-events: none !important;
            width: auto !important;
            display: flex !important;
            justify-content: center !important;
          }
          [data-sonner-toast] {
            pointer-events: auto !important;
            margin: 0 auto !important;
            box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15) !important;
            border-radius: 18px !important;
            font-weight: 800 !important;
            font-size: 0.95rem !important;
            padding: 14px 22px !important;
            min-width: 320px !important;
            max-width: 92vw !important;
            backdrop-filter: blur(12px) !important;
          }
          [data-sonner-toast][data-type="error"] {
            background-color: #fff1f2 !important;
            color: #9f1239 !important;
            border: 2px solid #f43f5e !important;
          }
          .dark [data-sonner-toast][data-type="error"] {
            background-color: #4c0519 !important;
            color: #ffe4e6 !important;
            border: 2px solid #fb7185 !important;
          }
          [data-sonner-toast][data-type="success"] {
            background-color: #f0fdf4 !important;
            color: #14532d !important;
            border: 2px solid #22c55e !important;
          }
          .dark [data-sonner-toast][data-type="success"] {
            background-color: #052e16 !important;
            color: #dcfce7 !important;
            border: 2px solid #4ade80 !important;
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            opacity: 0 !important;
            cursor: pointer !important;
          }
        `}</style>
        <Toaster
          position="top-center"
          theme="dark"
          closeButton
          duration={4000}
          toastOptions={{
            className: "!bg-[#0b0f19] !text-white !border !border-slate-800 !shadow-2xl !rounded-2xl !py-3 !px-5 !text-xs !font-medium",
            style: {
              backgroundColor: "#0b0f19",
              color: "#f8fafc",
              border: "1px solid #1e293b",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)",
            },
          }}
        />


        {/* HERO with runway airplane background matching ref.webp */}
        <section className="relative isolate overflow-hidden text-white min-h-[560px] md:min-h-[620px] flex flex-col justify-between">
          <motion.img
            src={flightHeroRunway}
            alt={language === 'th' ? 'เครื่องบินพาณิชย์บนรันเวย์' : 'Commercial Airplane on Runway'}
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_65%] transition-opacity duration-300"
            style={{ y: heroParallax }}
          />

          {/* Top Breadcrumb & Actions Bar */}
          <header className="relative z-30 mx-auto mt-3 sm:mt-4 mb-2 w-full max-w-7xl bg-transparent text-white border-none shadow-none transition-all">
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              {/* Left: Home > All Demos > BotnoiAir > Flight Demo */}
              <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-white/85 flex-wrap drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" aria-label="Breadcrumb">
                <Link to="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-white/80" />
                  <span>{t('nav.home')}</span>
                </Link>
                <ChevronRight className="w-3 h-3 text-white/40" />
                <Link to="/all-demo" className="text-white/80 hover:text-white transition-colors">
                  <span>{t('nav.all_demos')}</span>
                </Link>
                <ChevronRight className="w-3 h-3 text-white/40" />
                <span className="font-extrabold uppercase font-mono flex items-center gap-1 text-white">
                  <img src={botnoiAirLogo} alt="BotnoiAir" className="h-4 sm:h-5 w-auto object-contain inline-block drop-shadow-sm" />
                  <span>BotnoiAir</span>
                </span>
                <ChevronRight className="w-3 h-3 text-white/40" />
                <span className="text-white font-extrabold">
                  {t('nav.flight')}
                </span>
              </nav>

              {/* Right: Last Boarding Pass & Roster Admin */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold w-full sm:w-auto justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (ticketBooking) {
                      setBoardingPassOpen(true);
                    } else {
                      toast.info(language === 'th' ? 'ยังไม่มีข้อมูลการจองล่าสุด กรุณาค้นหาและจองเที่ยวบินก่อนครับ' : 'No previous boarding pass found. Please book a flight first!');
                    }
                  }}
                  className="btn-102 cursor-pointer"
                  id="nav-flight-boarding-pass"
                  title={t('flight.nav_receipt')}
                >
                  <span className="circle_102"></span>
                  <span className="circle_102"></span>
                  <span className="circle_102"></span>
                  <span className="circle_102"></span>
                  <span className="circle_102"></span>
                  <span className="btn-text-102 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-white" />
                    <span>{t('flight.nav_receipt')}</span>
                  </span>
                </button>

                <Link
                  to="/flight-demo/admin"
                  className="btn-102 cursor-pointer"
                  id="nav-flight-admin"
                  title={t('flight.nav_admin')}
                >
                  <span className="circle_102"></span>
                  <span className="circle_102"></span>
                  <span className="circle_102"></span>
                  <span className="circle_102"></span>
                  <span className="circle_102"></span>
                  <span className="btn-text-102 flex items-center gap-1.5">
                    <span>{t('flight.nav_admin')}</span>
                  </span>
                </Link>
              </div>
            </div>
          </header>

          {/* Hero Left Content */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-10 md:pt-14 pb-32 sm:pb-36 md:pb-48 w-full relative z-10">
            <motion.div
              className="max-w-xl text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1
                className="font-display text-3xl sm:text-4xl md:text-6xl font-bold leading-tight !text-white text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] [-webkit-text-fill-color:white!important] [background:none!important]"
                style={{
                  color: '#ffffff',
                  WebkitTextFillColor: '#ffffff',
                  background: 'none',
                  WebkitBackgroundClip: 'unset'
                }}
              >
                {t('flight.hero_title')}<br />
                {t('flight.hero_title_sub')}
              </h1>

              <p
                className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-100/90 max-w-md leading-relaxed font-normal"
                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
              >
                {t('flight.hero_desc')}
              </p>

              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={() => {
                    const dealsEl = document.getElementById("deals");
                    dealsEl?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {t('flight.btn_explore_deals')}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Soft Runway Bottom Gradient Fade into background */}
          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/80 dark:via-slate-950/80 to-transparent pointer-events-none" />
        </section>

        {/* FLOATING BOOKING CARD matching ref.webp */}
        <section id="booking" className="mx-auto max-w-5xl px-3.5 sm:px-6 -mt-20 sm:-mt-24 md:-mt-32 relative z-20">
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] shadow-2xl border border-slate-100/80 dark:border-slate-800 p-4 sm:p-6 md:p-8 transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Progress Bar (Only visible when selecting flight or entering passenger details) */}
            {bookingStep !== "search" && (
              <div className="flex items-center justify-between mb-6 sm:mb-8 max-w-lg mx-auto select-none">
                <div className="flex flex-col items-center flex-1 relative">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 bg-sky-100 text-sky-700`}>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-slate-500 text-center">{language === 'th' ? 'ค้นหาเที่ยวบิน' : (t('flight.nav_booking') || "Search")}</span>
                </div>
                <div className="h-0.5 bg-slate-200 flex-1 -mt-4"></div>
                <div className="flex flex-col items-center flex-1 relative">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${bookingStep === "select_flight" ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-700"}`}>
                    {bookingStep === "passenger_details" ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : "2"}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-slate-500 text-center">{language === 'th' ? 'เลือกเที่ยวบิน' : (t("flight.select_flight") || "Select Flight")}</span>
                </div>
                <div className="h-0.5 bg-slate-200 flex-1 -mt-4"></div>
                <div className="flex flex-col items-center flex-1 relative">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${bookingStep === "passenger_details" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    3
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-slate-500 text-center">{t('flight.passenger_info_step')}</span>
                </div>
              </div>
            )}

            {bookingStep === "search" && (
              <>
                {/* Sub-row: Trip Type & Travellers / Cabin Class */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 select-none">
                  {/* Left: Trip Types */}
                  <div className="flex items-center gap-3.5 sm:gap-5 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-wrap">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        id="trip-type-oneway"
                        data-testid="trip-type-oneway"
                        type="radio"
                        name="tripType"
                        checked={tripType === "oneway"}
                        onChange={() => setTripType("oneway")}
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span>{t('flight.one_way')}</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        id="trip-type-round"
                        data-testid="trip-type-round"
                        type="radio"
                        name="tripType"
                        checked={tripType === "round"}
                        onChange={() => setTripType("round")}
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span>{t('flight.round_trip')}</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        id="trip-type-multicity"
                        data-testid="trip-type-multicity"
                        type="radio"
                        name="tripType"
                        checked={tripType === "multicity"}
                        onChange={() => setTripType("multicity")}
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span>{t('flight.multi_city')}</span>
                    </label>
                  </div>

                  {/* Right: Travellers & Cabin Class dropdowns */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Passenger Dropdown */}
                    <div className="relative flex-1 sm:flex-initial">
                      <button
                        id="flight-passengers-dropdown-btn"
                        data-testid="flight-passengers-dropdown-btn"
                        type="button"
                        onClick={() => {
                          setPassengerDropdownOpen(!passengerDropdownOpen);
                          setCabinDropdownOpen(false);
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                      >
                        <span className="truncate">
                          {(t('flight.passengers_count') || "ผู้โดยสาร {count} ท่าน")
                            .replace('{count}', String(form.passengers))
                            .replace('{s}', form.passengers > 1 ? 's' : '')}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </button>

                      {passengerDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setPassengerDropdownOpen(false)}
                          />
                          <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between mb-3.5">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{t('flight.passengers')}</span>
                                <span className="text-[10px] text-slate-400">{t('flight.max_passengers_hint')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))}
                                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 cursor-pointer transition-all text-sm select-none"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={form.passengers}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (isNaN(val)) {
                                      setForm(prev => ({ ...prev, passengers: 1 }));
                                    } else {
                                      setForm(prev => ({ ...prev, passengers: Math.max(1, Math.min(10, val)) }));
                                    }
                                  }}
                                  className="w-12 py-1 text-center font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({ ...prev, passengers: Math.min(10, prev.passengers + 1) }))}
                                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 cursor-pointer transition-all text-sm select-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block mb-2 font-medium">{t('flight.quick_select')}</span>
                              <div className="grid grid-cols-5 gap-1.5">
                                {[1, 2, 3, 5, 10].map(num => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => {
                                      setForm(prev => ({ ...prev, passengers: num }));
                                      setPassengerDropdownOpen(false);
                                    }}
                                    className={`py-1.5 rounded-xl text-center font-bold transition-all text-xs cursor-pointer active:scale-95 ${
                                      form.passengers === num
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Cabin Class Dropdown */}
                    <div className="relative flex-1 sm:flex-initial">
                      <button
                        id="flight-cabin-dropdown-btn"
                        data-testid="flight-cabin-dropdown-btn"
                        type="button"
                        onClick={() => {
                          setCabinDropdownOpen(!cabinDropdownOpen);
                          setPassengerDropdownOpen(false);
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                      >
                        <span className="truncate">{selectedClass === 'business' ? t('flight.cabin_business') : t('flight.cabin_economy')}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </button>

                      {cabinDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setCabinDropdownOpen(false)}
                          />
                          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-150">
                            {[
                              { id: "all", label: t('flight.cabin_all') },
                              { id: "economy", label: t('flight.cabin_economy') },
                              { id: "business", label: t('flight.cabin_business') },
                            ].map(cls => (
                              <button
                                key={cls.id}
                                type="button"
                                onClick={() => {
                                  setSelectedClass(cls.id as any);
                                  setCabinDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                  selectedClass === cls.id ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {cls.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Segmented Search Inputs Box matching ref.webp */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  {tripType === "multicity" ? (
                    <div className="space-y-3">
                      {multiCityLegs.map((leg, legIndex) => {
                        const legFromDetails = getCityDetails(leg.from, language);
                        const legToDetails = getCityDetails(leg.to, language);
                        const legDateParts = parseDateForCard(leg.date, 0, language);
                        const isFromPickerOpen = openMultiCityPicker?.legIndex === legIndex && openMultiCityPicker?.type === "from";
                        const isToPickerOpen = openMultiCityPicker?.legIndex === legIndex && openMultiCityPicker?.type === "to";
                        const minLegDate = legIndex === 0 ? today : multiCityLegs[legIndex - 1].date;

                        return (
                          <div key={leg.id} className="relative">
                            <div className="flex items-center justify-between mb-1.5 px-1">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-display">
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] font-black flex items-center justify-center">
                                  {legIndex + 1}
                                </span>
                                <span>{language === 'th' ? `เที่ยวบินที่ ${legIndex + 1}` : `Flight ${legIndex + 1}`}:</span>
                                <span title={legFromDetails.fullName} className="underline decoration-dotted underline-offset-2 cursor-help">{legFromDetails.cityName}</span>
                                <span>→</span>
                                <span title={legToDetails.fullName} className="underline decoration-dotted underline-offset-2 cursor-help">{legToDetails.cityName}</span>
                              </span>
                              {multiCityLegs.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLeg(legIndex)}
                                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>{t('flight.btn_remove')}</span>
                                </button>
                              )}
                            </div>

                            <div className="border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-1.5 md:p-2 flex flex-col lg:flex-row items-stretch lg:items-center bg-white dark:bg-slate-900 shadow-sm gap-1 lg:gap-0">
                              {/* Origin & Destination Group */}
                              <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-stretch sm:items-center relative">
                                {/* Origin Segment */}
                                <div
                                  onClick={() => {
                                    setOpenMultiCityPicker(
                                      isFromPickerOpen ? null : { legIndex, type: "from" }
                                    );
                                  }}
                                  title={legFromDetails.fullName}
                                  className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                                    leg.from === leg.to ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0" title={legFromDetails.fullName}>
                                    <span className="font-mono font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-tight shrink-0">
                                      {legFromDetails.code}
                                    </span>
                                    <div className="min-w-0 flex-1 text-left">
                                      <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate" title={legFromDetails.fullName}>
                                        {legFromDetails.cityName}
                                      </div>
                                      <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5" title={legFromDetails.fullName}>
                                        {legFromDetails.airportName}
                                      </div>
                                    </div>
                                  </div>

                                  {/* From Picker Dropdown */}
                                  {isFromPickerOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-[calc(100vw-3rem)] sm:w-88 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 p-3 z-50 text-left">
                                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('flight.select_origin')}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setOpenMultiCityPicker(null); setMultiCitySearch(""); }} className="text-slate-400 hover:text-slate-600 p-1">
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      {/* Search Input */}
                                      <div className="relative mb-2">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                          type="text"
                                          value={multiCitySearch}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => setMultiCitySearch(e.target.value)}
                                          placeholder={language === "th" ? "ค้นหาจังหวัด สนามบิน หรือรหัส..." : "Search province, airport..."}
                                          className="w-full bg-slate-100 dark:bg-slate-800/90 text-xs text-slate-800 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border-0 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                      </div>
                                      <div className="max-h-60 overflow-y-auto space-y-1" style={{ scrollbarWidth: 'thin' }}>
                                        {CITIES.filter((c) => {
                                          if (!multiCitySearch) return true;
                                          const d = getCityDetails(c, language);
                                          const q = multiCitySearch.toLowerCase().trim();
                                          return (
                                            c.toLowerCase().includes(q) ||
                                            d.code.toLowerCase().includes(q) ||
                                            d.cityName.toLowerCase().includes(q) ||
                                            d.province.toLowerCase().includes(q) ||
                                            d.airportName.toLowerCase().includes(q)
                                          );
                                        }).map((c) => {
                                          const details = getCityDetails(c, language);
                                          const isSelected = leg.from === c;
                                          const routeCount = (FLIGHT_ROUTES_MAP[details.code] || []).length;
                                          return (
                                            <button
                                              key={c}
                                              type="button"
                                              title={details.fullName}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateLegCity(legIndex, "from", c);
                                              }}
                                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                                                isSelected ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                              }`}
                                            >
                                              <div className="min-w-0 pr-2">
                                                <div className="text-xs font-bold flex items-center gap-1.5" title={details.fullName}>
                                                  <span className="font-mono text-blue-600 bg-blue-100/60 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[10px] font-black">{details.code}</span>
                                                  <span className="truncate">{details.cityName}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate mt-0.5" title={details.fullName}>
                                                  {details.province} • {details.airportName}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                  {routeCount} {language === "th" ? "เส้นทาง" : "routes"}
                                                </span>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                  {/* Swap Button */}
                                  <div className="flex items-center justify-center px-1 sm:px-2 shrink-0 self-center">
                                    <button
                                      type="button"
                                      onClick={() => handleSwapLegCities(legIndex)}
                                      title={t('flight.swap_cities_tooltip')}
                                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center shadow-2xs transition-all hover:rotate-180 cursor-pointer"
                                    >
                                      <ArrowLeftRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                {/* Destination Segment */}
                                <div
                                  onClick={() => {
                                    setOpenMultiCityPicker(
                                      isToPickerOpen ? null : { legIndex, type: "to" }
                                    );
                                  }}
                                  title={legToDetails.fullName}
                                  className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                                    leg.from === leg.to ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0" title={legToDetails.fullName}>
                                    <span className="font-mono font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-tight shrink-0">
                                      {legToDetails.code}
                                    </span>
                                    <div className="min-w-0 flex-1 text-left">
                                      <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate" title={legToDetails.fullName}>
                                        {legToDetails.cityName}
                                      </div>
                                      <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5" title={legToDetails.fullName}>
                                        {legToDetails.airportName}
                                      </div>
                                    </div>
                                  </div>

                                  {/* To Picker Dropdown */}
                                  {isToPickerOpen && (
                                    <div className="absolute top-full right-0 sm:right-auto sm:left-1/3 mt-2 w-[calc(100vw-3rem)] sm:w-88 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 p-3 z-50 text-left">
                                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('flight.select_dest')}</span>
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                                            {getAvailableDestinations(leg.from).length} {language === "th" ? "ปลายทาง" : "dests"}
                                          </span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setOpenMultiCityPicker(null); setMultiCitySearch(""); }} className="text-slate-400 hover:text-slate-600 p-1">
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      {/* Search Input */}
                                      <div className="relative mb-2">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                          type="text"
                                          value={multiCitySearch}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => setMultiCitySearch(e.target.value)}
                                          placeholder={language === "th" ? "ค้นหาปลายทาง..." : "Search destination..."}
                                          className="w-full bg-slate-100 dark:bg-slate-800/90 text-xs text-slate-800 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border-0 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                      </div>
                                      <div className="max-h-60 overflow-y-auto space-y-1" style={{ scrollbarWidth: 'thin' }}>
                                        {(() => {
                                          const allowed = getAvailableDestinations(leg.from);
                                          const filtered = allowed.filter((c) => {
                                            if (!multiCitySearch) return true;
                                            const d = getCityDetails(c, language);
                                            const q = multiCitySearch.toLowerCase().trim();
                                            return (
                                              c.toLowerCase().includes(q) ||
                                              d.code.toLowerCase().includes(q) ||
                                              d.cityName.toLowerCase().includes(q) ||
                                              d.province.toLowerCase().includes(q) ||
                                              d.airportName.toLowerCase().includes(q)
                                            );
                                          });
                                          if (filtered.length === 0) {
                                            return (
                                              <div className="py-4 text-center text-xs text-slate-400">
                                                {language === "th" ? "ไม่มีเส้นทางบินตรงที่ตรงกับการค้นหา" : "No matching direct routes"}
                                              </div>
                                            );
                                          }
                                          return filtered.map((c) => {
                                            const details = getCityDetails(c, language);
                                            const isSelected = leg.to === c;
                                            return (
                                              <button
                                                key={c}
                                                type="button"
                                                title={details.fullName}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdateLegCity(legIndex, "to", c);
                                                }}
                                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                                                  isSelected ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                }`}
                                              >
                                                <div className="min-w-0 pr-2">
                                                  <div className="text-xs font-bold flex items-center gap-1.5" title={details.fullName}>
                                                    <span className="font-mono text-blue-600 bg-blue-100/60 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[10px] font-black">{details.code}</span>
                                                    <span className="truncate">{details.cityName}</span>
                                                  </div>
                                                  <div className="text-[10px] text-slate-400 truncate mt-0.5" title={details.fullName}>
                                                    {details.province} • {details.airportName}
                                                  </div>
                                                </div>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                              </button>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Vertical Divider between Cities and Departure Date */}
                              <div className="hidden lg:block w-px h-9 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0 self-center" />

                              {/* Departure Date Segment */}
                              <div
                                className="relative flex-1 sm:flex-initial sm:w-48 lg:w-56 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0 select-none"
                              >
                                <input
                                  type="date"
                                  required
                                  min={minLegDate}
                                  value={leg.date}
                                  onClick={(e) => {
                                    try {
                                      if (typeof (e.currentTarget as any).showPicker === "function") {
                                        (e.currentTarget as any).showPicker();
                                      }
                                    } catch (err) {}
                                  }}
                                  onChange={(e) => handleUpdateLegDate(legIndex, e.target.value)}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                />
                                <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 pointer-events-none">
                                  <span className="font-mono font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white leading-none shrink-0">
                                    {legDateParts.day}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                                      {legDateParts.month}
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                                      {legDateParts.weekday}, {legDateParts.year}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {leg.from === leg.to && (
                              <p className="mt-1.5 text-xs font-bold text-rose-500 text-left flex items-center gap-1 px-1">
                                <span>⚠️ {getSameCityErrorText(language)}</span>
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {/* Bottom multi-city action row */}
                      <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                        {multiCityLegs.length < 4 ? (
                          <button
                            type="button"
                            onClick={handleAddLeg}
                            className="px-4 py-2.5 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <span className="text-base leading-none font-bold">+</span>
                            <span>{t('flight.add_flight')}</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        <button
                          type="submit"
                          id="submit-flight-search-multicity"
                          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-all cursor-pointer font-bold text-sm gap-2 ml-auto"
                        >
                          <Search className="w-4 h-4 text-white stroke-[2.5]" />
                          <span>{t('flight.search_flights') || "Search Flights"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-1.5 md:p-2 flex flex-col lg:flex-row items-stretch lg:items-center bg-white dark:bg-slate-900 shadow-sm gap-1 lg:gap-0">
                        {/* Origin & Destination Group */}
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-stretch sm:items-center relative">
                          {/* Origin Segment */}
                          <div
                            id="flight-origin-picker"
                            data-testid="flight-origin-picker"
                            onClick={() => {
                              setFromPickerOpen(!fromPickerOpen);
                              setToPickerOpen(false);
                            }}
                            title={fromDetails.fullName}
                            className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                              form.from === form.to ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0" title={fromDetails.fullName}>
                              <span className="font-mono font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-tight shrink-0">
                                {fromDetails.code}
                              </span>
                              <div className="min-w-0 flex-1 text-left">
                                <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate" title={fromDetails.fullName}>
                                  {fromDetails.cityName}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5" title={fromDetails.fullName}>
                                  {fromDetails.airportName}
                                </div>
                              </div>
                            </div>

                            {/* From Picker Dropdown */}
                            {fromPickerOpen && (
                              <div className="absolute top-full left-0 mt-2 w-[calc(100vw-3rem)] sm:w-88 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 p-3 z-50 text-left">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('flight.select_origin')}</span>
                                  <button onClick={(e) => { e.stopPropagation(); setFromPickerOpen(false); setOriginSearch(""); }} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {/* Search Input */}
                                <div className="relative mb-2">
                                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  <input
                                    type="text"
                                    value={originSearch}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setOriginSearch(e.target.value)}
                                    placeholder={language === "th" ? "ค้นหาจังหวัด สนามบิน หรือรหัส..." : "Search province, airport..."}
                                    className="w-full bg-slate-100 dark:bg-slate-800/90 text-xs text-slate-800 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border-0 focus:ring-1 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-1" style={{ scrollbarWidth: 'thin' }}>
                                  {CITIES.filter((c) => {
                                    if (!originSearch) return true;
                                    const d = getCityDetails(c, language);
                                    const q = originSearch.toLowerCase().trim();
                                    return (
                                      c.toLowerCase().includes(q) ||
                                      d.code.toLowerCase().includes(q) ||
                                      d.cityName.toLowerCase().includes(q) ||
                                      d.province.toLowerCase().includes(q) ||
                                      d.airportName.toLowerCase().includes(q)
                                    );
                                  }).map((c) => {
                                    const details = getCityDetails(c, language);
                                    const isSelected = form.from === c;
                                    const hasDirectRouteToDest = isRouteAvailable(c, form.to);
                                    const routeCount = (FLIGHT_ROUTES_MAP[details.code] || []).length;
                                    return (
                                      <button
                                        key={c}
                                        type="button"
                                        title={details.fullName}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setForm(prev => {
                                            const allowed = getAvailableDestinations(c);
                                            const validTo = allowed.includes(prev.to) ? prev.to : (allowed[0] || "");
                                            if (!allowed.includes(prev.to) && validTo) {
                                              toast.info(
                                                language === 'th'
                                                  ? `สนามบิน ${details.cityName} ไม่มีเที่ยวบินไป ${toDetails.cityName} — ปรับปลายทางเป็น ${getCityDetails(validTo, language).cityName} แล้ว`
                                                  : `${details.cityName} has no direct flight to ${toDetails.cityName} — adjusted destination to ${getCityDetails(validTo, language).cityName}`
                                              );
                                            }
                                            return { ...prev, from: c, to: validTo };
                                          });
                                          setFromPickerOpen(false);
                                          setOriginSearch("");
                                        }}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                                          isSelected ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                        }`}
                                      >
                                        <div className="min-w-0 pr-2">
                                          <div className="text-xs font-bold flex items-center gap-1.5" title={details.fullName}>
                                            <span className="font-mono text-blue-600 bg-blue-100/60 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[10px] font-black">{details.code}</span>
                                            <span className="truncate">{details.cityName}</span>
                                          </div>
                                          <div className="text-[10px] text-slate-400 truncate mt-0.5" title={details.fullName}>
                                            {details.province} • {details.airportName}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {hasDirectRouteToDest ? (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                                              {language === "th" ? `บินตรงไป ${toDetails.code}` : `Direct to ${toDetails.code}`}
                                            </span>
                                          ) : (
                                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                              {routeCount} {language === "th" ? "เส้นทาง" : "routes"}
                                            </span>
                                          )}
                                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Swap Button (Properly spaced, not squeezed) */}
                          <div className="flex items-center justify-center px-1 sm:px-2 shrink-0 self-center">
                            <button
                              id="flight-swap-cities-btn"
                              data-testid="flight-swap-cities-btn"
                              type="button"
                              onClick={handleSwapCities}
                              title={t('flight.swap_cities_tooltip')}
                              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center shadow-2xs transition-all hover:rotate-180 cursor-pointer"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Destination Segment */}
                          <div
                            id="flight-dest-picker"
                            data-testid="flight-dest-picker"
                            onClick={() => {
                              setToPickerOpen(!toPickerOpen);
                              setFromPickerOpen(false);
                            }}
                            title={toDetails.fullName}
                            className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                              form.from === form.to ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0" title={toDetails.fullName}>
                              <span className="font-mono font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-tight shrink-0">
                                {toDetails.code}
                              </span>
                              <div className="min-w-0 flex-1 text-left">
                                <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate" title={toDetails.fullName}>
                                  {toDetails.cityName}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5" title={toDetails.fullName}>
                                  {toDetails.airportName}
                                </div>
                              </div>
                            </div>

                            {/* To Picker Dropdown */}
                            {toPickerOpen && (
                              <div className="absolute top-full right-0 sm:right-auto sm:left-1/3 mt-2 w-[calc(100vw-3rem)] sm:w-88 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 p-3 z-50 text-left">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('flight.select_dest')}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                                      {getAvailableDestinations(form.from).length} {language === "th" ? "ปลายทาง" : "dests"}
                                    </span>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); setToPickerOpen(false); setDestSearch(""); }} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {/* Search Input */}
                                <div className="relative mb-2">
                                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  <input
                                    type="text"
                                    value={destSearch}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setDestSearch(e.target.value)}
                                    placeholder={language === "th" ? "ค้นหาปลายทาง..." : "Search destination..."}
                                    className="w-full bg-slate-100 dark:bg-slate-800/90 text-xs text-slate-800 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border-0 focus:ring-1 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-1" style={{ scrollbarWidth: 'thin' }}>
                                  {(() => {
                                    const allowed = getAvailableDestinations(form.from);
                                    const filtered = allowed.filter((c) => {
                                      if (!destSearch) return true;
                                      const d = getCityDetails(c, language);
                                      const q = destSearch.toLowerCase().trim();
                                      return (
                                        c.toLowerCase().includes(q) ||
                                        d.code.toLowerCase().includes(q) ||
                                        d.cityName.toLowerCase().includes(q) ||
                                        d.province.toLowerCase().includes(q) ||
                                        d.airportName.toLowerCase().includes(q)
                                      );
                                    });
                                    if (filtered.length === 0) {
                                      return (
                                        <div className="py-4 text-center text-xs text-slate-400">
                                          {language === "th" ? "ไม่มีเส้นทางบินตรงจากสนามบินนี้" : "No matching direct routes from this airport"}
                                        </div>
                                      );
                                    }
                                    return filtered.map((c) => {
                                      const details = getCityDetails(c, language);
                                      const isSelected = form.to === c;
                                      return (
                                        <button
                                          key={c}
                                          type="button"
                                          title={details.fullName}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setForm(prev => ({ ...prev, to: c }));
                                            setToPickerOpen(false);
                                            setDestSearch("");
                                          }}
                                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                                            isSelected ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                          }`}
                                        >
                                          <div className="min-w-0 pr-2">
                                            <div className="text-xs font-bold flex items-center gap-1.5" title={details.fullName}>
                                              <span className="font-mono text-blue-600 bg-blue-100/60 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[10px] font-black">{details.code}</span>
                                              <span className="truncate">{details.cityName}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate mt-0.5" title={details.fullName}>
                                              {details.province} • {details.airportName}
                                            </div>
                                          </div>
                                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Vertical Divider between Cities and Departure Date */}
                        <div className="hidden lg:block w-px h-9 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0 self-center" />

                        {/* Departure & Return Dates Group */}
                        <div className="flex items-center gap-1 lg:gap-0 shrink-0">
                          {/* Departure Date Segment */}
                          <div
                            onClick={() => openDatePicker(departDateInputRef)}
                            className="relative flex-1 sm:flex-initial sm:w-40 lg:w-44 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0 select-none"
                          >
                            <input
                              ref={departDateInputRef}
                              id="flight-depart-date-input"
                              data-testid="flight-depart-date-input"
                              type="date"
                              name="departDate"
                              required
                              min={today}
                              value={form.departDate}
                              onClick={(e) => {
                                try {
                                  if (typeof (e.currentTarget as any).showPicker === "function") {
                                    (e.currentTarget as any).showPicker();
                                  }
                                } catch (err) {}
                              }}
                              onChange={(e) => {
                                const newDepart = e.target.value;
                                setForm(prev => ({
                                  ...prev,
                                  departDate: newDepart,
                                  returnDate: prev.returnDate && prev.returnDate <= newDepart ? "" : prev.returnDate,
                                }));
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 pointer-events-none">
                              <span className="font-mono font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white leading-none shrink-0">
                                {departDateParts.day}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                                  {departDateParts.month}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                                  {departDateParts.weekday}, {departDateParts.year}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Vertical Divider between Departure and Return Date */}
                          <div className="hidden lg:block w-px h-9 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0 self-center" />

                          {/* Return Date Segment */}
                          {tripType === "round" ? (
                            <div
                              onClick={() => openDatePicker(returnDateInputRef)}
                              className="relative flex-1 sm:flex-initial sm:w-40 lg:w-44 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0 select-none"
                            >
                              <input
                                ref={returnDateInputRef}
                                id="flight-return-date-input"
                                data-testid="flight-return-date-input"
                                type="date"
                                name="returnDate"
                                required
                                min={getNextDayString(form.departDate) || getNextDayString(today)}
                                value={form.returnDate}
                                onClick={(e) => {
                                  try {
                                    if (typeof (e.currentTarget as any).showPicker === "function") {
                                      (e.currentTarget as any).showPicker();
                                    }
                                  } catch (err) {}
                                }}
                                onChange={(e) => setForm(prev => ({ ...prev, returnDate: e.target.value }))}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                              />
                              <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 pointer-events-none">
                                <span className="font-mono font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 dark:text-white leading-none shrink-0">
                                  {returnDateParts.day}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                                    {returnDateParts.month}
                                  </div>
                                  <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                                    {returnDateParts.weekday}, {returnDateParts.year}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setTripType("round");
                                setTimeout(() => openDatePicker(returnDateInputRef), 60);
                              }}
                              className="flex-1 sm:flex-initial sm:w-40 lg:w-44 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex items-center justify-center text-slate-400 hover:text-blue-600 text-xs font-semibold shrink-0 select-none"
                            >
                              {t('flight.add_return_date')}
                            </div>
                          )}
                        </div>

                        {/* Blue Search Button */}
                        <div className="p-1 shrink-0 self-center w-full lg:w-auto mt-1 lg:mt-0">
                          <button
                            type="submit"
                            id="submit-flight-search"
                            className="w-full lg:w-14 h-12 lg:h-14 rounded-2xl bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-all cursor-pointer shrink-0 font-bold text-sm gap-2"
                            title={t('flight.search_flights') || "Search Flights"}
                          >
                            <Search className="w-5 h-5 text-white stroke-[2.5]" />
                            <span className="lg:hidden">{t('flight.search_flights') || "Search Flights"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Error text if same city */}
                      {form.from === form.to && (
                        <p className="mt-2 text-xs font-bold text-rose-500 text-left flex items-center gap-1">
                          <span>⚠️ {getSameCityErrorText(language)}</span>
                        </p>
                      )}
                    </>
                  )}

                  {/* Fare Types Row below inputs */}
                  <div className="flex items-center justify-between flex-wrap gap-4 mt-4 select-none">
                    <div className="flex items-center gap-5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="fareType"
                          checked={fareType === "regular"}
                          onChange={() => setFareType("regular")}
                          className="w-3.5 h-3.5 text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <span>{t('flight.fare_regular')}</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="fareType"
                          checked={fareType === "student"}
                          onChange={() => {
                            setFareType("student");
                            toast.success(
                              language === 'th'
                                ? 'ราคานักศึกษา: รวมสัมภาระเพิ่มฟรี 10 กก.!'
                                : 'Student Fare: 10kg extra baggage allowance included!'
                            );
                          }}
                          className="w-3.5 h-3.5 text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <span>{t('flight.fare_student')}</span>
                      </label>
                    </div>
                  </div>
                </form>
              </>
            )}

            {bookingStep === "select_flight" && (
              <div className="text-slate-800 dark:text-slate-200 text-left">
                {/* Back button */}
                <button
                  onClick={() => {
                    if (tripType === "multicity") {
                      if (activeLegIndex > 0) {
                        setActiveLegIndex(activeLegIndex - 1);
                      } else {
                        setBookingStep("search");
                      }
                    } else if (isReturnSelection) {
                      setIsReturnSelection(false);
                    } else {
                      setBookingStep("search");
                    }
                  }}
                  className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-white hover:!text-slate-500 dark:hover:!text-slate-400 transition-colors mb-4 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('flight.step_back')}
                </button>

                {/* Multi-City Leg Switcher Tabs */}
                {tripType === "multicity" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {multiCityLegs.map((leg, idx) => {
                      const isSelected = !!selectedMultiCityFlights[idx];
                      const isActive = activeLegIndex === idx;
                      const legFlight = selectedMultiCityFlights[idx];
                      const fromC = getAirportCode(leg.from) || "DMK";
                      const toC = getAirportCode(leg.to) || "CNX";
                      return (
                        <button
                          key={leg.id}
                          type="button"
                          onClick={() => {
                            setActiveLegIndex(idx);
                            setExpandedDetailsIndex(null);
                          }}
                          className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                            isActive
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                              : isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                              : "bg-slate-100/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-bold opacity-75">
                              {language === 'th' ? `เที่ยวบิน ${idx + 1}/${multiCityLegs.length}` : `Leg ${idx + 1}/${multiCityLegs.length}`}
                            </span>
                            {isSelected && <span className="text-[10px] font-bold text-emerald-600">✓</span>}
                          </div>
                          <div className="font-bold text-xs sm:text-sm font-mono">
                            {fromC} → {toC}
                          </div>
                          <div className="text-[10px] opacity-75 truncate">
                            {legFlight ? `${legFlight.airline.code} · ฿${legFlight.price.toLocaleString()}` : formatDate(leg.date, language)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Step Title */}
                {(() => {
                  const currentFlightList = tripType === "multicity"
                    ? getMockFlights(false, multiCityLegs[activeLegIndex]?.from, multiCityLegs[activeLegIndex]?.to)
                    : getMockFlights(isReturnSelection);

                  const originCityStr = tripType === "multicity"
                    ? multiCityLegs[activeLegIndex]?.from
                    : (isReturnSelection ? form.to : form.from);
                  const destCityStr = tripType === "multicity"
                    ? multiCityLegs[activeLegIndex]?.to
                    : (isReturnSelection ? form.from : form.to);

                  const fromCode = tripType === "multicity"
                    ? (getAirportCode(multiCityLegs[activeLegIndex]?.from) || "DMK")
                    : (getAirportCode(isReturnSelection ? form.to : form.from) || "DMK");

                  const toCode = tripType === "multicity"
                    ? (getAirportCode(multiCityLegs[activeLegIndex]?.to) || "CNX")
                    : (getAirportCode(isReturnSelection ? form.from : form.to) || "CNX");

                  const fromCityFull = getCityFullName(originCityStr, language);
                  const toCityFull = getCityFullName(destCityStr, language);

                  return (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-foreground/10 mb-6">
                        <div>
                          <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            {tripType === "multicity"
                              ? (language === 'th'
                                  ? `เที่ยวบินที่ ${activeLegIndex + 1}: ${getCityLabel(multiCityLegs[activeLegIndex]?.from || "")} → ${getCityLabel(multiCityLegs[activeLegIndex]?.to || "")}`
                                  : `Select Flight ${activeLegIndex + 1}: ${getCityLabel(multiCityLegs[activeLegIndex]?.from || "")} → ${getCityLabel(multiCityLegs[activeLegIndex]?.to || "")}`)
                              : isReturnSelection
                              ? t('flight.step_select_ret')
                              : t('flight.step_select_dep')
                            }
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {tripType === "multicity"
                              ? `${getCityLabel(multiCityLegs[activeLegIndex]?.from || "")} → ${getCityLabel(multiCityLegs[activeLegIndex]?.to || "")} · ${formatDate(multiCityLegs[activeLegIndex]?.date, language)}`
                              : isReturnSelection
                              ? `${getCityLabel(form.to)} → ${getCityLabel(form.from)} · ${formatDate(form.returnDate, language)}`
                              : `${getCityLabel(form.from)} → ${getCityLabel(form.to)} · ${formatDate(form.departDate, language)}`
                            }
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {t('flight.available_flights_count').replace('{count}', String(currentFlightList.length))}
                        </span>
                      </div>

                      {/* Filters / Sorting tabs */}
                      <div className="flex items-center justify-between gap-3 mb-5 select-none flex-wrap">
                        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-display">
                          {(["cheapest", "best", "quickest"] as const).map((filter) => (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => setActiveFilter(filter)}
                              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                activeFilter === filter
                                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              {filter === "cheapest" ? t('flight.filter_cheapest') :
                                filter === "quickest" ? t('flight.filter_quickest') :
                                  t('flight.filter_best')}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        >
                          {showAdvancedFilters ? t('flight.hide_filters') : t('flight.detailed_filters')}
                        </button>
                      </div>

                      {/* Collapsible Advanced Filters Panel */}
                      <AnimatePresence>
                        {showAdvancedFilters && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mb-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-4 text-xs"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* 1. Cabin Class */}
                              <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">{t('flight.cabin_class')}</span>
                                <div className="flex gap-1">
                                  {(["all", "economy", "business"] as const).map((cls) => (
                                    <button
                                      key={cls}
                                      type="button"
                                      onClick={() => setSelectedClass(cls)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                                        selectedClass === cls
                                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                      }`}
                                    >
                                      {cls === "all" ? t('flight.cabin_all') : cls === "economy" ? t('flight.cabin_economy') : t('flight.cabin_business')}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* 2. Time of Day */}
                              <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">{t('flight.depart_time')}</span>
                                <div className="flex gap-1 flex-wrap">
                                  {[
                                    { id: "morning", label: t('flight.time_morning') },
                                    { id: "afternoon", label: t('flight.time_afternoon') },
                                    { id: "evening", label: t('flight.time_evening') }
                                  ].map((tItem) => {
                                    const isChecked = selectedTimeOfDay.includes(tItem.id);
                                    return (
                                      <button
                                        key={tItem.id}
                                        type="button"
                                        onClick={() => {
                                          if (isChecked) {
                                            setSelectedTimeOfDay(selectedTimeOfDay.filter(x => x !== tItem.id));
                                          } else {
                                            setSelectedTimeOfDay([...selectedTimeOfDay, tItem.id]);
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          isChecked
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                      >
                                        {tItem.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 3. Airlines */}
                              <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">{t('flight.airlines')}</span>
                                <div className="flex gap-1 flex-wrap">
                                  {mockAirlines.map((al) => {
                                    const isChecked = selectedAirlines.includes(al.code);
                                    return (
                                      <button
                                        key={al.code}
                                        type="button"
                                        onClick={() => {
                                          if (isChecked) {
                                            setSelectedAirlines(selectedAirlines.filter(x => x !== al.code));
                                          } else {
                                            setSelectedAirlines([...selectedAirlines, al.code]);
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          isChecked
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                      >
                                        {al.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 4. Max Price */}
                              <div>
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{t('flight.max_price')}</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">฿{maxPrice.toLocaleString()}</span>
                                </div>
                                <input
                                  type="range"
                                  min={700}
                                  max={2500}
                                  step={50}
                                  value={maxPrice}
                                  onChange={(e) => setMaxPrice(+e.target.value)}
                                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                                />
                              </div>
                            </div>

                            {(selectedClass !== "all" || selectedTimeOfDay.length > 0 || selectedAirlines.length > 0 || maxPrice < 2500) && (
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMaxPrice(2500);
                                    setSelectedClass("all");
                                    setSelectedTimeOfDay([]);
                                    setSelectedAirlines([]);
                                  }}
                                  className="text-[11px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer underline"
                                >
                                  {t('flight.clear_filters')}
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Flight List */}
                      <div className="space-y-3">
                        {currentFlightList.length === 0 ? (
                          <div className="text-center py-12 px-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm font-display">
                              {!isRouteAvailable(originCityStr, destCityStr)
                                ? (language === 'th'
                                    ? `ไม่มีสายการบินรองรับเส้นทาง ${getCityLabel(originCityStr)} → ${getCityLabel(destCityStr)}`
                                    : `No airlines operate direct flights for ${getCityLabel(originCityStr)} → ${getCityLabel(destCityStr)}`)
                                : t('flight.no_flights')}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                              {!isRouteAvailable(originCityStr, destCityStr)
                                ? (language === 'th'
                                    ? `เส้นทางนี้ยังไม่มีเที่ยวบินตรงให้บริการในระบบ กรุณาสลับเมืองหรือเลือกสนามบินอื่น`
                                    : `There are currently no direct flights between these airports. Please select another route.`)
                                : t('flight.no_flights_desc')}
                            </p>
                            {isRouteAvailable(originCityStr, destCityStr) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMaxPrice(2500);
                                  setSelectedClass("all");
                                  setSelectedTimeOfDay([]);
                                }}
                                className="mt-4 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs cursor-pointer font-display"
                              >
                                {t('flight.clear_filters')}
                              </button>
                            )}
                          </div>
                        ) : (
                          currentFlightList.map((flight, idx) => {
                            const isExpanded = expandedDetailsIndex === idx;

                            return (
                              <div
                                key={flight.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-200 border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md"
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 md:gap-6">
                                  {/* 1. Airline Logo & Flight Code */}
                                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 md:min-w-[180px]">
                                    {flight.airline.code === 'BTN' ? (
                                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src={botnoiAirLogo} alt={flight.airline.name} className="w-full h-full object-contain" />
                                      </div>
                                    ) : flight.airline.code === 'THA' ? (
                                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#3b0764] via-[#581c87] to-[#7e22ce] text-white flex flex-col items-center justify-center shrink-0 shadow-2xs border border-purple-900/40">
                                        <span className="font-mono font-black text-xs leading-none text-amber-300">TG</span>
                                        <span className="text-[8px] font-bold text-white/90 uppercase tracking-tight mt-0.5">THAI</span>
                                      </div>
                                    ) : (
                                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white flex flex-col items-center justify-center shrink-0 shadow-2xs border border-sky-800/40">
                                        <span className="font-mono font-black text-xs leading-none text-white">PG</span>
                                        <span className="text-[7.5px] font-bold text-white/90 uppercase tracking-tight mt-0.5">BANGKOK</span>
                                      </div>
                                    )}

                                    <div className="min-w-0">
                                      <span className="font-display font-black text-sm text-slate-900 dark:text-white block leading-tight truncate">
                                        {flight.airline.name}
                                      </span>
                                      <span className="text-[11px] font-mono text-slate-400 mt-0.5 block truncate">
                                        {flight.flightNo} · {flight.aircraft.model} · {flight.class === "business" ? t('flight.cabin_business') : t('flight.cabin_economy')}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 2. Schedule: Depart — Duration — Arrive */}
                                  <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-md w-full justify-between">
                                    <div className="text-left">
                                      <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white block leading-none">
                                        {flight.departTime}
                                      </span>
                                      <span className="text-[11px] font-bold text-slate-500 uppercase mt-1 block">
                                        {fromCode}
                                      </span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center px-2">
                                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mb-1">
                                        {formatFlightDuration(flight.duration, language)}
                                      </span>
                                      <div className="w-full flex items-center gap-1.5">
                                        <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                          {t('flight.non_stop')}
                                        </span>
                                        <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white block leading-none">
                                        {flight.arrivalTime}
                                      </span>
                                      <span className="text-[11px] font-bold text-slate-500 uppercase mt-1 block">
                                        {toCode}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 3. Price & Action */}
                                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                                    <div className="text-left md:text-right">
                                      {flight.discount !== "None" && (
                                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">
                                          {flight.discount}
                                        </span>
                                      )}
                                      <span className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white block leading-none">
                                        ฿{flight.price.toLocaleString()}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">
                                        {t('flight.per_passenger')}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (tripType === "multicity") {
                                          const updated = [...selectedMultiCityFlights];
                                          updated[activeLegIndex] = flight;
                                          setSelectedMultiCityFlights(updated);
                                          if (activeLegIndex < multiCityLegs.length - 1) {
                                            setActiveLegIndex(activeLegIndex + 1);
                                            setExpandedDetailsIndex(null);
                                            document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                          } else {
                                            const allSelected = multiCityLegs.every((_, i) => updated[i]);
                                            if (allSelected) {
                                              setBookingStep("passenger_details");
                                              document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                            } else {
                                              const unselected = multiCityLegs.findIndex((_, i) => !updated[i]);
                                              if (unselected !== -1) {
                                                setActiveLegIndex(unselected);
                                                setExpandedDetailsIndex(null);
                                                document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                              }
                                            }
                                          }
                                        } else if (isReturnSelection) {
                                          setSelectedInboundFlight(flight);
                                          setBookingStep("passenger_details");
                                        } else {
                                          setSelectedOutboundFlight(flight);
                                          if (tripType === "round") {
                                            setIsReturnSelection(true);
                                            setExpandedDetailsIndex(null);
                                            document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                          } else {
                                            setBookingStep("passenger_details");
                                          }
                                        }
                                      }}
                                      id={`select-flight-${flight.flightNo}`}
                                      data-testid={`select-flight-${flight.flightNo}`}
                                      data-flight-no={flight.flightNo}
                                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-display font-bold text-xs hover:bg-sky-600 dark:hover:bg-sky-400 dark:hover:text-white transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0 whitespace-nowrap min-w-[70px] text-center"
                                    >
                                      {t('flight.select_this') || (language === 'th' ? 'เลือก' : 'Select')}
                                    </button>
                                  </div>
                                </div>

                                {/* Minimalist Details Trigger & Drawer */}
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                                  <button
                                    id={`flight-details-btn-${flight.flightNo}`}
                                    data-testid={`flight-details-btn-${flight.flightNo}`}
                                    type="button"
                                    onClick={() => setExpandedDetailsIndex(isExpanded ? null : idx)}
                                    className="text-xs sm:text-[11px] font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1.5 py-1.5 px-2.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                                  >
                                    <span>{isExpanded ? t('flight.flight_details_baggage_hide') : t('flight.flight_details_baggage_show')}</span>
                                    <span className="text-[10px] transform transition-transform duration-200 leading-none">{isExpanded ? '▲' : '▼'}</span>
                                  </button>
                                  <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                                    {fromCityFull.split('(')[0].trim()} → {toCityFull.split('(')[0].trim()}
                                  </span>
                                </div>

                                {isExpanded && (
                                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        {t('flight.baggage_free')}
                                      </span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-snug">
                                        {t('flight.baggage_rule')}
                                      </span>
                                    </div>
                                    <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        {t('flight.aircraft_cabin_title')}
                                      </span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-snug">
                                        {flight.aircraft.model} ({flight.aircraft.tailNumber})
                                      </span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">
                                        {language === 'th' ? `ความจุ 60 ที่นั่ง · ${flight.aircraft.type}` : `60 Seats · ${flight.aircraft.type}`}
                                      </span>
                                    </div>
                                    <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        {t('flight.inclusions_title')}
                                      </span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-snug">
                                        {t('flight.inclusions_desc')}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {bookingStep === "passenger_details" && (
              <div className="text-slate-800 dark:text-slate-200 text-left">
                {/* Back button */}
                <button
                  onClick={() => {
                    if (tripType === "multicity") {
                      setActiveLegIndex(multiCityLegs.length - 1);
                      setBookingStep("select_flight");
                    } else if (tripType === "round") {
                      setIsReturnSelection(true);
                      setBookingStep("select_flight");
                    } else {
                      setBookingStep("select_flight");
                    }
                  }}
                  className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-white hover:!text-slate-500 dark:hover:!text-slate-400 transition-colors mb-4 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('flight.back_to_selection')}
                </button>

                {/* Selected flights summary */}
                <div className="bg-sky-50/50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-3xl p-5 mb-6">
                  <h4 className="font-display font-black text-sm text-sky-950 dark:text-sky-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" />
                    {t('flight.summary_title')} {tripType === "multicity" ? (language === 'th' ? `(${multiCityLegs.length} เที่ยวบิน)` : `(${multiCityLegs.length} Flights)`) : ""}
                  </h4>
                  <div className="space-y-2 text-xs">
                    {tripType === "multicity" ? (
                      multiCityLegs.map((leg, idx) => {
                        const flight = selectedMultiCityFlights[idx];
                        const fromC = leg.from.match(/\(([A-Z]{3})\)/)?.[1] || "DMK";
                        const toC = leg.to.match(/\(([A-Z]{3})\)/)?.[1] || "CNX";
                        return (
                          <div key={leg.id} className="flex justify-between items-center py-1.5 border-b border-sky-100/50 dark:border-sky-800/50">
                            <span className="text-slate-500 dark:text-slate-400 font-display font-medium">
                              {language === 'th' ? `เที่ยวบินที่ ${idx + 1}` : `Flight ${idx + 1}`} ({fromC} → {toC} | {formatDate(leg.date, language)}):
                            </span>
                            <span className="font-bold text-sky-950 dark:text-white font-display flex items-center gap-1.5">
                              {flight?.airline.code === 'BTN' && <img src={botnoiAirLogo} alt="" className="w-4 h-4 object-contain inline" />}
                              {flight?.airline.name} ({flight?.flightNo}) · {flight?.departTime} (฿{(flight?.price || 0).toLocaleString()})
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="flex justify-between items-center py-1.5 border-b border-sky-100/50 dark:border-sky-800/50">
                          <span className="text-slate-500 dark:text-slate-400 font-display">{t('flight.summary_outbound')}:</span>
                          <span className="font-bold text-sky-950 dark:text-white font-display flex items-center gap-1.5">
                            {selectedOutboundFlight?.airline.code === 'BTN' && <img src={botnoiAirLogo} alt="" className="w-4 h-4 object-contain inline" />}
                            {selectedOutboundFlight?.airline.name} ({selectedOutboundFlight?.flightNo}) · {selectedOutboundFlight?.departTime}
                          </span>
                        </div>
                        {tripType === "round" && selectedInboundFlight && (
                          <div className="flex justify-between items-center py-1.5 border-b border-sky-100/50 dark:border-sky-800/50 font-display">
                            <span className="text-slate-500 dark:text-slate-400">{t('flight.summary_inbound')}:</span>
                            <span className="font-bold text-sky-950 dark:text-white flex items-center gap-1.5">
                              {selectedInboundFlight?.airline.code === 'BTN' && <img src={botnoiAirLogo} alt="" className="w-4 h-4 object-contain inline" />}
                              {selectedInboundFlight?.airline.name} ({selectedInboundFlight?.flightNo}) · {selectedInboundFlight?.departTime}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {(() => {
                      const promoRate = getPromoDiscountRate(form.promoCode);
                      const baseTotal = (tripType === "multicity"
                        ? selectedMultiCityFlights.reduce((sum, f) => sum + (f?.price || 0), 0) * form.passengers
                        : ((selectedOutboundFlight?.price || 0) + (selectedInboundFlight?.price || 0)) * form.passengers
                      );
                      const promoName = (form.promoCode || "").trim().toUpperCase();

                      return (
                        <>
                          <div className="flex justify-between items-center pt-2 text-sm font-display">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('flight.summary_fare_per_person')} × {form.passengers}:</span>
                            <span className={`font-extrabold ${promoRate > 0 ? "line-through text-slate-400 text-xs" : "text-sky-950 dark:text-white"}`}>
                              ฿{baseTotal.toLocaleString()}
                            </span>
                          </div>
                          {promoRate > 0 && (
                            <div className="flex justify-between items-center pt-1 text-sm font-display text-emerald-600 dark:text-emerald-400 font-bold">
                              <span className="text-xs">{promoName} (-{Math.round(promoRate * 100)}%):</span>
                              <span>
                                ฿{Math.round(baseTotal * (1 - promoRate)).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold mb-4 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  {t('flight.modal_passenger')}
                </h3>

                <form onSubmit={handlePassengerSubmit} className="grid md:grid-cols-2 gap-4">
                  {(() => {
                    const isNameInvalid = Boolean(passengerFormSubmitted && (!form.passengerName || !form.passengerName.trim()));
                    const isEmailInvalid = Boolean(passengerFormSubmitted && (!form.email || !form.email.trim() || !form.email.includes('@')));
                    const isPhoneInvalid = Boolean(
                      passengerFormSubmitted &&
                      (!form.phone || form.phone.trim().length !== 10)
                    );
                    const mySeats = (form.seat || "").split(",").map(s => s.trim()).filter(Boolean);
                    const isSeatInvalid = Boolean(
                      passengerFormSubmitted &&
                        allFlightLegs.some((_, idx) => {
                          const seats = (legSeats[idx] || (idx === 0 && allFlightLegs.length === 1 ? form.seat : ""))
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          return seats.length < form.passengers;
                        })
                    );

                    return (
                      <>
                        <Field
                          label={t('flight.passenger_name')}
                          htmlFor="passengerName"
                          required
                          isError={isNameInvalid}
                          errorText={isNameInvalid ? t('flight.err_name_required') : undefined}
                        >
                          <input
                            ref={passengerNameInputRef}
                            id="passengerName"
                            name="passengerName"
                            required
                            value={form.passengerName || ''}

                            // 1. ล้างตัวอักษรไทยออกทันทีหลังจากพิมพ์/ผสมคำเสร็จ
                            onCompositionEnd={(e) => {
                              const cleanValue = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, '');
                              setForm((prev) => ({ ...prev, passengerName: cleanValue }));
                            }}

                            // 2. รับค่าและกรองภาษาไทยออก (ใช้ Cast Type แก้ปัญหา TypeScript เรียบร้อย)
                            onChange={(e) => {
                              if (!(e.nativeEvent as InputEvent).isComposing) {
                                const cleanValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                setForm((prev) => ({ ...prev, passengerName: cleanValue }));
                              } else {
                                setForm((prev) => ({ ...prev, passengerName: e.target.value }));
                              }
                            }}

                            // 3. ป้องกันตอนหลุดโฟกัส (Blur) และตอน ก๊อปปี้วาง (Paste)
                            onBlur={(e) => {
                              const cleanValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                              setForm((prev) => ({ ...prev, passengerName: cleanValue }));
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pastedText = e.clipboardData.getData('text');
                              const cleanValue = pastedText.replace(/[^a-zA-Z\s]/g, '');
                              setForm((prev) => ({ ...prev, passengerName: (prev.passengerName || '') + cleanValue }));
                            }}

                            className="w-full bg-transparent outline-none font-bold text-slate-800 dark:text-slate-100 text-sm font-display placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal"
                            placeholder={t('flight.passenger_name_placeholder')}
                          />
                        </Field>

                        <Field
                          label={t('flight.email')}
                          htmlFor="email"
                          required
                          isError={isEmailInvalid}
                          errorText={isEmailInvalid ? t('flight.err_email_invalid') : undefined}
                        >
                          <input
                            ref={emailInputRef}
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={(e) => {
                              setForm({ ...form, email: e.target.value });
                            }}
                            className="w-full bg-transparent outline-none font-bold text-slate-800 dark:text-slate-100 text-sm font-display placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="you@email.com"
                          />
                        </Field>

                        <Field
                          label={t('flight.phone')}
                          htmlFor="phone"
                          required
                          isError={isPhoneInvalid}
                          errorText={isPhoneInvalid ? (t('flight.err_phone_length') || 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก') : undefined}
                        >
                          <input
                            ref={phoneInputRef}
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            required
                            value={form.phone || ''}
                            onChange={(e) => {
                              // คัดเอาเฉพาะตัวเลข (0-9) เท่านั้น และจำกัดไม่เกิน 10 หลัก
                              const cleanValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                              setForm((prev) => ({ ...prev, phone: cleanValue }));
                            }}
                            onPaste={(e) => {
                              // ป้องกันกรณีก๊อปปี้ข้อความที่มีตัวอักษรติดมาวาง
                              e.preventDefault();
                              const pastedText = e.clipboardData.getData('text');
                              const cleanValue = pastedText.replace(/[^0-9]/g, '');
                              setForm((prev) => ({ ...prev, phone: ((prev.phone || '') + cleanValue).slice(0, 10) }));
                            }}
                            className="w-full bg-transparent outline-none font-bold text-slate-800 dark:text-slate-100 text-sm font-display placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="08XXXXXXXX"
                          />
                        </Field>

                        {allFlightLegs.length > 1 ? (
                          <div
                            id="flight-seat-picker-open-btn"
                            data-testid="flight-seat-picker-open-btn"
                            ref={seatFieldRef}
                            className={`md:col-span-2 rounded-2xl p-4 border shadow-xs transition-all relative ${
                              isSeatInvalid
                                ? "border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/60 dark:bg-rose-950/40"
                                : "bg-[var(--input)] border-[var(--border)]"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider block text-[var(--muted-foreground)]">
                                  {t('flight.modal_seat')} ({language === 'th' ? `แยกเลือกที่นั่งตามเที่ยวบิน · ผู้โดยสาร ${form.passengers} ท่าน` : `Select per flight leg · ${form.passengers} Passenger(s)`})
                                </label>
                                <span className="text-rose-500 font-bold">*</span>
                              </div>
                              {isSeatInvalid && (
                                <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-200/80 dark:bg-rose-900/80 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                  {language === 'th' ? 'กรุณาเลือกที่นั่งให้ครบทุกเที่ยวบิน' : 'Select seats for all flights'}
                                </span>
                              )}
                            </div>

                            {/* List of Legs */}
                            <div className="space-y-2">
                              {allFlightLegs.map((leg, idx) => {
                                const legSeatsStr = legSeats[idx] || "";
                                const legSeatsArr = legSeatsStr.split(",").map((s) => s.trim()).filter(Boolean);
                                const isLegComplete = legSeatsArr.length === form.passengers;
                                const fromCode = getAirportCode(leg.from);
                                const toCode = getAirportCode(leg.to);

                                return (
                                  <div
                                    key={idx}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border transition-all ${
                                      isLegComplete
                                        ? "bg-sky-50/50 dark:bg-sky-950/30 border-sky-200/60 dark:border-sky-800/60"
                                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-sky-400"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                                        {idx + 1}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                                            {leg.label}: {fromCode} → {toCode}
                                          </span>
                                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                            ({leg.flightNo} · {leg.aircraftModel})
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                                          <span>{language === 'th' ? 'ที่นั่ง:' : 'Seat:'}</span>
                                          {isLegComplete ? (
                                            <span className="font-extrabold text-sky-600 dark:text-sky-400 bg-sky-100/80 dark:bg-sky-900/80 px-2 py-0.5 rounded-md">
                                              {legSeatsStr}
                                            </span>
                                          ) : (
                                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                                              {legSeatsArr.length > 0 ? `${legSeatsStr} (${legSeatsArr.length}/${form.passengers})` : (language === 'th' ? 'ยังไม่ได้เลือก' : 'Not selected')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      id={`flight-seat-picker-leg-btn-${idx}`}
                                      data-testid={`flight-seat-picker-leg-btn-${idx}`}
                                      onClick={() => {
                                        setSeatMapActiveLegIndex(idx);
                                        setSeatMapOpen(true);
                                      }}
                                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 self-end sm:self-center"
                                    >
                                      {isLegComplete ? (language === 'th' ? 'เปลี่ยนที่นั่ง' : 'Change') : (language === 'th' ? 'เลือกที่นั่ง' : 'Select Seat')}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {isSeatInvalid && (
                              <p className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <span>⚠️ {language === 'th' ? `กรุณาเลือกที่นั่งให้ครบทุกเที่ยวบิน (เที่ยวละ ${form.passengers} ที่นั่ง)` : `Please select ${form.passengers} seat(s) for each flight leg.`}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <Field
                            id="flight-seat-picker-open-btn"
                            dataTestId="flight-seat-picker-open-btn"
                            containerRef={seatFieldRef}
                            label={
                              <div className="flex items-center justify-between w-full">
                                <span>{t('flight.modal_seat')} ({form.passengers} {t('flight.seats_unit')})</span>
                                {form.seat && (
                                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold px-1.5 py-0.5 rounded bg-sky-500/10 dark:bg-sky-950/40">
                                    {mySeats.length}/{form.passengers} {t('flight.seats_unit')}
                                  </span>
                                )}
                              </div>
                            }
                            onClick={() => {
                              setSeatMapActiveLegIndex(0);
                              setSeatMapOpen(true);
                            }}
                            required
                            isError={isSeatInvalid}
                            errorText={
                              isSeatInvalid
                                ? (language === 'th'
                                    ? (mySeats.length === 0
                                        ? 'กรุณาเลือกที่นั่ง'
                                        : `กรุณาเลือกที่นั่งให้ครบ ${form.passengers} ที่นั่ง (เลือกแล้ว ${mySeats.length} ที่นั่ง)`)
                                    : (t('flight.seat_please_select') || `Please select ${form.passengers} seat(s)`))
                                : undefined
                            }
                          >
                            <div className="py-0.5 select-none font-display">
                              <span className={`font-bold text-sm truncate block ${form.seat ? "text-sky-600 dark:text-sky-400 font-extrabold" : "text-slate-500 dark:text-slate-400"}`}>
                                {form.seat || t('flight.not_selected_seats_hint').replace('{count}', String(form.passengers))}
                              </span>
                            </div>
                          </Field>
                        )}
                      </>
                    );
                  })()}

                  {/* Promo Code Field */}
                  {(() => {
                    const cleanPromo = (form.promoCode || '').trim().toUpperCase();
                    const promoRate = getPromoDiscountRate(cleanPromo);
                    const isValidPromo = promoRate > 0;
                    const isInvalidPromo = cleanPromo.length > 0 && !isValidPromo;

                    return (
                      <Field
                        label={
                          <div className="flex items-center justify-between w-full">
                            <span>{t('flight.modal_promo') || "Promo Code"}</span>
                            {isValidPromo && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-950/40">
                                ✓ {t('flight.discount_off').replace('{percent}', String(Math.round(promoRate * 100)))}
                              </span>
                            )}
                          </div>
                        }
                        htmlFor="promoCode"
                        isError={isInvalidPromo}
                        errorText={isInvalidPromo ? t('flight.invalid_promo_hint') : undefined}
                        className="md:col-span-2"
                      >
                        <input
                          id="promoCode"
                          name="promoCode"
                          type="text"
                          value={form.promoCode || ''}
                          onChange={(e) => {
                            setForm((prev) => ({ ...prev, promoCode: e.target.value.toUpperCase() }));
                          }}
                          className="w-full bg-transparent outline-none font-bold text-slate-800 dark:text-slate-100 text-sm font-display placeholder:text-slate-400 dark:placeholder:text-slate-500 uppercase"
                          placeholder={t('flight.promo_input_placeholder')}
                        />
                      </Field>
                    );
                  })()}

                  <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <button
                      type="submit"
                      id="submit-flight-booking"
                      className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-display font-bold text-sm shadow-md hover:from-sky-500 hover:to-indigo-500 hover:shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {t('flight.submit')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </section>

        {/* TOP DEALS SECTION matching ref.webp */}
        <section id="deals" className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-24 text-left">
          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('flight.deals_title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t('flight.deals_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Deal Card 1: Your next adventure begins */}
            <motion.article
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[24px] sm:rounded-[26px] aspect-[16/11] md:aspect-[4/3] shadow-lg border border-slate-200/60 dark:border-slate-800 group cursor-pointer"
              onClick={() => handleSelectPromo("กรุงเทพมหานคร (DMK)", "เชียงใหม่ (CNX)")}
            >
              <img
                src={promoChiangmai}
                alt={getCityDetails("เชียงใหม่ (CNX)", language).cityName}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent group-hover:from-slate-950/95 group-hover:via-slate-900/50 transition-all duration-500" />
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-white z-10">
                <div className="max-w-[85%]">
                  <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl leading-tight text-white drop-shadow-md">
                    {t('flight.deal1_title')}
                  </h3>
                </div>
                <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-all duration-300 ease-out opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <div className="overflow-hidden">
                    <div className="pt-2 sm:pt-3 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <div className="text-xs text-white/90 font-medium cursor-help" title={`${getCityFullName("กรุงเทพมหานคร (DMK)", language)} → ${getCityFullName("เชียงใหม่ (CNX)", language)}`}>
                        {getCityLabelForLang("กรุงเทพมหานคร (DMK)", language)} → {getCityLabelForLang("เชียงใหม่ (CNX)", language)}
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">{t('flight.starting_price')}</span>
                          <span className="font-display font-black text-xl sm:text-2xl text-white">฿690</span>
                        </div>
                        <button
                          type="button"
                          className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/30 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          {t('flight.btn_book_now')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Deal Card 2: Up to 50% Savings on Flights */}
            <motion.article
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[24px] sm:rounded-[26px] aspect-[16/11] md:aspect-[4/3] shadow-lg border border-slate-200/60 dark:border-slate-800 group cursor-pointer"
              onClick={() => handleSelectPromo("กรุงเทพมหานคร (DMK)", "ภูเก็ต (HKT)")}
            >
              <img
                src={promoPhuket}
                alt={getCityDetails("ภูเก็ต (HKT)", language).cityName}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent group-hover:from-slate-950/95 group-hover:via-slate-900/50 transition-all duration-500" />
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-white z-10">
                <div className="max-w-[85%]">
                  <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl leading-tight text-white drop-shadow-md">
                    {t('flight.deal2_title')}
                  </h3>
                </div>
                <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-all duration-300 ease-out opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <div className="overflow-hidden">
                    <div className="pt-2 sm:pt-3 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <div className="text-xs text-white/90 font-medium cursor-help" title={`${getCityFullName("กรุงเทพมหานคร (DMK)", language)} → ${getCityFullName("ภูเก็ต (HKT)", language)}`}>
                        {getCityLabelForLang("กรุงเทพมหานคร (DMK)", language)} → {getCityLabelForLang("ภูเก็ต (HKT)", language)}
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">{t('flight.starting_price')}</span>
                          <span className="font-display font-black text-xl sm:text-2xl text-white">฿890</span>
                        </div>
                        <button
                          type="button"
                          className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/30 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          {t('flight.btn_book_now')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Deal Card 3: Start your next journey */}
            <motion.article
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[24px] sm:rounded-[26px] aspect-[16/11] md:aspect-[4/3] shadow-lg border border-slate-200/60 dark:border-slate-800 group cursor-pointer"
              onClick={() => handleSelectPromo("กรุงเทพมหานคร (DMK)", "สงขลา (HDY)")}
            >
              <img
                src={promoHatyai}
                alt={getCityDetails("สงขลา (HDY)", language).cityName}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent group-hover:from-slate-950/95 group-hover:via-slate-900/50 transition-all duration-500" />
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-white z-10">
                <div className="max-w-[85%]">
                  <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl leading-tight text-white drop-shadow-md">
                    {t('flight.deal3_title')}
                  </h3>
                </div>
                <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-all duration-300 ease-out opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <div className="overflow-hidden">
                    <div className="pt-2 sm:pt-3 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <div className="text-xs text-white/90 font-medium cursor-help" title={`${getCityFullName("กรุงเทพมหานคร (DMK)", language)} → ${getCityFullName("สงขลา (HDY)", language)}`}>
                        {getCityLabelForLang("กรุงเทพมหานคร (DMK)", language)} → {getCityLabelForLang("สงขลา (HDY)", language)}
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">{t('flight.starting_price')}</span>
                          <span className="font-display font-black text-xl sm:text-2xl text-white">฿990</span>
                        </div>
                        <button
                          type="button"
                          className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/30 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          {t('flight.btn_book_now')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </section>


        {/* SPECIAL SERVICES */}
        <section className="border-t border-foreground/10 py-16 relative z-10 text-left">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-10 pb-6 border-b border-foreground/10">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                {t('flight.standard_inclusions_tag')}
              </p>
              <TypewriterHeading
                text={t('flight.about_heading')}
                className="font-display text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight mt-1 min-h-[36px]"
              />
              <p className="text-xs lg:text-sm text-foreground/60 max-w-xl mt-2 leading-relaxed">
                {t('flight.about_subheading')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-foreground/10">
              {/* Service 1: Baggage */}
              <div className="py-6 md:py-0 md:pr-8 lg:pr-10 first:pt-0 md:first:pt-0">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary mb-3">
                  {t('flight.service1_tag')}
                </span>
                <h3 className="font-display font-bold text-base text-foreground mb-2">
                  {t('flight.service1_title')}
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  {t('flight.service1_desc')}
                </p>
              </div>

              {/* Service 2: Snack */}
              <div className="py-6 md:py-0 md:px-8 lg:px-10">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                  {t('flight.service2_tag')}
                </span>
                <h3 className="font-display font-bold text-base text-foreground mb-2">
                  {t('flight.service2_title')}
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  {t('flight.service2_desc')}
                </p>
              </div>

              {/* Service 3: WebAvatar */}
              <div className="py-6 md:py-0 md:pl-8 lg:pl-10 last:pb-0 md:last:pb-0">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-3">
                  {t('flight.service3_tag')}
                </span>
                <h3 className="font-display font-bold text-base text-foreground mb-2">
                  {t('flight.service3_title')}
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  {t('flight.service3_desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="info" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
          <div className="mx-auto max-w-5xl px-6 grid md:grid-cols-3 gap-10 text-left">
            <div>
              <p className="font-display text-xl font-black text-white tracking-tight">BotnoiAir</p>
              <p className="text-xs opacity-75 mt-3 leading-relaxed">
                {t('flight.hero_desc')}
              </p>
            </div>
            <div>
              <p className="font-display font-bold mb-3 text-white text-sm">{t('flight.footer_services')}</p>
              <ul className="text-xs opacity-75 space-y-2.5">
                <li>{t('flight.nav_booking')}</li>
                <li>{t('flight.service1_title')}</li>
                <li>{t('flight.service2_title')}</li>
              </ul>
            </div>
            <div>
              <p className="font-display font-bold mb-3 text-white text-sm">{t('flight.nav_contact')}</p>
              <ul className="text-xs opacity-75 space-y-2.5">
                <li>{t('flight.contact_phone_24h')}</li>
                <li>support@botnoiair.example</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>

      {/* TICKET MODAL */}
      <TicketModal
        booking={ticketBooking}
        open={boardingPassOpen}
        onClose={() => {
          setBoardingPassOpen(false);
          const bookingSection = document.getElementById("booking");
          if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      />

      {/* SEAT MAP MODAL */}
      <SeatMapModal
        open={seatMapOpen}
        onClose={() => setSeatMapOpen(false)}
        legs={allFlightLegs}
        initialLegIndex={seatMapActiveLegIndex}
        selectedLegSeats={legSeats}
        onSaveLegSeats={handleSaveLegSeats}
        maxSeats={form.passengers}
      />
    </>
  );
}

function Field({ id, dataTestId, label, htmlFor, children, onClick, required, isError, errorText, className = "", containerRef }: { id?: string; dataTestId?: string; label: React.ReactNode; htmlFor?: string; children: React.ReactNode; onClick?: () => void; required?: boolean; isError?: boolean; errorText?: string; className?: string; containerRef?: React.Ref<HTMLDivElement> }) {
  const { language } = useTranslation();
  return (
    <div
      id={id}
      data-testid={dataTestId || id}
      ref={containerRef}
      onClick={onClick}
      className={`block rounded-2xl px-4 py-3.5 border shadow-xs transition-all relative ${className} ${
        isError
          ? "border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/60 dark:bg-rose-950/40"
          : "bg-[var(--input)] border-[var(--border)] " + (onClick
          ? "cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/80 hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-md"
          : "focus-within:border-[var(--primary)] focus-within:shadow-md focus-within:ring-1 focus-within:ring-[var(--primary)]/20")
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <label htmlFor={htmlFor} className={`text-[10px] font-bold uppercase tracking-wider block cursor-pointer select-none ${isError ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-[var(--muted-foreground)]'}`}>
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
        {isError && (
          <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-200/80 dark:bg-rose-900/80 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            {errorText ? (language === 'th' ? 'ไม่ถูกต้อง' : 'Invalid') : (language === 'th' ? 'เลือกเมืองซ้ำกันไม่ได้' : 'Cannot select same city')}
          </span>
        )}
      </div>
      <div className="mt-1">{children}</div>
      {isError && errorText && (
        <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <span>⚠️ {errorText}</span>
        </p>
      )}
    </div>
  );
}

function TicketModal({ booking, open, onClose }: { booking: any, open: boolean, onClose: () => void }) {
  const { t, language } = useTranslation();
  const [activeLeg, setActiveLeg] = useState(0);

  useEffect(() => {
    setActiveLeg(0);
  }, [open, booking]);

  if (!booking) return null;

  const hasMultipleLegs = Array.isArray(booking.legs) && booking.legs.length > 1;
  const currentLeg = hasMultipleLegs ? booking.legs[activeLeg] || booking.legs[0] : (booking.legs?.[0] || null);

  const getCode = (city: string) => getAirportCode(city) || (city || "").match(/\(([A-Z]{3})\)/)?.[1] || "DMK";
  const getCleanCity = (city: string) => {
    return getCityDetails(city || "", language).cityName;
  };

  const originCity = currentLeg ? currentLeg.from : booking.from;
  const destCity = currentLeg ? currentLeg.to : booking.to;

  const flightNumber = currentLeg?.flightNo || (activeLeg === 1 && booking.inboundFlightNo ? booking.inboundFlightNo : booking.outboundFlightNo) || "BTN203";
  const aircraftModel = currentLeg?.aircraftModel || (activeLeg === 1 && booking.inboundAircraftModel ? booking.inboundAircraftModel : booking.aircraftModel) || "Airbus A320-200";
  const aircraftTail = currentLeg?.aircraftTail || (activeLeg === 1 && booking.inboundAircraftTail ? booking.inboundAircraftTail : booking.aircraftTail) || "";
  const seatNumber = currentLeg?.seat || (activeLeg === 1 && booking.returnSeat ? booking.returnSeat : booking.seat) || "8C";
  const flightClass = (currentLeg?.class || booking.class) === "business" ? t('flight.cabin_business') : t('flight.cabin_economy');

  const basePrice = booking.pricePerPax || (hasMultipleLegs ? booking.legs.reduce((sum: number, l: any) => sum + (l.price || 0), 0) : 890);
  const totalPrice = basePrice * (booking.passengers || 1);

  // Calculate discount from promo codes (e.g. SKYPROMO2026, PROMO2026)
  const promoUpper = (booking.promoCode || "").trim().toUpperCase();
  const discountPercent = getPromoDiscountRate(promoUpper);
  const discountAmount = totalPrice * discountPercent;
  const finalPrice = totalPrice - discountAmount;

  const getArrivalTime = (departTime: string) => {
    if (!departTime) return language === 'th' ? "11:45 น." : "11:45 AM";
    const [h, m] = departTime.split(':').map(Number);
    let newH = h + 1;
    let newM = m + 15;
    if (newM >= 60) {
      newH += 1;
      newM -= 60;
    }
    const h24 = newH.toString().padStart(2, '0');
    const mStr = newM.toString().padStart(2, '0');
    if (language === 'th') {
      return `${h24}:${mStr} น.`;
    }
    const suffix = newH >= 12 ? 'PM' : 'AM';
    const displayH = newH > 12 ? newH - 12 : newH;
    return `${displayH.toString().padStart(2, '0')}:${mStr} ${suffix}`;
  };

  const legDepartDate = currentLeg ? currentLeg.departDate : (activeLeg === 1 && booking.returnDate ? booking.returnDate : booking.departDate);
  const outboundDepart = currentLeg ? (currentLeg.departTime || "07:30") : (activeLeg === 1 ? (booking.inboundTime || "09:00") : (booking.outboundTime || "07:30"));
  const outboundArrive = currentLeg?.arrivalTime || getArrivalTime(outboundDepart);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        onPointerDownOutside={() => onClose()}
        onInteractOutside={() => onClose()}
        className="max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-200 dark:border-slate-800 p-0 max-w-[calc(100vw-1.5rem)] sm:max-w-md bg-[#eef6fc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl font-display"
      >
        <div className="p-4 sm:p-7 relative select-none">

          {/* Header branding (Top center) */}
          <div className="flex justify-between items-center mb-3 sm:mb-4 pr-8">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg text-sky-950 dark:text-sky-100 tracking-tight">BotnoiAir</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-sky-900/60 dark:text-sky-200 bg-sky-200/40 dark:bg-sky-900/40 px-2.5 py-1 rounded-full">
              {t('flight.boarding_pass_tag')}
            </div>
          </div>

          {/* Multi-Leg Switcher */}
          {hasMultipleLegs && (
            <div className="mb-4">
              <div
                className={`grid ${
                  booking.legs.length === 2
                    ? "grid-cols-2"
                    : booking.legs.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4"
                } gap-1.5 p-1 rounded-xl bg-sky-100/70 dark:bg-slate-800/80 border border-sky-200/60 dark:border-slate-700/60`}
              >
                {booking.legs.map((leg: any, idx: number) => {
                  const isSelected = activeLeg === idx;
                  const fromCode = getCode(leg.from);
                  const toCode = getCode(leg.to);
                  const legLabel = booking.tripType === "round"
                    ? (idx === 0 ? (language === 'th' ? "ขาไป" : "Outbound") : (language === 'th' ? "ขากลับ" : "Return"))
                    : (language === 'th' ? `เที่ยวบิน ${idx + 1}` : `Flight ${idx + 1}`);

                  return (
                    <button
                      key={idx}
                      type="button"
                      id={`ticket-modal-leg-tab-${idx}`}
                      data-testid={`ticket-modal-leg-tab-${idx}`}
                      title={legLabel}
                      onClick={() => setActiveLeg(idx)}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold tracking-tight transition-colors cursor-pointer flex items-center justify-center gap-1 truncate ${
                        isSelected
                          ? "bg-[#0066FF] dark:bg-sky-600 text-white shadow-xs font-extrabold"
                          : "bg-white/80 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-white border border-slate-200/60 dark:border-slate-700/60"
                      }`}
                    >
                      <span className="opacity-75">{idx + 1}.</span>
                      <span className="font-mono">{fromCode}→{toCode}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Route Display */}
          <div className="flex justify-between items-end mb-1">
            <div title={getCityFullName(originCity, language)}>
              <div className="text-3xl sm:text-4xl font-black font-display text-sky-950 dark:text-sky-100 tracking-tight leading-none cursor-help" title={getCityFullName(originCity, language)}>{getCode(originCity)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 cursor-help underline decoration-dotted underline-offset-2" title={getCityFullName(originCity, language)}>{getCleanCity(originCity)}</div>
            </div>
            <div className="text-right" title={getCityFullName(destCity, language)}>
              <div className="text-3xl sm:text-4xl font-black font-display text-sky-950 dark:text-sky-100 tracking-tight leading-none cursor-help" title={getCityFullName(destCity, language)}>{getCode(destCity)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 cursor-help underline decoration-dotted underline-offset-2" title={getCityFullName(destCity, language)}>{getCleanCity(destCity)}</div>
            </div>
          </div>

          {/* Connection line with Plane icon */}
          <div className="flex items-center w-full my-3 sm:my-5 relative">
            <div className="w-4 h-4 rounded-full bg-sky-200 dark:bg-sky-900/60 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400"></div>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-sky-200/80 dark:border-sky-800/80 mx-2"></div>
            <div className="px-2 text-sky-950 dark:text-sky-200 shrink-0 transform rotate-45">
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 fill-current stroke-[1.5]" />
            </div>
            <div className="flex-1 border-t-2 border-dashed border-sky-200/80 dark:border-sky-800/80 mx-2"></div>
            <div className="w-4 h-4 rounded-full bg-sky-200 dark:bg-sky-900/60 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400"></div>
            </div>
          </div>

          {/* Depart & Arrive details */}
          <div className="grid grid-cols-3 gap-2 mb-4 sm:mb-6">
            <div className="text-left">
              <div className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">{t('flight.modal_depart')}</div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                {(() => {
                  const p = parseDateForCard(legDepartDate, 0, language);
                  return `${p.day} ${p.month} ${p.year}`;
                })()}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'th' ? `${outboundDepart} น.` : outboundDepart}
              </div>
            </div>
            <div className="text-center flex flex-col justify-center">
              <div className="font-extrabold text-xs text-slate-700 dark:text-slate-300 font-mono">{flightNumber}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                {aircraftModel}
              </div>
              {aircraftTail && (
                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                  ({aircraftTail})
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">
                {t('flight.modal_arrive')}
              </div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                {(() => {
                  const p = parseDateForCard(legDepartDate, 0, language);
                  return `${p.day} ${p.month} ${p.year}`;
                })()}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {outboundArrive}
              </div>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="border-t border-dashed border-sky-200/80 dark:border-sky-800/80 my-3 sm:my-5"></div>

          {/* Passenger details grid */}
          <div className="grid grid-cols-3 gap-y-3 sm:gap-y-4 gap-x-2 text-left mb-4 sm:mb-6">
            <div className="col-span-2">
              <p className="text-[9px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">{t('flight.modal_passenger')}</p>
              <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate pr-2">{booking.passengerName}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">{t('flight.modal_seat')}</p>
              <p className="font-bold text-xs sm:text-sm text-sky-700 dark:text-sky-300 font-mono">{seatNumber}</p>
            </div>

            <div className="col-span-2">
              <p className="text-[9px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">{t('flight.modal_class_status')}</p>
              <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{flightClass} / {t('flight.status_confirmed')}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">{t('flight.modal_passengers_num')}</p>
              <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{booking.passengers}</p>
            </div>
          </div>

          {/* Barcode and price */}
          <div className="border-t border-dashed border-sky-200/80 dark:border-sky-800/80 pt-3 sm:pt-5 mt-3 sm:mt-5 flex justify-between items-center">
            <div className="text-left">
              <div className="text-[9px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">{t('flight.total_fare')}</div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-black text-sky-950 dark:text-sky-100">฿{finalPrice.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-400">/{booking.passengers} {t('flight.pax_suffix')}</span>
                </div>
                {discountAmount > 0 && (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                    ({t('flight.saved_amount')} ฿{discountAmount.toLocaleString()} via {promoUpper})
                  </span>
                )}
              </div>
            </div>

            {/* Barcode mockup */}
            <div className="h-8 sm:h-9 w-24 sm:w-32 opacity-80 dark:invert" style={{ background: "repeating-linear-gradient(95deg, #1e293b, #1e293b 2px, transparent 2px, transparent 4px, #1e293b 4px, #1e293b 6px, transparent 6px, transparent 10px, #1e293b 10px, #1e293b 14px, transparent 14px, transparent 16px)" }}></div>
          </div>

          {/* Close button at the bottom */}
          <div className="mt-5 sm:mt-8 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              id="confirm-ticket-modal"
              className="w-full py-2.5 sm:py-3 bg-sky-950 dark:bg-sky-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-sky-900 dark:hover:bg-sky-500 active:scale-98 transition-all cursor-pointer"
            >
              {t('flight.modal_close')}
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

export interface SeatMapLegInfo {
  legIndex: number;
  label: string;
  from: string;
  to: string;
  departDate?: string;
  flightNo: string;
  aircraftModel: string;
  aircraftTail: string;
  cabinClass?: string;
  departTime?: string;
  arrivalTime?: string;
  airlineName?: string;
  airlineCode?: string;
  price?: number;
}

interface SeatMapModalProps {
  open: boolean;
  onClose: () => void;
  legs: SeatMapLegInfo[];
  initialLegIndex?: number;
  selectedLegSeats: Record<number, string>;
  onSaveLegSeats: (legSeats: Record<number, string>) => void;
  maxSeats?: number;
}

function SeatMapModal({
  open,
  onClose,
  legs,
  initialLegIndex = 0,
  selectedLegSeats,
  onSaveLegSeats,
  maxSeats = 1,
}: SeatMapModalProps) {
  const { t, language } = useTranslation();
  const getCode = (city: string) => getAirportCode(city) || (city || "").match(/\(([A-Z]{3})\)/)?.[1] || "DMK";

  const [activeModalLeg, setActiveModalLeg] = useState(0);
  const [tempLegSeats, setTempLegSeats] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      setTempLegSeats({ ...selectedLegSeats });
      setActiveModalLeg(initialLegIndex >= 0 && initialLegIndex < legs.length ? initialLegIndex : 0);
    }
  }, [open, selectedLegSeats, initialLegIndex, legs.length]);

  const currentLeg: SeatMapLegInfo = legs[activeModalLeg] || legs[0] || {
    legIndex: 0,
    label: "Flight 1",
    from: "DMK",
    to: "CNX",
    flightNo: "BTN201",
    aircraftModel: "Airbus A320-200",
    aircraftTail: "HS-BNA",
    cabinClass: "economy",
  };

  const currentSeats = useMemo(() => {
    return (tempLegSeats[activeModalLeg] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [tempLegSeats, activeModalLeg]);

  // Dynamic list of occupied seats combining admin locked seats & bookings from storage
  const OCCUPIED_SEATS = useMemo(() => {
    if (!open) return [];
    const flightNo = currentLeg.flightNo;
    const curOrigCode = getAirportCode(currentLeg.from);
    const curDestCode = getAirportCode(currentLeg.to);
    const adminLocked = getLockedSeats(flightNo);
    const existing = getBookings();

    const booked = existing
      .filter((b: Booking) => {
        if (flightNo && (b.outboundFlightNo === flightNo || b.inboundFlightNo === flightNo || b.legs?.some((l) => l.flightNo === flightNo))) {
          return true;
        }
        if (b.legs && b.legs.length > 0) {
          return b.legs.some((l) => {
            const lOrig = getAirportCode(l.from);
            const lDest = getAirportCode(l.to);
            return lOrig === curOrigCode && lDest === curDestCode;
          });
        }
        const bOrig = getAirportCode(b.from);
        const bDest = getAirportCode(b.to);
        if (bOrig === curOrigCode && bDest === curDestCode) return true;
        if (b.tripType === "round" && bOrig === curDestCode && bDest === curOrigCode) return true;
        return false;
      })
      .flatMap((b: Booking) => {
        const seats: string[] = [];
        if (b.legs && b.legs.length > 0) {
          const leg = b.legs.find((l) => {
            const lOrig = getAirportCode(l.from);
            const lDest = getAirportCode(l.to);
            return (flightNo && l.flightNo === flightNo) || (lOrig === curOrigCode && lDest === curDestCode);
          });
          if (leg && leg.seat) {
            seats.push(...leg.seat.split(",").map((s) => s.trim()));
          }
        }
        if (b.tripType === "round" && getAirportCode(b.to) === curOrigCode && getAirportCode(b.from) === curDestCode) {
          if (b.returnSeat) {
            seats.push(...b.returnSeat.split(",").map((s) => s.trim()));
          }
        }
        if (getAirportCode(b.from) === curOrigCode && getAirportCode(b.to) === curDestCode) {
          if (b.seat) {
            seats.push(...b.seat.split(",").map((s) => s.trim()));
          }
        } else if (!b.legs && b.seat && b.outboundFlightNo === flightNo) {
          seats.push(...b.seat.split(",").map((s) => s.trim()));
        }
        return seats.filter(Boolean);
      });

    return Array.from(new Set([...adminLocked, ...booked]));
  }, [currentLeg, open]);

  // Cabin Type & Configuration (Dynamic Layout based on Real Aircraft Models)
  const cabinType: CabinType = useMemo(() => {
    return getAircraftCabinType(currentLeg.aircraftModel);
  }, [currentLeg.aircraftModel]);

  const cabinConfig = useMemo(() => {
    if (cabinType === "turboprop") {
      // ATR 72-600 Regional Turboprop: 2-2 Layout with 15 Rows (No Middle Seats!)
      return {
        type: "turboprop" as const,
        rows: Array.from({ length: 15 }, (_, i) => i + 1),
        leftCols: ["A", "C"],
        centerCols: [] as string[],
        rightCols: ["D", "F"],
        hasTwinAisle: false,
        containerWidth: "w-full max-w-[280px] sm:max-w-[320px]",
        btnSize: "w-7 h-7 sm:w-8 sm:h-8 min-w-[28px] min-h-[28px] max-w-[28px] max-h-[28px] sm:min-w-[32px] sm:min-h-[32px] sm:max-w-[32px] sm:max-h-[32px]",
        textSize: "text-[8.5px] sm:text-[10px]",
        layoutLabel: language === "th" ? "ที่นั่งแบบ 2 - 2 (ไม่มีที่นั่งตรงกลาง)" : "2 - 2 Layout (No Middle Seats)",
      };
    }
    if (cabinType === "widebody") {
      // Wide-body Jet (B777, B787, A350): Twin-Aisle 2-4-2 Layout with 8 Rows
      return {
        type: "widebody" as const,
        rows: Array.from({ length: 8 }, (_, i) => i + 1),
        leftCols: ["A", "B"],
        centerCols: ["D", "E", "F", "G"],
        rightCols: ["J", "K"],
        hasTwinAisle: true,
        containerWidth: "w-full max-w-[330px] sm:max-w-[420px]",
        btnSize: "w-6 h-6 sm:w-7.5 sm:h-7.5 min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] sm:min-w-[30px] sm:min-h-[30px] sm:max-w-[30px] sm:max-h-[30px]",
        textSize: "text-[7px] sm:text-[9px]",
        layoutLabel: language === "th" ? "ทางเดินคู่ Twin-Aisle 2 - 4 - 2 (ลำตัวกว้าง)" : "Twin-Aisle 2 - 4 - 2 Layout (Wide-body)",
      };
    }
    // Narrow-body Jet (Airbus A320/A321neo, Boeing 737-800): 3-3 Single-Aisle with 10 Rows
    return {
      type: "narrowbody" as const,
      rows: Array.from({ length: 10 }, (_, i) => i + 1),
      leftCols: ["A", "B", "C"],
      centerCols: [] as string[],
      rightCols: ["D", "E", "F"],
      hasTwinAisle: false,
      containerWidth: "w-full max-w-[310px] sm:max-w-[360px]",
      btnSize: "w-7 h-7 sm:w-8 sm:h-8 min-w-[28px] min-h-[28px] max-w-[28px] max-h-[28px] sm:min-w-[32px] sm:min-h-[32px] sm:max-w-[32px] sm:max-h-[32px]",
      textSize: "text-[8px] sm:text-[10px]",
      layoutLabel: language === "th" ? "ที่นั่งแบบ 3 - 3 ทางเดินเดี่ยว" : "3 - 3 Single-Aisle Layout",
    };
  }, [cabinType, language]);

  const isSeatBusiness = (seatId: string) => {
    const rowNum = parseInt(seatId, 10);
    return cabinType === "widebody" ? rowNum <= 3 : rowNum <= 2;
  };

  const bookingClass = currentLeg.cabinClass || "economy";

  const handleSeatClick = (seatId: string) => {
    if (OCCUPIED_SEATS.includes(seatId)) return;

    const isBusiness = isSeatBusiness(seatId);
    if (isBusiness && bookingClass === "economy") {
      toast.error(
        language === "th"
          ? `ที่นั่ง ${seatId} เป็นชั้นธุรกิจ (Business Class) สำหรับผู้โดยสารตั๋วชั้นธุรกิจเท่านั้น`
          : `Seat ${seatId} is Business Class, reserved for Business Class tickets only.`
      );
      return;
    }

    let updatedLegSeats: string[] = [];
    if (currentSeats.includes(seatId)) {
      updatedLegSeats = currentSeats.filter((s) => s !== seatId);
    } else {
      if (maxSeats === 1) {
        updatedLegSeats = [seatId];
      } else if (currentSeats.length < maxSeats) {
        updatedLegSeats = [...currentSeats, seatId];
      } else {
        updatedLegSeats = [...currentSeats.slice(1), seatId];
      }
    }

    const sorted = [...updatedLegSeats].sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });

    setTempLegSeats((prev) => ({
      ...prev,
      [activeModalLeg]: sorted.join(", "),
    }));
  };

  const handleSaveAndClose = () => {
    onSaveLegSeats(tempLegSeats);
    onClose();
  };

  const isCurrentLegComplete = currentSeats.length === maxSeats;
  const remainingSeats = maxSeats - currentSeats.length;

  const allLegsComplete = legs.every((_, idx) => {
    const s = (tempLegSeats[idx] || "").split(",").map((x) => x.trim()).filter(Boolean);
    return s.length === maxSeats;
  });

  const renderSeatBtn = (seatId: string) => {
    const isOccupied = OCCUPIED_SEATS.includes(seatId);
    const isSelected = currentSeats.includes(seatId);
    const isBusiness = isSeatBusiness(seatId);
    const isRestricted = isBusiness && bookingClass === "economy";

    let btnStyle = "";
    if (isOccupied) {
      btnStyle = "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400/60 dark:text-slate-500 line-through cursor-not-allowed";
    } else if (isSelected) {
      btnStyle = "bg-[#0066FF] dark:bg-sky-500 border-[#0052cc] dark:border-sky-400 text-white font-bold shadow-xs ring-2 ring-sky-300 dark:ring-sky-500";
    } else if (isRestricted) {
      btnStyle = "bg-sky-50/70 dark:bg-sky-950/40 border-sky-200/70 dark:border-sky-800/50 text-sky-400/80 dark:text-sky-600/80 cursor-not-allowed hover:border-rose-300 hover:text-rose-500";
    } else if (isBusiness) {
      btnStyle = "bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-600 text-sky-800 dark:text-sky-200 font-bold hover:bg-sky-200 dark:hover:bg-sky-900 shadow-2xs";
    } else {
      btnStyle = "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 shadow-2xs";
    }

    return (
      <button
        key={seatId}
        id={`flight-seat-btn-${seatId}`}
        data-testid={`seat-btn-${seatId}`}
        data-seat-id={seatId}
        type="button"
        disabled={isOccupied}
        onClick={() => handleSeatClick(seatId)}
        className={`${cabinConfig.btnSize} rounded-full ${cabinConfig.textSize} font-bold border transition-colors cursor-pointer flex items-center justify-center shrink-0 touch-manipulation select-none ${btnStyle}`}
        title={
          isOccupied
            ? `${seatId} (${t('flight.seat_occupied')})`
            : isRestricted
            ? `${seatId} (${language === "th" ? "ชั้นธุรกิจ - เฉพาะตั๋ว Business" : "Business Class - Business ticket only"})`
            : `${seatId} (${isBusiness ? (language === "th" ? "ชั้นธุรกิจ" : "Business Class") : (language === "th" ? "ชั้นประหยัด" : "Economy Class")})`
        }
      >
        {seatId}
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleSaveAndClose(); }}>
      <DialogContent
        onPointerDownOutside={() => handleSaveAndClose()}
        onInteractOutside={() => handleSaveAndClose()}
        className={`max-h-[92vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-0 max-w-[calc(100vw-1rem)] ${
          legs.length >= 3 ? "sm:max-w-xl" : "sm:max-w-lg"
        } bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl`}
      >
        <div className="p-3.5 sm:p-6 relative select-none flex flex-col">
          {/* Header */}
          <div className="text-center mb-2.5 sm:mb-3">
            <h3 className="font-display font-black text-lg sm:text-xl text-sky-950 dark:text-white tracking-tight">
              {t('flight.seat_picker_title')}
            </h3>

            {/* Multi-Leg Tabs Switcher if > 1 leg */}
            {legs.length > 1 && (
              <div className="mt-2.5 mb-3 w-full">
                <div
                  className={`grid ${
                    legs.length === 2
                      ? "grid-cols-2"
                      : legs.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-4"
                  } gap-1.5 sm:gap-2 p-1 rounded-xl sm:rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 w-full`}
                >
                  {legs.map((leg, idx) => {
                    const isSelected = activeModalLeg === idx;
                    const legSeatsStr = tempLegSeats[idx] || "";
                    const legSeatsCount = legSeatsStr
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean).length;
                    const isLegDone = legSeatsCount === maxSeats;
                    const fromCode = getAirportCode(leg.from);
                    const toCode = getAirportCode(leg.to);

                    return (
                      <button
                        key={idx}
                        type="button"
                        id={`seatmap-leg-tab-${idx}`}
                        data-testid={`seatmap-leg-tab-${idx}`}
                        onClick={() => setActiveModalLeg(idx)}
                        className={`min-w-0 w-full h-8 sm:h-9 px-2 rounded-lg sm:rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between gap-1 select-none overflow-hidden border ${
                          isSelected
                            ? "bg-[#0066FF] dark:bg-sky-600 text-white border-[#0066FF] dark:border-sky-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-1 min-w-0 truncate">
                          <span
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full text-[8px] sm:text-[9px] font-mono font-bold shrink-0 flex items-center justify-center ${
                              isSelected
                                ? "bg-white/25 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-tight truncate">
                            {fromCode}→{toCode}
                          </span>
                        </div>

                        {isLegDone ? (
                          <span
                            className={`text-[8px] sm:text-[9px] font-extrabold px-1 py-0.5 rounded-md shrink-0 font-mono ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            }`}
                          >
                            ✓ {legSeatsStr}
                          </span>
                        ) : (
                          <span
                            className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded-md shrink-0 font-mono ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {legSeatsCount}/{maxSeats}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono mt-1 flex-wrap">
              <span className="font-extrabold text-sky-700 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-950/70 px-2 py-0.5 rounded-lg border border-sky-200/60 dark:border-sky-800/60">
                {currentLeg.flightNo}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {currentLeg.aircraftModel}
              </span>
              {currentLeg.aircraftTail && (
                <span className="text-slate-500 dark:text-slate-400">
                  ({currentLeg.aircraftTail})
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium flex items-center justify-center gap-1.5">
              <span
                title={getCityFullName(currentLeg.from, language)}
                className="cursor-help underline decoration-dotted underline-offset-2 font-semibold"
              >
                {getCityDetails(currentLeg.from, language).cityName} ({getCode(currentLeg.from)})
              </span>
              <span className="text-slate-400">→</span>
              <span
                title={getCityFullName(currentLeg.to, language)}
                className="cursor-help underline decoration-dotted underline-offset-2 font-semibold"
              >
                {getCityDetails(currentLeg.to, language).cityName} ({getCode(currentLeg.to)})
              </span>
            </div>

            {/* Aircraft Layout, Ticket Class & Passenger Count Badges */}
            <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {cabinConfig.layoutLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {language === "th"
                  ? `ตั๋ว: ${bookingClass === "business" ? "ชั้นธุรกิจ" : "ชั้นประหยัด"}`
                  : `Ticket: ${bookingClass === "business" ? "Business" : "Economy"}`}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300">
                <span>{t('flight.passengers_count_label').replace('{count}', String(maxSeats))}</span>
                <span>•</span>
                <span>{t('flight.selected_seats_status').replace('{selected}', String(currentSeats.length)).replace('{max}', String(maxSeats))}</span>
              </span>
            </div>
          </div>

          {/* Seat Legend (Clean, Borderless, Small Fixed Dimensions) */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-[10px] sm:text-xs mb-3 sm:mb-5 py-0.5 px-0.5 select-none">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 min-w-[10px] min-h-[10px] max-w-[10px] max-h-[10px] sm:min-w-[12px] sm:min-h-[12px] sm:max-w-[12px] sm:max-h-[12px] rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-400 dark:border-sky-600 shrink-0 block"></span>
              <span className="text-sky-800 dark:text-sky-300 font-bold text-[10px] sm:text-[11px] whitespace-nowrap">
                {language === "th" ? "ชั้นธุรกิจ (Business)" : "Business"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 min-w-[10px] min-h-[10px] max-w-[10px] max-h-[10px] sm:min-w-[12px] sm:min-h-[12px] sm:max-w-[12px] sm:max-h-[12px] rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shrink-0 block"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium text-[10px] sm:text-[11px] whitespace-nowrap">
                {language === "th" ? "ชั้นประหยัด (Economy)" : "Economy"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 min-w-[10px] min-h-[10px] max-w-[10px] max-h-[10px] sm:min-w-[12px] sm:min-h-[12px] sm:max-w-[12px] sm:max-h-[12px] rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <span className="text-[6px] sm:text-[7px] text-slate-400 dark:text-slate-500 leading-none">✕</span>
              </span>
              <span className="text-slate-400 dark:text-slate-400 text-[10px] sm:text-[11px] whitespace-nowrap">{t('flight.seat_occupied')}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 min-w-[10px] min-h-[10px] max-w-[10px] max-h-[10px] sm:min-w-[12px] sm:min-h-[12px] sm:max-w-[12px] sm:max-h-[12px] rounded-full bg-[#0066FF] dark:bg-sky-500 border border-blue-600 shrink-0 block"></span>
              <span className="text-blue-900 dark:text-sky-200 font-bold text-[10px] sm:text-[11px] whitespace-nowrap">{t('flight.seat_selected')}</span>
            </div>
          </div>

          {/* Airplane Seat Map Container */}
          <div className={`w-full ${cabinConfig.containerWidth} mx-auto bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 rounded-2xl sm:rounded-3xl p-2 sm:p-4 pt-3 sm:pt-8 relative overflow-hidden`}>
            {/* Mock Cockpit at the top */}
            <div className="w-24 sm:w-32 h-6 sm:h-10 border-t-2 border-x-2 border-slate-200 dark:border-slate-700 rounded-t-2xl sm:rounded-t-full mx-auto mb-3 sm:mb-6 flex items-center justify-center bg-white dark:bg-slate-800 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 absolute left-3 sm:left-4 bottom-1.5 sm:bottom-2"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 absolute right-3 sm:right-4 bottom-1.5 sm:bottom-2"></div>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-400 tracking-widest uppercase">{t('flight.cockpit')}</span>
            </div>

            {/* Cabin Seats Rows */}
            {cabinConfig.hasTwinAisle ? (
              /* ─── TWIN-AISLE WIDE-BODY JET (2 - 4 - 2) ─── */
              <div className="space-y-1 sm:space-y-2">
                {cabinConfig.rows.map((row) => (
                  <div key={row} className="flex items-center justify-center gap-0.5 sm:gap-1.5 px-0.5 sm:px-1">
                    {/* Left block A, B */}
                    <div className="flex items-center gap-0.5 sm:gap-1.5">
                      {cabinConfig.leftCols.map((col) => renderSeatBtn(`${row}${col}`))}
                    </div>

                    {/* Left Aisle spacer */}
                    <div className="w-2 sm:w-3 text-center text-[8px] sm:text-[9px] font-mono font-bold text-slate-300 dark:text-slate-600 select-none">
                      ·
                    </div>

                    {/* Center block D, E, F, G */}
                    <div className="flex items-center gap-0.5 sm:gap-1.5">
                      {cabinConfig.centerCols.map((col) => renderSeatBtn(`${row}${col}`))}
                    </div>

                    {/* Right Aisle spacer with row number indicator */}
                    <div className="w-3.5 sm:w-4 text-center text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none font-mono">
                      {row}
                    </div>

                    {/* Right block J, K */}
                    <div className="flex items-center gap-0.5 sm:gap-1.5">
                      {cabinConfig.rightCols.map((col) => renderSeatBtn(`${row}${col}`))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ─── SINGLE-AISLE JET & TURBOPROP (2-2 or 3-3) ─── */
              <div className="space-y-1 sm:space-y-2">
                {cabinConfig.rows.map((row) => (
                  <div key={row} className="flex items-center justify-center gap-1 sm:gap-2 px-1">
                    {/* Left seats */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {cabinConfig.leftCols.map((col) => renderSeatBtn(`${row}${col}`))}
                    </div>

                    {/* Central Aisle spacer with row number indicator */}
                    <div className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 select-none font-mono">
                      {row}
                    </div>

                    {/* Right seats */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {cabinConfig.rightCols.map((col) => renderSeatBtn(`${row}${col}`))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exit indicators at the bottom */}
            <div className="flex justify-between items-center mt-3 sm:mt-6 text-[8px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 px-2 sm:px-4">
              <span className="flex items-center gap-1">{t('flight.exit_left')}</span>
              <span className="flex items-center gap-1">{t('flight.exit_right')}</span>
            </div>
          </div>

          {/* Selection Status & Action Buttons */}
          <div className="mt-3.5 sm:mt-6 flex flex-col gap-2 sm:gap-3">
            {currentSeats.length > 0 ? (
              <div className={`text-center text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 px-2.5 rounded-xl sm:rounded-2xl border min-h-[36px] sm:min-h-[42px] flex items-center justify-center ${
                isCurrentLegComplete
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60"
                  : "text-[#0f3460] dark:text-sky-300 bg-[#cbdcf7]/30 dark:bg-sky-950/50 border-[#cbdcf7]/40 dark:border-sky-800/60"
              }`}>
                {isCurrentLegComplete ? (
                  <span>
                    {legs.length > 1 ? `${currentLeg.label}: ` : ""}{t('flight.selected_all_seats_tag').replace('{count}', String(maxSeats))} <strong>{currentSeats.join(", ")}</strong>
                  </span>
                ) : (
                  <span>
                    {language === 'th'
                      ? `${legs.length > 1 ? `${currentLeg.label}: ` : ""}เลือกแล้ว ${currentSeats.join(", ")} (กรุณาเลือกเพิ่มอีก ${remainingSeats} ที่นั่ง)`
                      : `${legs.length > 1 ? `${currentLeg.label}: ` : ""}Selected: ${currentSeats.join(", ")} (Please select ${remainingSeats} more)`}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-center text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/60 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl min-h-[36px] sm:min-h-[42px] flex items-center justify-center">
                {legs.length > 1 ? `${currentLeg.label}: ` : ""}{t('flight.select_seats_prompt').replace('{count}', String(maxSeats))}
              </div>
            )}

            <div className="flex items-center gap-2">
              {legs.length > 1 && activeModalLeg < legs.length - 1 && (
                <button
                  type="button"
                  id="seatmap-next-leg-btn"
                  data-testid="seatmap-next-leg-btn"
                  onClick={() => setActiveModalLeg(activeModalLeg + 1)}
                  className="flex-1 py-2.5 sm:py-3.5 font-display font-bold text-xs rounded-xl sm:rounded-2xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-slate-800 text-sky-900 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  {language === 'th' ? `เที่ยวบินถัดไป (${activeModalLeg + 2}/${legs.length}) →` : `Next Flight (${activeModalLeg + 2}/${legs.length}) →`}
                </button>
              )}

              <button
                id="confirm-seat-picker-btn"
                data-testid="confirm-seat-picker-btn"
                type="button"
                disabled={currentSeats.length === 0}
                onClick={handleSaveAndClose}
                className={`flex-1 py-2.5 sm:py-3.5 font-display font-bold text-xs rounded-xl sm:rounded-2xl shadow-md transition-all cursor-pointer ${
                  currentSeats.length > 0
                    ? "bg-[#0f3460] dark:bg-sky-600 hover:bg-[#0c2a50] dark:hover:bg-sky-500 text-white hover:shadow-lg active:scale-98"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                }`}
              >
                {legs.length > 1
                  ? (allLegsComplete
                      ? (language === 'th' ? "ยืนยันที่นั่งครบทุกเที่ยวบิน ✓" : "Confirm All Flight Seats ✓")
                      : (language === 'th' ? `บันทึกที่นั่ง (${currentSeats.length}/${maxSeats})` : `Save Seats (${currentSeats.length}/${maxSeats})`))
                  : (language === 'th'
                      ? `ยืนยันที่นั่ง (${currentSeats.length}/${maxSeats})`
                      : `Confirm Seats (${currentSeats.length}/${maxSeats})`)}
              </button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}