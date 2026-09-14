import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/LanguageContext";
import { formatDateTime, formatDate, formatFlightDuration } from "@/lib/dateUtils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  getBookings,
  deleteBooking,
  clearBookings,
  getLockedSeats,
  toggleSeatLock,
  unlockAllSeats,
  resetLockedSeatsToDefault,
  releaseSeatBooking,
  MOCK_FLEET,
  getAircraftCabinType,
  type CabinType,
  type Booking,
} from "@/lib/bookings";
import { AirlinerFuselageSVG } from "@/components/AirlinerFuselageSVG";
import { getCityFullName, getCityDetails, getAirportCode } from "@/lib/cities";
import { Toaster, toast } from "sonner";
import { ThailandFlightMap } from "@/components/ThailandFlightMap";
import {
  fetchLiveDestinationWeather,
  getWeatherConditionText,
  type DestinationWeather,
} from "@/lib/weather";
import {
  Lock,
  User,
  RefreshCw,
  Plane,
  Search,
  Layers,
  Wifi,
  Luggage,
  Zap,
  Tv,
  ArrowUpRight,
  Plus,
  Minus,
  CloudRain,
  CloudSun,
  Sun,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Loader2,
  Armchair,
  Check,
  ChevronDown,
  Grid,
  List,
  Building2,
  PanelRightClose,
  PanelRightOpen,
  Activity,
} from "lucide-react";

export default function FlightAdmin() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings">("dashboard");
  const [items, setItems] = useState<Booking[]>([]);
  const [selectedFlightNo, setSelectedFlightNo] = useState<string>("BTN201");
  const [lockedSeats, setLockedSeatsState] = useState<string[]>([]);
  const [showLiveStatus, setShowLiveStatus] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("botnoi_admin_show_live_status");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const toggleLiveStatus = () => {
    setShowLiveStatus((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("botnoi_admin_show_live_status", String(next));
      }
      return next;
    });
  };
  const [q, setQ] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"details" | "price" | "refund" | "reschedule" | "offers">("details");
  const [selectedDeck, setSelectedDeck] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeBookedSeatModal, setActiveBookedSeatModal] = useState<{ seatId: string; booking: Booking } | null>(null);
  const [flightFilterQuery, setFlightFilterQuery] = useState("");
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<string>("ALL");
  const [selectedAirlineFilter, setSelectedAirlineFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grouped" | "compact" | "cards">("grouped");
  const [collapsedHubs, setCollapsedHubs] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentAircraft = useMemo(() => {
    return MOCK_FLEET.find((f) => f.flightNo === selectedFlightNo) || MOCK_FLEET[0];
  }, [selectedFlightNo]);

  // Cabin Type & Configuration (Dynamic Layout based on Real Aircraft Models)
  const cabinType: CabinType = useMemo(() => {
    return getAircraftCabinType(currentAircraft.model, currentAircraft.type);
  }, [currentAircraft.model, currentAircraft.type]);

  const cabinConfig = useMemo(() => {
    if (cabinType === "turboprop") {
      // ATR 72-600 Regional Turboprop: 2-2 Layout with 15 Rows (No Middle Seats!)
      return {
        type: "turboprop" as const,
        rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        topRows: ["F", "D"],
        centerRows: [] as string[],
        bottomRows: ["C", "A"],
        allCols: ["A", "C", "D", "F"],
        seatHeight: "h-[19px]",
        seatLetterSize: "text-[8px]",
        gapPx: "3px",
        hasTwinAisle: false,
      };
    }
    if (cabinType === "widebody") {
      // Boeing 777-300ER, Boeing 787 Dreamliner, Airbus A350: Twin-Aisle 2-4-2 Layout with 8 Rows
      return {
        type: "widebody" as const,
        rows: [1, 2, 3, 4, 5, 6, 7, 8],
        topRows: ["K", "J"],
        centerRows: ["G", "F", "E", "D"],
        bottomRows: ["B", "A"],
        allCols: ["A", "B", "D", "E", "F", "G", "J", "K"],
        seatHeight: "h-[13.5px]",
        seatLetterSize: "text-[7.5px]",
        gapPx: "7px",
        hasTwinAisle: true,
      };
    }
    // Narrow-body Jet (Airbus A320/A321neo, Boeing 737-800): 3-3 Single-Aisle with 10 Rows
    return {
      type: "narrowbody" as const,
      rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      topRows: ["F", "E", "D"],
      centerRows: [] as string[],
      bottomRows: ["C", "B", "A"],
      allCols: ["A", "B", "C", "D", "E", "F"],
      seatHeight: "h-[16px]",
      seatLetterSize: "text-[9px]",
      gapPx: "5px",
      hasTwinAisle: false,
    };
  }, [cabinType]);

  const refreshData = (showToast?: boolean | React.MouseEvent) => {
    const shouldToast = typeof showToast === "boolean" ? showToast : false;
    setIsRefreshing(true);
    setItems(getBookings());
    setLockedSeatsState(getLockedSeats(selectedFlightNo));

    const destCode = currentAircraft.destCode || "CNX";
    fetchLiveDestinationWeather(destCode)
      .then((data) => {
        setWeather(data);
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          if (shouldToast) {
            toast.success(t("flight_admin.toast_refreshed"));
          }
        }, 350);
      });
  };

  useEffect(() => {
    refreshData(false);
  }, []);

  useEffect(() => {
    setLockedSeatsState(getLockedSeats(selectedFlightNo));
  }, [selectedFlightNo]);



  const formatFlightTime = (timeStr: string = "") => {
    if (language === "th") return `${timeStr} น.`;
    return timeStr;
  };

  const getTerminalLabel = (info: string = "") => {
    if (language === "th") return info;
    return info
      .replace("อาคารผู้โดยสารหลัก", language === "zh" ? "主航站楼" : language === "ja" ? "メインターミナル" : language === "ko" ? "메인 터미널" : "Main Terminal")
      .replace("อาคาร 2", language === "zh" ? "2号航站楼" : language === "ja" ? "第2ターミナル" : language === "ko" ? "제2터미널" : "Terminal 2")
      .replace("อาคาร 1", language === "zh" ? "1号航站楼" : language === "ja" ? "第1ターミナル" : language === "ko" ? "제1터ミナル" : "Terminal 1")
      .replace("อาคารผู้โดยสารในประเทศ", language === "zh" ? "国内航站楼" : language === "ja" ? "国内線ターミナル" : language === "ko" ? "국내선 터미널" : "Domestic Terminal")
      .replace("ดอนเมือง", "Don Mueang")
      .replace("สุวรรณภูมิ", "Suvarnabhumi")
      .replace("เชียงใหม่", "Chiang Mai")
      .replace("ภูเก็ต", "Phuket")
      .replace("หาดใหญ่", "Hat Yai")
      .replace("อุดรธานี", "Udon Thani")
      .replace("อุบลราชธานี", "Ubon Ratchathani")
      .replace("ขอนแก่น", "Khon Kaen")
      .replace("สุราษฎร์ธานี", "Surat Thani")
      .replace("นครศรีธรรมราช", "Nakhon Si Thammarat")
      .replace("กระบี่", "Krabi")
      .replace("เชียงราย", "Chiang Rai");
  };

  const getCityLabel = (city: string) => {
    const details = getCityDetails(city, language);
    return `${details.cityName} (${details.code})`;
  };

  const getCityNameOnly = (city: string) => {
    const details = getCityDetails(city, language);
    return details.cityName;
  };

  // Filtered bookings for manifest
  const filteredBookings = items.filter((b) =>
    [
      b.passengerName,
      b.email,
      b.from,
      b.to,
      b.phone,
      b.seat || "",
      b.returnSeat || "",
      b.outboundFlightNo || "",
      b.inboundFlightNo || "",
      b.aircraftModel || "",
      b.inboundAircraftModel || "",
      b.aircraftTail || "",
      b.inboundAircraftTail || "",
      ...(b.legs || []).flatMap((l) => [
        l.from,
        l.to,
        l.flightNo || "",
        l.aircraftModel || "",
        l.aircraftTail || "",
        l.seat || "",
      ]),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  // Map seat status based on dynamic cabinConfig
  const seatStatusMap = useMemo(() => {
    const map = new Map<string, { status: "available" | "locked" | "booked"; booking?: Booking }>();
    const curOrigCode = currentAircraft.originCode || getAirportCode(currentAircraft.originCity || "");
    const curDestCode = currentAircraft.destCode || getAirportCode(currentAircraft.destCity || "");

    cabinConfig.rows.forEach((r) => {
      cabinConfig.allCols.forEach((c) => {
        const seatId = `${r}${c}`;
        const booking = items.find((b) => {
          const bOrigCode = getAirportCode(b.from);
          const bDestCode = getAirportCode(b.to);

          // 1. One-way or Round-trip outbound route matching
          if (bOrigCode === curOrigCode && bDestCode === curDestCode) {
            if (!b.outboundFlightNo || b.outboundFlightNo === selectedFlightNo || currentAircraft.flightNo === selectedFlightNo) {
              const seats = (b.seat || "").split(",").map((s) => s.trim());
              if (seats.includes(seatId)) return true;
            }
          }

          // 2. Round-trip return route matching (when current plane is operating the return leg)
          if (b.tripType === "round" && bOrigCode === curDestCode && bDestCode === curOrigCode) {
            if (!b.inboundFlightNo || b.inboundFlightNo === selectedFlightNo || currentAircraft.flightNo === selectedFlightNo) {
              const inSeats = (b.returnSeat || b.seat || "").split(",").map((s) => s.trim());
              if (inSeats.includes(seatId)) return true;
            }
          }

          // 3. Multi-city legs route matching
          if (b.legs && b.legs.length > 0) {
            const hasLegMatch = b.legs.some((l) => {
              const legOrig = getAirportCode(l.from);
              const legDest = getAirportCode(l.to);
              const isRoute = legOrig === curOrigCode && legDest === curDestCode;
              const isFlight = !l.flightNo || l.flightNo === selectedFlightNo || currentAircraft.flightNo === selectedFlightNo;
              if (isRoute && isFlight) {
                const legSeats = (l.seat || b.seat || "").split(",").map((s) => s.trim());
                return legSeats.includes(seatId);
              }
              return false;
            });
            if (hasLegMatch) return true;
          }

          // 4. Exact flight number matching ONLY IF route origins/destinations match or are not specified
          if (b.outboundFlightNo === selectedFlightNo && (!bOrigCode || bOrigCode === curOrigCode) && (!bDestCode || bDestCode === curDestCode)) {
            const seats = (b.seat || "").split(",").map((s) => s.trim());
            if (seats.includes(seatId)) return true;
          }
          if (b.inboundFlightNo === selectedFlightNo && (!bOrigCode || bOrigCode === curDestCode) && (!bDestCode || bDestCode === curOrigCode)) {
            const inSeats = (b.returnSeat || b.seat || "").split(",").map((s) => s.trim());
            if (inSeats.includes(seatId)) return true;
          }

          return false;
        });

        if (booking) {
          map.set(seatId, { status: "booked", booking });
        } else if (lockedSeats.includes(seatId)) {
          map.set(seatId, { status: "locked" });
        } else {
          map.set(seatId, { status: "available" });
        }
      });
    });

    return map;
  }, [items, lockedSeats, selectedFlightNo, currentAircraft, cabinConfig]);

  // Dynamic Total Seat Counts matching the exact aircraft
  const totalSeats = cabinConfig.rows.length * cabinConfig.allCols.length;
  const bookedCount = useMemo(() => {
    let count = 0;
    seatStatusMap.forEach((v) => {
      if (v.status === "booked") count++;
    });
    return count;
  }, [seatStatusMap]);

  const lockedCount = useMemo(() => {
    let count = 0;
    seatStatusMap.forEach((v) => {
      if (v.status === "locked") count++;
    });
    return count;
  }, [seatStatusMap]);

  const availableCount = totalSeats - bookedCount - lockedCount;

  // Actions
  const handleToggleLock = (seatId: string) => {
    const seatInfo = seatStatusMap.get(seatId);
    const status = seatInfo?.status;
    const curOrigCode = currentAircraft.originCode || getAirportCode(currentAircraft.originCity || "");
    const curDestCode = currentAircraft.destCode || getAirportCode(currentAircraft.destCity || "");

    if (status === "booked") {
      if (seatInfo?.booking) {
        setActiveBookedSeatModal({ seatId, booking: seatInfo.booking });
      } else {
        // Fallback if booking object is somehow detached
        const result = releaseSeatBooking(seatId, selectedFlightNo, curOrigCode, curDestCode);
        setItems(result.updatedBookings);
        setLockedSeatsState(result.updatedLockedSeats);
        toast.success(t("flight_admin.toast_seat_unlocked_avail").replace("{seatId}", seatId));
      }
      return;
    }

    const updated = toggleSeatLock(seatId, selectedFlightNo);
    setLockedSeatsState(updated);
    if (updated.includes(seatId)) {
      toast.success(
        t("flight_admin.toast_seat_locked")
          .replace("{seatId}", seatId)
          .replace("{flightNo}", selectedFlightNo)
      );
    } else {
      toast.success(
        t("flight_admin.toast_seat_unlocked")
          .replace("{seatId}", seatId)
          .replace("{flightNo}", selectedFlightNo)
      );
    }
  };

  const handleReleaseBookedSeat = (seatId: string) => {
    const curOrigCode = currentAircraft.originCode || getAirportCode(currentAircraft.originCity || "");
    const curDestCode = currentAircraft.destCode || getAirportCode(currentAircraft.destCity || "");
    const bookingId = activeBookedSeatModal?.booking?.id;
    const result = releaseSeatBooking(seatId, selectedFlightNo, curOrigCode, curDestCode, bookingId);
    setItems(result.updatedBookings);
    setLockedSeatsState(result.updatedLockedSeats);
    setActiveBookedSeatModal(null);
    toast.success(t("flight_admin.toast_seat_released").replace("{seatId}", seatId));
  };

  const handleUnlockAll = () => {
    const updated = unlockAllSeats(selectedFlightNo);
    setLockedSeatsState(updated);
    toast.success(t("flight_admin.toast_all_unlocked").replace("{flightNo}", selectedFlightNo));
  };

  const handleResetDefaults = () => {
    const updated = resetLockedSeatsToDefault(selectedFlightNo);
    setLockedSeatsState(updated);
    toast.success(t("flight_admin.toast_reset_defaults").replace("{flightNo}", selectedFlightNo));
  };

  // Fleet metadata enrichment for realistic card display with Thai domestic provinces
  const fleetCards = useMemo(() => {
    return MOCK_FLEET.map((plane) => {
      const priceStr = plane.priceStr || (plane.price ? `฿${plane.price.toLocaleString()}` : "฿890");
      const depDate = plane.depTime ? formatFlightTime(plane.depTime) : (language === "th" ? "06:15 น." : "06:15");
      const arrDate = plane.arrTime ? formatFlightTime(plane.arrTime) : (language === "th" ? "07:30 น." : "07:30");
      const durationStr = formatFlightDuration(plane.durationStr || "1 ชม. 15 นาที", language);
      const rawOrigin = plane.originCity || "กรุงเทพฯ (DMK)";
      const rawDest = plane.destCity || "เชียงใหม่ (CNX)";
      const originDetails = getCityDetails(rawOrigin, language);
      const destDetails = getCityDetails(rawDest, language);
      const originCode = plane.originCode || originDetails.code;
      const destCode = plane.destCode || destDetails.code;
      const originCity = `${originDetails.cityName} (${originCode})`;
      const destCity = `${destDetails.cityName} (${destCode})`;
      const originName = originDetails.cityName;
      const destName = destDetails.cityName;
      const terminalInfo = getTerminalLabel(plane.terminalInfo || "อาคาร 2 (ดอนเมือง)");

      return {
        ...plane,
        rawOriginCity: rawOrigin,
        rawDestCity: rawDest,
        priceStr,
        depDate,
        arrDate,
        durationStr,
        originCity,
        originCode,
        destCity,
        destCode,
        originName,
        destName,
        terminalInfo,
      };
    });
  }, [language]);

  const originHubs = useMemo(() => {
    const counts: Record<string, { code: string; name: string; count: number }> = {};
    fleetCards.forEach((p) => {
      const code = p.originCode;
      if (!counts[code]) {
        counts[code] = { code, name: p.originName, count: 0 };
      }
      counts[code].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [fleetCards]);

  const activeOriginDests = useMemo(() => {
    if (selectedOriginFilter === "ALL") return [];
    return fleetCards.filter((p) => p.originCode === selectedOriginFilter);
  }, [fleetCards, selectedOriginFilter]);

  const filteredFleetCards = useMemo(() => {
    return fleetCards.filter((p) => {
      if (selectedOriginFilter !== "ALL" && p.originCode !== selectedOriginFilter) return false;
      if (selectedAirlineFilter !== "ALL" && p.airlineCode !== selectedAirlineFilter) return false;
      if (flightFilterQuery.trim()) {
        const qLower = flightFilterQuery.toLowerCase().trim();
        const text = `${p.flightNo} ${p.airlineName} ${p.originCity} ${p.originCode} ${p.destCity} ${p.destCode} ${p.originName} ${p.destName} ${p.route} ${p.model}`.toLowerCase();
        if (!text.includes(qLower)) return false;
      }
      return true;
    });
  }, [fleetCards, selectedOriginFilter, selectedAirlineFilter, flightFilterQuery]);

  const groupedFleet = useMemo(() => {
    const groups: Record<string, { hubCode: string; hubName: string; flights: typeof filteredFleetCards }> = {};
    filteredFleetCards.forEach((p) => {
      if (!groups[p.originCode]) {
        groups[p.originCode] = {
          hubCode: p.originCode,
          hubName: p.originName,
          flights: [],
        };
      }
      groups[p.originCode].flights.push(p);
    });
    return Object.values(groups).sort((a, b) => b.flights.length - a.flights.length);
  }, [filteredFleetCards]);

  const toggleHubCollapse = (hubCode: string) => {
    setCollapsedHubs((prev) => ({
      ...prev,
      [hubCode]: !prev[hubCode],
    }));
  };

  const activeFlightData = fleetCards.find((f) => f.flightNo === selectedFlightNo) || fleetCards[0];

  const [weather, setWeather] = useState<DestinationWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const destCode = activeFlightData.destCode || "CNX";
    setWeatherLoading(true);
    fetchLiveDestinationWeather(destCode)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setWeatherLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setWeatherLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [activeFlightData.destCode]);

  const renderWeatherIcon = (iconType?: string) => {
    switch (iconType) {
      case "sun":
        return <Sun className="w-5 h-5 text-amber-500 shrink-0" />;
      case "cloud-sun":
        return <CloudSun className="w-5 h-5 text-amber-500 shrink-0" />;
      case "cloud":
        return <Cloud className="w-5 h-5 text-slate-400 shrink-0" />;
      case "drizzle":
        return <CloudDrizzle className="w-5 h-5 text-sky-400 shrink-0" />;
      case "thunder":
        return <CloudLightning className="w-5 h-5 text-purple-500 shrink-0" />;
      case "fog":
        return <CloudFog className="w-5 h-5 text-slate-400 shrink-0" />;
      case "rain":
      default:
        return <CloudRain className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  const renderSeat = (row: number, col: string) => {
    const seatId = `${row}${col}`;
    const seatInfo = seatStatusMap.get(seatId);
    const status = seatInfo?.status || "available";
    const isLocked = status === "locked";
    const isBooked = status === "booked";
    const isBusiness =
      cabinType === "widebody"
        ? row <= 3
        : cabinType === "turboprop"
        ? row <= 2
        : row <= 2;
    const isDimmed = (selectedDeck === 2 && !isBusiness) || (selectedDeck === 3 && isBusiness);

    return (
      <button
        key={seatId}
        id={`admin-seat-btn-${seatId}`}
        data-testid={`admin-seat-btn-${seatId}`}
        data-seat-id={seatId}
        type="button"
        onClick={() => handleToggleLock(seatId)}
        className={`relative w-full ${cabinConfig.seatHeight} rounded-[4px] border flex items-center justify-center cursor-pointer select-none transition-all duration-150 box-border shrink-0 ${
          isDimmed ? "opacity-20 scale-95 pointer-events-none" : "opacity-100 scale-100"
        } ${
          isLocked
            ? "bg-[#181a20] text-slate-300 border-slate-700 shadow-xs hover:bg-slate-800 hover:border-slate-500 hover:ring-1 hover:ring-rose-400/50"
            : isBooked
            ? "bg-amber-600 text-white border-amber-700 shadow-xs hover:bg-amber-700 hover:border-amber-800 hover:ring-1 hover:ring-amber-300/50"
            : isBusiness
            ? "bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-600 font-bold shadow-xs hover:bg-sky-200 dark:hover:bg-sky-900 hover:border-sky-400 hover:ring-1 hover:ring-sky-300/70"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300/90 dark:border-slate-700 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-600"
        }`}
        title={
          isBooked
            ? t("flight_admin.seat_booked_by")
                .replace("{seatId}", seatId)
                .replace("{name}", seatInfo?.booking?.passengerName || t("flight_admin.passenger_anon"))
            : isLocked
            ? t("flight_admin.seat_locked_admin").replace("{seatId}", seatId)
            : `${seatId} (${isBusiness ? (language === "th" ? "ชั้นธุรกิจ" : "Business Class") : (language === "th" ? "ชั้นประหยัด" : "Economy Class")}) - ${t("flight_admin.seat_available_click").replace("{seatId}", seatId)}`
        }
      >
        {/* Realistic Headrest Cushion (Right side) */}
        <span
          className={`absolute right-0 top-[1.5px] bottom-[1.5px] w-[2.5px] rounded-r-[2px] pointer-events-none ${
            isLocked ? "bg-slate-600" : isBooked ? "bg-amber-400" : isBusiness ? "bg-sky-200" : "bg-slate-300 dark:bg-slate-600"
          }`}
        />
        {/* Armrests (Top & Bottom) */}
        <span
          className={`absolute left-[2px] right-[4px] top-0 h-[1px] rounded-full pointer-events-none ${
            isLocked ? "bg-slate-600" : isBooked ? "bg-amber-500" : isBusiness ? "bg-sky-300" : "bg-slate-200 dark:bg-slate-700"
          }`}
        />
        <span
          className={`absolute left-[2px] right-[4px] bottom-0 h-[1px] rounded-full pointer-events-none ${
            isLocked ? "bg-slate-600" : isBooked ? "bg-amber-500" : isBusiness ? "bg-sky-300" : "bg-slate-200 dark:bg-slate-700"
          }`}
        />

        {/* Seat Column Letter */}
        <span className={`font-mono font-black ${cabinConfig.seatLetterSize} pr-0.5 leading-none pointer-events-none transition-colors`}>
          {col}
        </span>

        {/* Status Badge */}
        {isLocked && (
          <Lock className="w-2 h-2 text-rose-400 absolute -top-1 -right-1 bg-[#181a20] rounded-full p-[0.5px] pointer-events-none" />
        )}
        {isBooked && (
          <User className="w-2 h-2 text-amber-200 absolute -top-1 -right-1 bg-amber-700 rounded-full p-[0.5px] pointer-events-none" />
        )}
      </button>
    );
  };

  const renderAisleRow = (keyPrefix: string) => (
    <div
      key={keyPrefix}
      className="items-center bg-slate-200/90 dark:bg-slate-800/90 rounded-[3px] my-[1px] py-[2px]"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cabinConfig.rows.length}, minmax(0, 1fr))`,
        gap: cabinConfig.gapPx,
      }}
    >
      {cabinConfig.rows.map((row) => {
        const isDimmed = (selectedDeck === 2 && row > 4) || (selectedDeck === 3 && row <= 4);
        return (
          <div
            key={`${keyPrefix}-${row}`}
            className={`text-center font-mono font-black text-[9px] select-none leading-none transition-all duration-200 ${
              isDimmed ? "opacity-25 text-slate-400" : "opacity-100 text-slate-700 dark:text-slate-300 font-extrabold"
            }`}
          >
            {row}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f9] dark:bg-[#0b0d13] text-slate-900 dark:text-slate-100 antialiased font-sans pb-16">
      <Toaster
        position="bottom-center"
        theme="dark"
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

      {/* Top Header Bar */}
      <header className="px-3.5 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b sm:border-b-0 border-slate-200/60 dark:border-slate-800/60 mb-2 sm:mb-0">
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("flight_admin.page_title")}
          </h1>
          <div className="flex items-center bg-white/80 dark:bg-slate-900/80 p-1 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800">
            <button
              id="admin-tab-operations"
              data-testid="admin-tab-operations"
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {t("flight_admin.tab_operations")}
            </button>
            <button
              id="admin-tab-manifest"
              data-testid="admin-tab-manifest"
              onClick={() => setActiveTab("bookings")}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "bookings"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span>{t("flight_admin.tab_manifest")}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold">
                {items.length}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
          <button
            id="admin-refresh-fleet-btn"
            data-testid="admin-refresh-fleet-btn"
            onClick={() => refreshData(true)}
            disabled={isRefreshing}
            className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-60 shrink-0"
            title={t("flight_admin.refresh_tooltip")}
          >
            <RefreshCw className={`w-4 h-4 transition-transform ${isRefreshing ? "animate-spin text-sky-500" : ""}`} />
          </button>
          <Link
            to="/flight-demo"
            className="text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>{t("nav.back_to_main")}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="px-3.5 sm:px-6">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ══════════════════════════════════════════════════════════════
                LEFT COLUMN (3 cols): ACTIVE FLIGHTS LIST
            ══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-3 space-y-3">
              {/* Header & View Mode Switcher */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
                    {t("flight_admin.active_flights")}
                  </span>
                  <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-800/60">
                    {filteredFleetCards.length}
                  </span>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("grouped")}
                    className={`p-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "grouped"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title={t("flight_admin.view_grouped")}
                  >
                    <Building2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("compact")}
                    className={`p-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "compact"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title={t("flight_admin.view_compact")}
                  >
                    <List className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`p-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "cards"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title={t("flight_admin.view_cards")}
                  >
                    <Grid className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative px-0.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={flightFilterQuery}
                  onChange={(e) => setFlightFilterQuery(e.target.value)}
                  placeholder={t("flight_admin.fleet_search_placeholder")}
                  className="w-full pl-8 pr-7 py-2 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:border-sky-500 placeholder:text-slate-400 shadow-2xs transition-all"
                />
                {flightFilterQuery && (
                  <button
                    type="button"
                    onClick={() => setFlightFilterQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Origin Hub Filter (Quick Chips + Dropdown) */}
              <div className="space-y-1.5 px-0.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span>{t("flight_admin.origin_hub_title")}</span>
                  {selectedOriginFilter !== "ALL" && (
                    <button
                      type="button"
                      onClick={() => setSelectedOriginFilter("ALL")}
                      className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      {t("flight_admin.clear_filter")}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedOriginFilter("ALL")}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                      selectedOriginFilter === "ALL"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {t("flight_admin.all_hubs")} ({fleetCards.length})
                  </button>

                  {originHubs.slice(0, 6).map((hub) => (
                    <button
                      key={hub.code}
                      type="button"
                      onClick={() => setSelectedOriginFilter(hub.code)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                        selectedOriginFilter === hub.code
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {hub.code} ({hub.count})
                    </button>
                  ))}

                  {/* Dropdown for other hubs */}
                  <select
                    value={["ALL", "DMK", "BKK", "CNX", "HKT", "HDY", "UTH"].includes(selectedOriginFilter) ? "" : selectedOriginFilter}
                    onChange={(e) => {
                      if (e.target.value) setSelectedOriginFilter(e.target.value);
                    }}
                    className="px-2 py-1 rounded-xl text-[10px] font-bold shrink-0 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="">{t("flight_admin.more_hubs")}</option>
                    {originHubs.slice(6).map((hub) => (
                      <option key={hub.code} value={hub.code}>
                        {hub.name} ({hub.code}) - {hub.count}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Airline Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 px-0.5 w-full min-w-0">
                {[
                  { code: "ALL", label: t("flight_admin.all_airlines") },
                  { code: "BTN", label: "Botnoi Air" },
                  { code: "THA", label: "Thai Airways" },
                  { code: "BKP", label: "Bangkok Air" },
                ].map((airline) => (
                  <button
                    key={airline.code}
                    type="button"
                    onClick={() => setSelectedAirlineFilter(airline.code)}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold shrink-0 transition-all cursor-pointer ${
                      selectedAirlineFilter === airline.code
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300/60"
                    }`}
                  >
                    {airline.label}
                  </button>
                ))}
              </div>

              {/* Direct Jump Destination Pills (When Origin Hub is filtered) */}
              {selectedOriginFilter !== "ALL" && activeOriginDests.length > 0 && (
                <div className="bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 rounded-2xl p-2.5 space-y-1.5 w-full min-w-0 overflow-hidden">
                  <div className="text-[10px] font-bold text-sky-800 dark:text-sky-300 flex items-center justify-between min-w-0">
                    <span className="truncate">
                      {t("flight_admin.direct_routes_from")
                        .replace("{hub}", selectedOriginFilter)
                        .replace("{count}", String(activeOriginDests.length))}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeOriginDests.map((p) => {
                      const isSel = selectedFlightNo === p.flightNo;
                      return (
                        <button
                          key={p.flightNo}
                          type="button"
                          onClick={() => setSelectedFlightNo(p.flightNo)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                            isSel
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-sky-200/60 dark:border-slate-700 hover:bg-sky-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          → {p.destCode}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Flights List */}
              <div className="overflow-y-auto max-h-[720px] pr-1 space-y-2.5 no-scrollbar w-full min-w-0">
                {filteredFleetCards.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                    {t("flight_admin.no_flights_found")}
                  </div>
                ) : viewMode === "grouped" ? (
                  /* ─── GROUPED ACCORDION VIEW (DEFAULT) ─── */
                  groupedFleet.map((group) => {
                    const isCollapsed = !!collapsedHubs[group.hubCode];
                    const hasSelectedFlight = group.flights.some((f) => f.flightNo === selectedFlightNo);

                    return (
                      <div
                        key={group.hubCode}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          hasSelectedFlight
                            ? "border-sky-300 dark:border-sky-800 bg-sky-50/20 dark:bg-sky-950/10 shadow-xs"
                            : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
                        }`}
                      >
                        {/* Group Header */}
                        <div
                          onClick={() => toggleHubCollapse(group.hubCode)}
                          className="px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors gap-2 min-w-0"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                              🛫
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate" title={`${group.hubName} (${group.hubCode})`}>
                                {group.hubName} ({group.hubCode})
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium truncate">
                                {t("flight_admin.flights_count").replace("{count}", String(group.flights.length))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                              {group.hubCode}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                                isCollapsed ? "-rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Group Flights Items */}
                        {!isCollapsed && (
                          <div className="p-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 min-w-0">
                            {group.flights.map((plane) => {
                              const isSelected = selectedFlightNo === plane.flightNo;
                              return (
                                <motion.div
                                  key={plane.flightNo}
                                  layout
                                  onClick={() => setSelectedFlightNo(plane.flightNo)}
                                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between border gap-2 min-w-0 overflow-hidden ${
                                    isSelected
                                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-md"
                                      : "bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 hover:shadow-2xs"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <span className="font-mono font-bold text-xs shrink-0">
                                      {plane.flightNo}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                      isSelected
                                        ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                                        : "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
                                    }`}>
                                      → {plane.destCode}
                                    </span>
                                    <span
                                      title={plane.destName}
                                      className={`text-[10px] truncate min-w-0 hidden sm:inline-block lg:hidden xl:inline-block max-w-[85px] sm:max-w-[130px] xl:max-w-[90px] ${
                                        isSelected ? "text-slate-300 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"
                                      }`}
                                    >
                                      {plane.destName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-right">
                                    <span className={`text-[10px] font-mono shrink-0 ${
                                      isSelected ? "text-slate-300 dark:text-slate-700" : "text-slate-400"
                                    }`}>
                                      {plane.depDate}
                                    </span>
                                    <span className="text-xs font-bold font-mono shrink-0">
                                      {plane.priceStr}
                                    </span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : viewMode === "compact" ? (
                  /* ─── COMPACT TABLE LIST VIEW ─── */
                  <div className="space-y-1.5 min-w-0">
                    {filteredFleetCards.map((plane) => {
                      const isSelected = selectedFlightNo === plane.flightNo;
                      return (
                        <motion.div
                          key={plane.flightNo}
                          layout
                          onClick={() => setSelectedFlightNo(plane.flightNo)}
                          className={`px-3 py-2 rounded-xl cursor-pointer transition-all flex items-center justify-between border gap-2 min-w-0 overflow-hidden ${
                            isSelected
                              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-md"
                              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 hover:shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                            <span className="font-mono font-bold text-xs shrink-0">{plane.flightNo}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              isSelected
                                ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}>
                              {plane.route}
                            </span>
                            <span
                              title={plane.airlineName}
                              className={`text-[9px] truncate min-w-0 hidden md:inline-block lg:hidden xl:inline-block max-w-[80px] xl:max-w-[70px] ${
                                isSelected ? "text-slate-300 dark:text-slate-600" : "text-slate-400"
                              }`}
                            >
                              {plane.airlineName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-right">
                            <span className={`text-[10px] font-mono shrink-0 ${
                              isSelected ? "text-slate-300 dark:text-slate-600" : "text-slate-400"
                            }`}>
                              {plane.depDate}
                            </span>
                            <span className="text-xs font-bold font-mono shrink-0">{plane.priceStr}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* ─── DETAILED CARDS VIEW ─── */
                  filteredFleetCards.map((plane) => {
                    const isSelected = selectedFlightNo === plane.flightNo;

                    if (isSelected) {
                      return (
                        <motion.div
                          key={plane.flightNo}
                          layout
                          onClick={() => setSelectedFlightNo(plane.flightNo)}
                          className="bg-[#18191f] text-white rounded-3xl p-4 shadow-xl border border-slate-800 cursor-pointer space-y-3.5 transition-all relative overflow-hidden min-w-0"
                        >
                          <div className="bg-[#24262f] rounded-2xl p-2.5 flex items-center justify-between border border-slate-700/60 shadow-inner gap-2 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                                ✈
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold leading-tight text-white truncate" title={`${plane.airlineName} (${plane.flightNo})`}>
                                  {plane.airlineName} ({plane.flightNo})
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium truncate">
                                  {t("flight_admin.price_from")} {plane.priceStr}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 relative pl-4 text-xs min-w-0">
                            <div className="absolute left-1.5 top-2.5 bottom-2.5 w-0.5 bg-slate-700" />
                            <div className="relative min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-4 top-1 border-2 border-[#18191f]" />
                              <div className="flex items-baseline gap-1.5 min-w-0">
                                <span className="font-bold text-slate-100 shrink-0">{plane.originCode}</span>
                                <span className="text-[11px] text-slate-400 truncate min-w-0" title={plane.originName}>{plane.originName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{plane.depDate}</div>
                            </div>
                            <div className="relative pt-1 min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-sky-400 absolute -left-4 top-2 border-2 border-[#18191f]" />
                              <div className="flex items-baseline gap-1.5 min-w-0">
                                <span className="font-bold text-slate-100 shrink-0">{plane.destCode}</span>
                                <span className="text-[11px] text-slate-400 truncate min-w-0" title={plane.destName}>{plane.destName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{plane.arrDate}</div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={plane.flightNo}
                        layout
                        onClick={() => setSelectedFlightNo(plane.flightNo)}
                        className="bg-white/90 dark:bg-slate-900/90 hover:bg-white rounded-3xl p-4 shadow-2xs border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer space-y-3.5 transition-all min-w-0 overflow-hidden"
                      >
                        <div className="bg-[#e8f1fd] dark:bg-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between border border-sky-100/60 dark:border-slate-700/60 gap-2 min-w-0">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                              🦅
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-200 truncate" title={`${plane.airlineName} (${plane.flightNo})`}>
                                {plane.airlineName} ({plane.flightNo})
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                {t("flight_admin.price_from")} {plane.priceStr}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 relative pl-4 text-xs min-w-0">
                          <div className="absolute left-1.5 top-2.5 bottom-2.5 w-0.5 bg-slate-200 dark:bg-slate-700" />
                          <div className="relative min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 absolute -left-4 top-1 border-2 border-white dark:border-slate-900" />
                            <div className="flex items-baseline gap-1.5 min-w-0">
                              <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">{plane.originCode}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate min-w-0" title={plane.originName}>{plane.originName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{plane.depDate}</div>
                          </div>
                          <div className="relative pt-1 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 absolute -left-4 top-2 border-2 border-white dark:border-slate-900" />
                            <div className="flex items-baseline gap-1.5 min-w-0">
                              <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">{plane.destCode}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate min-w-0" title={plane.destName}>{plane.destName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{plane.arrDate}</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                CENTER COLUMN (6 cols or 9 cols when Live Status is collapsed): 3D AIRPLANE CABIN & FLIGHT DETAILS
            ══════════════════════════════════════════════════════════════ */}
            <div className={`${showLiveStatus ? "lg:col-span-6" : "lg:col-span-9"} space-y-5 transition-all duration-300`}>
              {/* Upper Section: Zoomed 3D Airplane Fuselage & Cabin Cutaway */}
              <div id="cabin-seat-map" className="bg-gradient-to-b from-[#eaf2fc] via-[#dfeaf8] to-[#e4eefb] dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 rounded-[28px] sm:rounded-[36px] p-3.5 sm:p-5 shadow-xs border border-white/80 dark:border-slate-800 relative min-h-[340px] sm:min-h-[380px] flex flex-col justify-between scroll-mt-6">
                
                {/* Floating Top Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-20 mb-1">
                  {/* Left: Deck / Zone switchers */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-xs border border-slate-200/80 dark:border-slate-700 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {[
                        { id: 1, label: t("flight_admin.deck_all"), title: t("flight_admin.deck_all_title") },
                        { id: 2, label: t("flight_admin.deck_front"), title: t("flight_admin.deck_front_title") },
                        { id: 3, label: t("flight_admin.deck_aft"), title: t("flight_admin.deck_aft_title") },
                      ].map((deck) => (
                        <button
                          key={deck.id}
                          type="button"
                          onClick={() => setSelectedDeck(deck.id)}
                          className={`h-8 px-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                            selectedDeck === deck.id
                              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50"
                          }`}
                          title={deck.title}
                        >
                          <span>{deck.id}</span>
                          <span className="text-[10px] font-medium opacity-85 hidden sm:inline">{deck.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Active Zone Badge (Borderless text) */}
                    <span className="hidden xl:inline-flex items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1.5 select-none">
                      {selectedDeck === 1
                        ? t("flight_admin.zone_full_badge")
                        : selectedDeck === 2
                        ? t("flight_admin.zone_front_badge")
                        : t("flight_admin.zone_aft_badge")}
                    </span>
                  </div>

                  {/* Right: Live Weather widget badge & Quick Live Status trigger */}
                  <div className="flex items-center gap-2">
                    {!showLiveStatus && (
                      <button
                        type="button"
                        onClick={toggleLiveStatus}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-sky-200/80 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 shadow-2xs text-xs font-bold transition-all cursor-pointer select-none"
                        title={language === "th" ? "เปิดแถบสถานะ Live Status" : "Open Live Status Panel"}
                      >
                        <Activity className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                        <span>{t("flight_admin.live_status_title") || "Live Status"}</span>
                        <PanelRightOpen className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    )}

                    <div
                      className="flex items-center gap-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs shrink-0 select-none whitespace-nowrap transition-all hover:shadow-xs"
                      title={`${t("flight_admin.weather_dest_title")}: ${getCityDetails(activeFlightData.destCity, language).cityName} (${weather?.temperature || 28}°C)`}
                    >
                      {weatherLoading ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 animate-spin shrink-0" />
                      ) : (
                        renderWeatherIcon(weather?.iconType)
                      )}
                      <div className="flex flex-col text-left shrink-0">
                        <div className="flex items-baseline gap-1 sm:gap-1.5 leading-none">
                          <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                            {weather ? `${weather.temperature}°` : "28°"}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                            {weather?.cityCode || activeFlightData.destCode}
                          </span>
                          {weather && (
                            <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-400 font-medium hidden md:inline truncate max-w-[90px]">
                              • {getWeatherConditionText(weather.weatherCode, language)}
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 whitespace-nowrap leading-none">
                          {t("flight_admin.feels_like")} {weather ? `${weather.apparentTemperature}°` : "31°"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Scroll Indicator Hint */}
                <div className="sm:hidden flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium py-0.5">
                  <span>↔ {t("flight_admin.swipe_hint")}</span>
                </div>

                {/* Center: AUTHENTIC COMMERCIAL AIRLINER WITH FULL SWEPT WINGS & HORIZONTALLY SCROLLABLE TOUCH MAP */}
                <div className="relative my-auto overflow-x-auto overflow-y-hidden w-full touch-pan-x select-none py-2 no-scrollbar rounded-2xl">
                  <div
                    className="relative w-[860px] h-[360px] flex items-center justify-center shrink-0 mx-auto transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                  >
                    
                    {/* SVG 3D Airliner Fuselage, Dynamic Wings, Engines & Tail matching aircraft model */}
                    <AirlinerFuselageSVG
                      cabinType={cabinType}
                      model={currentAircraft.model}
                      airlineCode={currentAircraft.airlineCode}
                    />

                    {/* ── Interactive Seating Cabin Overlay (100% Enclosed within Cabin Floor Cutout) ── */}
                    <div
                      className="absolute z-10 flex items-center justify-between"
                      style={{
                        left: "172px",
                        top: cabinType === "widebody" ? "104px" : cabinType === "turboprop" ? "112px" : "108px",
                        width: "576px",
                        height: cabinType === "widebody" ? "152px" : cabinType === "turboprop" ? "136px" : "144px",
                      }}
                    >
                      {/* Galley Bulkhead Badges on left */}
                      <div className="flex flex-col justify-between h-full py-1 pr-2 text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 select-none shrink-0">
                        <span className="w-5.5 h-5.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-xs leading-none">
                          01
                        </span>
                        <span className="w-5.5 h-5.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-xs leading-none">
                          {cabinConfig.rows[cabinConfig.rows.length - 1] < 10
                            ? `0${cabinConfig.rows[cabinConfig.rows.length - 1]}`
                            : cabinConfig.rows[cabinConfig.rows.length - 1]}
                        </span>
                      </div>

                      {/* Dynamic Seating Grid */}
                      <div className="flex-1 h-full flex flex-col justify-between py-0.5 min-w-0 pr-1">
                        {cabinConfig.hasTwinAisle ? (
                          /* ─── TWIN-AISLE CONFIGURATION (WIDE-BODY JETS: B777, B787, A350) ─── */
                          <>
                            {/* TOP BLOCK: K, J */}
                            <div className="flex flex-col justify-between gap-[2px]">
                              {cabinConfig.topRows.map((col) => (
                                <div
                                  key={col}
                                  className="items-center"
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${cabinConfig.rows.length}, minmax(0, 1fr))`,
                                    gap: cabinConfig.gapPx,
                                  }}
                                >
                                  {cabinConfig.rows.map((row) => renderSeat(row, col))}
                                </div>
                              ))}
                            </div>

                            {/* TOP AISLE WALKWAY */}
                            {renderAisleRow("top-aisle")}

                            {/* CENTER BLOCK: G, F, E, D */}
                            <div className="flex flex-col justify-between gap-[2px]">
                              {cabinConfig.centerRows.map((col) => (
                                <div
                                  key={col}
                                  className="items-center"
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${cabinConfig.rows.length}, minmax(0, 1fr))`,
                                    gap: cabinConfig.gapPx,
                                  }}
                                >
                                  {cabinConfig.rows.map((row) => renderSeat(row, col))}
                                </div>
                              ))}
                            </div>

                            {/* BOTTOM AISLE WALKWAY */}
                            {renderAisleRow("bot-aisle")}

                            {/* BOTTOM BLOCK: B, A */}
                            <div className="flex flex-col justify-between gap-[2px]">
                              {cabinConfig.bottomRows.map((col) => (
                                <div
                                  key={col}
                                  className="items-center"
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${cabinConfig.rows.length}, minmax(0, 1fr))`,
                                    gap: cabinConfig.gapPx,
                                  }}
                                >
                                  {cabinConfig.rows.map((row) => renderSeat(row, col))}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          /* ─── SINGLE-AISLE CONFIGURATION (TURBOPROP ATR 72 & NARROW-BODY A320/B737) ─── */
                          <>
                            {/* TOP ROWS */}
                            <div className="flex flex-col justify-between gap-[3px]">
                              {cabinConfig.topRows.map((col) => (
                                <div
                                  key={col}
                                  className="items-center"
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${cabinConfig.rows.length}, minmax(0, 1fr))`,
                                    gap: cabinConfig.gapPx,
                                  }}
                                >
                                  {cabinConfig.rows.map((row) => renderSeat(row, col))}
                                </div>
                              ))}
                            </div>

                            {/* SINGLE CENTRAL AISLE WALKWAY */}
                            {renderAisleRow("center-aisle")}

                            {/* BOTTOM ROWS */}
                            <div className="flex flex-col justify-between gap-[3px]">
                              {cabinConfig.bottomRows.map((col) => (
                                <div
                                  key={col}
                                  className="items-center"
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${cabinConfig.rows.length}, minmax(0, 1fr))`,
                                    gap: cabinConfig.gapPx,
                                  }}
                                >
                                  {cabinConfig.rows.map((row) => renderSeat(row, col))}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Bottom Row: Zoom buttons & Seat Class Legend */}
                <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.3))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-50 cursor-pointer"
                      title={t("flight_admin.zoom_in")}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.85))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-50 cursor-pointer"
                      title={t("flight_admin.zoom_out")}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Seat Class & Status Legend (Borderless Clean Layout) */}
                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-[11px] select-none py-1">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-sky-100 dark:bg-sky-950/80 border border-sky-400 dark:border-sky-600 shadow-2xs shrink-0" />
                      <span className="font-bold text-sky-800 dark:text-sky-300">{language === "th" ? "ชั้นธุรกิจ" : "Business"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-2xs shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{language === "th" ? "ชั้นประหยัด" : "Economy"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-amber-600 border border-amber-700 shadow-2xs shrink-0" />
                      <span className="font-semibold text-amber-700 dark:text-amber-400">{language === "th" ? "จองแล้ว" : "Booked"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] bg-[#181a20] border border-slate-700 shadow-2xs shrink-0" />
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{language === "th" ? "แอดมินล็อก" : "Locked"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Section: Flight Details & Map Card */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[36px] p-3.5 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4 sm:space-y-6 overflow-hidden min-w-0">
                {/* Header Summary Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 min-w-0">
                  {/* Airline & Price */}
                  <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto min-w-0 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs shrink-0">
                        ✈
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                          {activeFlightData.airlineName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium truncate">
                          {t("flight_admin.price_from")} {activeFlightData.priceStr}
                        </div>
                      </div>
                    </div>

                    {/* On mobile / small tablet, show Price tag inline on top */}
                    <div className="md:hidden text-right shrink-0">
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">{t("flight_admin.price_label")}</div>
                      <div className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {activeFlightData.priceStr}
                      </div>
                    </div>
                  </div>

                  {/* Flight Route & Duration */}
                  <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 md:gap-6 text-center w-full md:w-auto bg-slate-50/80 dark:bg-slate-800/60 md:bg-transparent md:dark:bg-transparent py-2 md:py-0 px-3 md:px-0 rounded-2xl md:rounded-none min-w-0">
                    <div className="text-left md:text-center min-w-0 max-w-[95px] sm:max-w-[125px] md:max-w-[120px] lg:max-w-[105px] xl:max-w-[140px]">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">{activeFlightData.originCode}</div>
                      <div className="text-[10px] text-slate-400 truncate" title={activeFlightData.originName}>{activeFlightData.originName}</div>
                    </div>

                    <div className="space-y-1 flex-1 md:flex-initial flex flex-col items-center px-1 shrink-0">
                      <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{formatFlightDuration(activeFlightData.durationStr, language)}</div>
                      <div className="flex items-center gap-1 w-16 sm:w-24 md:w-28">
                        <div className="h-0.5 flex-1 border-t-2 border-dashed border-slate-300 dark:border-slate-700" />
                        <span className="text-[8px] sm:text-[9px] font-semibold text-slate-400 px-1 bg-slate-100 dark:bg-slate-800 rounded whitespace-nowrap">{t("flight_admin.direct_flight")}</span>
                        <div className="h-0.5 flex-1 border-t-2 border-dashed border-slate-300 dark:border-slate-700" />
                      </div>
                    </div>

                    <div className="text-right md:text-center min-w-0 max-w-[95px] sm:max-w-[125px] md:max-w-[120px] lg:max-w-[105px] xl:max-w-[140px]">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">{activeFlightData.destCode}</div>
                      <div className="text-[10px] text-slate-400 truncate" title={activeFlightData.destName}>{activeFlightData.destName}</div>
                    </div>
                  </div>

                  {/* Price Tag (Desktop only) */}
                  <div className="hidden md:block text-right shrink-0">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t("flight_admin.price_label")}</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {activeFlightData.priceStr}
                    </div>
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="w-full overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold text-slate-400 overflow-x-auto pb-1 max-w-full no-scrollbar select-none">
                    {[
                      { key: "details", label: t("flight_admin.subtab_details") },
                      { key: "price", label: t("flight_admin.subtab_price") },
                      { key: "refund", label: t("flight_admin.subtab_refund") },
                      { key: "reschedule", label: t("flight_admin.subtab_reschedule") },
                      { key: "offers", label: t("flight_admin.subtab_offers") },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveSubTab(tab.key as any)}
                        className={`cursor-pointer transition-colors pb-1.5 relative whitespace-nowrap shrink-0 text-xs ${
                          activeSubTab === tab.key
                            ? "text-slate-900 dark:text-white font-extrabold"
                            : "hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        {tab.label}
                        {activeSubTab === tab.key && (
                          <motion.div layoutId="subTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub Tab Content Switcher */}
                <AnimatePresence mode="wait">
                  {/* TAB 1: FLIGHT DETAILS */}
                  {activeSubTab === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 items-center pt-1 min-w-0"
                    >
                      {/* Left Specs & Timeline (7 cols on xl) */}
                      <div className="xl:col-span-7 space-y-4 text-xs min-w-0">
                        {/* Departure Node */}
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                          <div className="w-14 sm:w-16 shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">
                            <div>{activeFlightData.depDate}</div>
                            <div className="text-[10px] text-slate-400">{t("flight_admin.today")}</div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                              ({activeFlightData.originCode}) {activeFlightData.originName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {activeFlightData.terminalInfo}
                            </div>
                          </div>
                        </div>

                        {/* Flight Mid details */}
                        <div className="flex items-center gap-3 sm:gap-4 pl-1 min-w-0">
                          <div className="w-14 sm:w-16 shrink-0 text-[10px] text-slate-400 font-mono">{formatFlightDuration(activeFlightData.durationStr, language)}</div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300 min-w-0 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white truncate">{activeFlightData.airlineName}</span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-slate-500 dark:text-slate-400 text-[10px] truncate">{currentAircraft.flightNo} • {t("flight_admin.cabin_classes")}</span>
                          </div>
                        </div>

                        {/* Amenities 2/3-col grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-2.5 pt-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400 text-[11px] min-w-0">
                            <Luggage className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={t("flight_admin.amenity_baggage")}>{t("flight_admin.amenity_baggage")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400 text-[11px] min-w-0">
                            <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={t("flight_admin.amenity_wifi")}>{t("flight_admin.amenity_wifi")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400 text-[11px] min-w-0">
                            <Plane className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={currentAircraft.model}>{currentAircraft.model}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400 text-[11px] min-w-0">
                            <Armchair className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={t("flight_admin.amenity_pitch")}>{t("flight_admin.amenity_pitch")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400 text-[11px] min-w-0">
                            <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={t("flight_admin.amenity_power")}>{t("flight_admin.amenity_power")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400 text-[11px] min-w-0">
                            <Tv className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={t("flight_admin.amenity_entertainment")}>{t("flight_admin.amenity_entertainment")}</span>
                          </div>
                        </div>

                        {/* Arrival Node */}
                        <div className="flex items-start gap-3 sm:gap-4 pt-1 min-w-0">
                          <div className="w-14 sm:w-16 shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                            {activeFlightData.arrDate}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                              ({activeFlightData.destCode}) {activeFlightData.destName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={getCityFullName(activeFlightData.rawDestCity || activeFlightData.destCity, language)}>
                              {getCityFullName(activeFlightData.rawDestCity || activeFlightData.destCity, language)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Map Canvas with Thailand Route Map (5 cols on xl) */}
                      <div className="xl:col-span-5 flex items-center justify-center min-w-0 w-full">
                        <ThailandFlightMap
                          originCode={activeFlightData.originCode || "DMK"}
                          destCode={activeFlightData.destCode || "CNX"}
                          originCity={activeFlightData.originName}
                          destCity={activeFlightData.destName}
                          flightNo={currentAircraft.flightNo}
                          durationStr={activeFlightData.durationStr}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: PRICE DETAILS */}
                  {activeSubTab === "price" && (
                    <motion.div
                      key="price"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 items-stretch pt-1 min-w-0"
                    >
                      {/* Left: Price Breakdown Table (7 cols on xl) */}
                      <div className="xl:col-span-7 space-y-3 min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white pb-1">
                          {t("flight_admin.price_breakdown_title")}
                        </div>

                        <div className="space-y-2 text-xs">
                          {(() => {
                            const rawPrice = activeFlightData.price || 2190;
                            const baseVal = Math.round(rawPrice * 0.76);
                            const airportVal = 100;
                            const fuelVal = Math.round(rawPrice * 0.14);
                            const vatVal = rawPrice - baseVal - airportVal - fuelVal;

                            return (
                              <>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {t("flight_admin.base_fare")}
                                  </span>
                                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                    ฿{baseVal.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {t("flight_admin.airport_tax")}
                                  </span>
                                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                    ฿{airportVal.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {t("flight_admin.fuel_surcharge")}
                                  </span>
                                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                    ฿{fuelVal.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {t("flight_admin.vat")}
                                  </span>
                                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                    ฿{Math.max(0, vatVal).toLocaleString()}
                                  </span>
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                  <span className="font-black text-slate-900 dark:text-white text-xs">
                                    {t("flight_admin.total_net")}
                                  </span>
                                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                                    {activeFlightData.priceStr}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Supported Payment Badges */}
                        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="text-slate-400 font-medium mr-1">
                            {t("flight_admin.payment_channels")}
                          </span>
                          {["PromptPay", "Visa / Mastercard", "JCB", "TrueMoney", "SkyPoints"].map((method) => (
                            <span
                              key={method}
                              className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Inclusions Box (5 cols on xl) */}
                      <div className="xl:col-span-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-col justify-between text-xs min-w-0">
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white mb-2.5">
                            {t("flight_admin.fare_inclusions_title")}
                          </div>
                          <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-2 min-w-0">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="break-words">{t("flight_admin.inc_carryon")}</span>
                            </li>
                            <li className="flex items-center gap-2 min-w-0">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="break-words">{t("flight_admin.inc_checked")}</span>
                            </li>
                            <li className="flex items-center gap-2 min-w-0">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="break-words">{t("flight_admin.inc_seat")}</span>
                            </li>
                            <li className="flex items-center gap-2 min-w-0">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="break-words">{t("flight_admin.inc_snack")}</span>
                            </li>
                          </ul>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 break-words">
                          {t("flight_admin.inc_skymiles")}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: REFUND POLICY */}
                  {activeSubTab === "refund" && (
                    <motion.div
                      key="refund"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 items-stretch pt-1 min-w-0"
                    >
                      {/* Left: Policy Tiers (7 cols on xl) */}
                      <div className="xl:col-span-7 space-y-3 min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white pb-1">
                          {t("flight_admin.refund_policy_title")}
                        </div>

                        <div className="space-y-3 text-xs min-w-0">
                          {/* Tier 1 */}
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {t("flight_admin.refund_tier1_title")}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                                {t("flight_admin.refund_tier1_badge")}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                              {t("flight_admin.refund_tier1_desc")}
                            </p>
                          </div>

                          {/* Tier 2 */}
                          <div className="space-y-0.5 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {t("flight_admin.refund_tier2_title")}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full shrink-0">
                                {t("flight_admin.refund_tier2_badge")}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                              {t("flight_admin.refund_tier2_desc")}
                            </p>
                          </div>

                          {/* Tier 3 */}
                          <div className="space-y-0.5 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {t("flight_admin.refund_tier3_title")}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                                {t("flight_admin.refund_tier3_badge")}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                              {t("flight_admin.refund_tier3_desc")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Refund Help Box (5 cols on xl) */}
                      <div className="xl:col-span-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-col justify-between text-xs min-w-0">
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white mb-2">
                            {t("flight_admin.refund_proc_title")}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                            {t("flight_admin.refund_proc_desc")}
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 break-words">
                          {t("flight_admin.refund_admin_note")}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: RESCHEDULE */}
                  {activeSubTab === "reschedule" && (
                    <motion.div
                      key="reschedule"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 items-stretch pt-1 min-w-0"
                    >
                      {/* Left: Reschedule Conditions (7 cols on xl) */}
                      <div className="xl:col-span-7 space-y-3 min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white pb-1">
                          {t("flight_admin.reschedule_title")}
                        </div>

                        <div className="space-y-3 text-xs min-w-0">
                          {/* Item 1 */}
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {t("flight_admin.reschedule_tier1_title")}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                                {t("flight_admin.reschedule_tier1_badge")}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                              {t("flight_admin.reschedule_tier1_desc")}
                            </p>
                          </div>

                          {/* Item 2 */}
                          <div className="space-y-0.5 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {t("flight_admin.reschedule_tier2_title")}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full shrink-0">
                                {t("flight_admin.reschedule_tier2_badge")}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                              {t("flight_admin.reschedule_tier2_desc")}
                            </p>
                          </div>

                          {/* Item 3 */}
                          <div className="space-y-0.5 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {t("flight_admin.reschedule_tier3_title")}
                              </span>
                              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full shrink-0">
                                {t("flight_admin.reschedule_tier3_badge")}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                              {t("flight_admin.reschedule_tier3_desc")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Reschedule Info (5 cols on xl) */}
                      <div className="xl:col-span-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-col justify-between text-xs min-w-0">
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white mb-2">
                            {t("flight_admin.reschedule_how_title")}
                          </div>
                          <ol className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                            <li className="break-words">{t("flight_admin.reschedule_step1")}</li>
                            <li className="break-words">{t("flight_admin.reschedule_step2")}</li>
                            <li className="break-words">{t("flight_admin.reschedule_step3")}</li>
                          </ol>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 break-words">
                          {t("flight_admin.reschedule_admin_note")}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 5: OFFERS & PRIVILEGES */}
                  {activeSubTab === "offers" && (
                    <motion.div
                      key="offers"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 items-stretch pt-1 min-w-0"
                    >
                      {/* Left: Offers Grid (7 cols on xl) */}
                      <div className="xl:col-span-7 space-y-3 min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white pb-1">
                          {t("flight_admin.offers_title")}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs min-w-0">
                          {/* Offer 1 */}
                          <div className="min-w-0 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs break-words">
                              {t("flight_admin.offer_student_title")}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                              {t("flight_admin.offer_student_desc")}
                            </div>
                          </div>

                          {/* Offer 2 */}
                          <div className="min-w-0 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs break-words">
                              {t("flight_admin.offer_cards_title")}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                              {t("flight_admin.offer_cards_desc")}
                            </div>
                          </div>

                          {/* Offer 3 */}
                          <div className="min-w-0 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs break-words">
                              {t("flight_admin.offer_loyalty_title")}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                              {t("flight_admin.offer_loyalty_desc")}
                            </div>
                          </div>

                          {/* Offer 4 */}
                          <div className="min-w-0 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
                            <div className="font-extrabold text-slate-900 dark:text-white text-xs break-words">
                              {t("flight_admin.offer_cafe_title")}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                              {t("flight_admin.offer_cafe_desc")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Voucher / Promo Box (5 cols on xl) */}
                      <div className="xl:col-span-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-col justify-between text-xs min-w-0 gap-3">
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 dark:text-white mb-2">
                            {t("flight_admin.promo_box_title")}
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center my-1.5 shadow-2xs">
                            <div className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-wider break-all">
                              SKYPROMO2026
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 break-words">
                              {t("flight_admin.promo_box_discount")}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 break-words leading-relaxed">
                          {t("flight_admin.promo_box_routes")}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                RIGHT COLUMN (3 cols): LIVE STATUS & SKYAI ASSISTANT
            ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
              {showLiveStatus && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="lg:col-span-3 space-y-5"
                >
                  {/* Top Card: Live Status Donut Chart */}
                  <div className="bg-white dark:bg-slate-900 rounded-[36px] p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {t("flight_admin.live_status_title")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={refreshData}
                          title={language === "th" ? "รีเฟรชข้อมูล" : "Refresh"}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={toggleLiveStatus}
                          title={language === "th" ? "ปิด / ซ่อนแถบนี้" : "Close Live Status Panel"}
                          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <PanelRightClose className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* SVG Multi-Segment Donut Chart */}
                    <div className="flex justify-center py-2">
                      <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
                        <defs>
                          <pattern id="striped" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" strokeWidth="2.5" />
                          </pattern>
                          <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="#64748b" />
                          </pattern>
                          <pattern id="hatched" width="6" height="6" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="0" y2="6" stroke="#cbd5e1" strokeWidth="2.5" />
                          </pattern>
                        </defs>

                        {/* Background Track */}
                        <circle cx="85" cy="85" r="62" stroke="#f1f5f9" strokeWidth="20" fill="none" />

                        {/* Segment 1: Solid Orange (Active Flights / Capacity) */}
                        <circle
                          cx="85"
                          cy="85"
                          r="62"
                          stroke="#fb923c"
                          strokeWidth="20"
                          strokeDasharray="160 230"
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Segment 2: Hatched Pattern (Booked Passengers) */}
                        <circle
                          cx="85"
                          cy="85"
                          r="62"
                          stroke="url(#hatched)"
                          strokeWidth="20"
                          strokeDasharray="90 300"
                          strokeDashoffset="-170"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Segment 3: Dotted Pattern (Locked Seats) */}
                        <circle
                          cx="85"
                          cy="85"
                          r="62"
                          stroke="url(#dots)"
                          strokeWidth="20"
                          strokeDasharray="55 335"
                          strokeDashoffset="-270"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Segment 4: Striped Pattern (Available) */}
                        <circle
                          cx="85"
                          cy="85"
                          r="62"
                          stroke="url(#striped)"
                          strokeWidth="20"
                          strokeDasharray="50 340"
                          strokeDashoffset="-330"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span>{t("flight_admin.status_active_flights")}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{fleetCards.length}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-80" />
                          <span>{t("flight_admin.status_available_seats")}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{availableCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 opacity-80" />
                          <span>{t("flight_admin.status_admin_locked")}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{lockedCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span>{t("flight_admin.status_booked_seats")}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{bookedCount}</span>
                      </div>

                      {/* Admin Quick Action Controls */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                          id="admin-unlock-all-btn"
                          data-testid="admin-unlock-all-btn"
                          type="button"
                          onClick={handleUnlockAll}
                          title={t("flight_admin.btn_unlock_all")}
                          className="flex-1 py-2 px-2 sm:px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer text-center truncate"
                        >
                          {t("flight_admin.btn_unlock_all")}
                        </button>
                        <button
                          id="admin-reset-defaults-btn"
                          data-testid="admin-reset-defaults-btn"
                          type="button"
                          onClick={handleResetDefaults}
                          title={t("flight_admin.btn_reset_defaults")}
                          className="flex-1 py-2 px-2 sm:px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer text-center truncate"
                        >
                          {t("flight_admin.btn_reset_defaults")}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: PASSENGER BOOKINGS MANIFEST
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "bookings" && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                  {t("flight_admin.title")}
                </h2>
                <p className="text-muted-foreground text-xs mt-0.5 font-semibold">
                  {t("flight_admin.records_count").replace("{count}", String(items.length))}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("flight_admin.search_placeholder")}
                    className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-sm outline-none focus:border-sky-500 transition-colors shadow-xs"
                  />
                </div>
                <button
                  onClick={() => {
                    if (confirm(t("flight_admin.delete_confirm"))) {
                      clearBookings();
                      refreshData();
                      toast.success(t("flight_admin.cleared_toast"));
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 text-xs font-bold transition-all shadow-xs cursor-pointer text-center whitespace-nowrap"
                >
                  {t("flight_admin.btn_clear")}
                </button>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <motion.div
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-display text-base font-bold text-slate-600 dark:text-slate-400">
                  {t("flight_admin.no_bookings")}
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-left border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_date")}</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_passenger")}</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_flight_aircraft")}</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_seat")}</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_route")}</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_depart")}</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_passengers")}</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_contact")}</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{t("flight_admin.th_promo")}</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    <AnimatePresence initial={false}>
                      {filteredBookings.map((b) => (
                        <motion.tr
                          key={b.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {formatDateTime(b.createdAt, language)}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                            {b.passengerName}
                          </td>
                          <td className="px-4 py-3.5 font-mono">
                            {b.legs && b.legs.length > 1 ? (
                              <div className="space-y-1.5 min-w-[130px]">
                                {b.legs.map((leg, idx) => (
                                  <div key={idx} className="flex flex-col leading-tight">
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-mono text-[9px] font-bold shrink-0">
                                        {idx + 1}
                                      </span>
                                      <span className="font-bold text-sky-600 dark:text-sky-400 text-xs">
                                        {leg.flightNo || (idx === 0 ? b.outboundFlightNo : b.inboundFlightNo) || `BTN20${idx + 1}`}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-5.5 mt-0.5 truncate">
                                      {leg.aircraftModel || (idx === 0 ? b.aircraftModel : b.inboundAircraftModel) || "Airbus A320"}
                                      {leg.aircraftTail || (idx === 0 ? b.aircraftTail : b.inboundAircraftTail)
                                        ? ` (${leg.aircraftTail || (idx === 0 ? b.aircraftTail : b.inboundAircraftTail)})`
                                        : ""}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : b.tripType === "round" && (b.inboundFlightNo || b.inboundAircraftModel) ? (
                              <div className="space-y-1.5 min-w-[130px]">
                                <div className="flex flex-col leading-tight">
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-mono text-[9px] font-bold shrink-0">
                                      1
                                    </span>
                                    <span className="font-bold text-sky-600 dark:text-sky-400 text-xs">
                                      {b.outboundFlightNo || "BTN201"}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-5.5 mt-0.5 truncate">
                                    {b.aircraftModel || "Airbus A320"} {b.aircraftTail ? `(${b.aircraftTail})` : ""}
                                  </div>
                                </div>
                                <div className="flex flex-col leading-tight">
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-bold shrink-0">
                                      2
                                    </span>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                                      {b.inboundFlightNo || "BTN202"}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-5.5 mt-0.5 truncate">
                                    {b.inboundAircraftModel || b.aircraftModel || "Airbus A320"} {b.inboundAircraftTail ? `(${b.inboundAircraftTail})` : ""}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-sky-600 dark:text-sky-400 text-xs">
                                  {b.legs?.[0]?.flightNo || b.outboundFlightNo || "BTN201"}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {b.legs?.[0]?.aircraftModel || b.aircraftModel || "Airbus A320"} {(b.legs?.[0]?.aircraftTail || b.aircraftTail) ? `(${b.legs?.[0]?.aircraftTail || b.aircraftTail})` : ""}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold">
                            {b.legs && b.legs.length > 1 ? (
                              <div className="space-y-1.5">
                                {b.legs.map((leg, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] font-bold shrink-0">
                                      {idx + 1}
                                    </span>
                                    {leg.seat ? (
                                      <span className="text-sky-600 dark:text-sky-400">{leg.seat}</span>
                                    ) : leg.releasedSeat ? (
                                      <span className="text-slate-400 dark:text-slate-500 font-normal italic text-[11px]">
                                        <span className="line-through decoration-slate-400">{leg.releasedSeat}</span>
                                        <span className="no-underline ml-1">({language === "th" ? "ปลดล็อกแล้ว" : "Released"})</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-normal italic text-[11px]">
                                        {t("flight_admin.seat_not_specified")}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : b.returnSeat || b.releasedReturnSeat ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] font-bold shrink-0">
                                    1
                                  </span>
                                  {b.seat ? (
                                    <span className="text-sky-600 dark:text-sky-400">{b.seat}</span>
                                  ) : b.releasedSeat ? (
                                    <span className="text-slate-400 dark:text-slate-500 font-normal italic text-[11px]">
                                      <span className="line-through decoration-slate-400">{b.releasedSeat}</span>
                                      <span className="no-underline ml-1">({language === "th" ? "ปลดล็อกแล้ว" : "Released"})</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-normal italic text-[11px]">
                                      {t("flight_admin.seat_not_specified")}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] font-bold shrink-0">
                                    2
                                  </span>
                                  {b.returnSeat ? (
                                    <span className="text-indigo-600 dark:text-indigo-400">{b.returnSeat}</span>
                                  ) : b.releasedReturnSeat ? (
                                    <span className="text-slate-400 dark:text-slate-500 font-normal italic text-[11px]">
                                      <span className="line-through decoration-slate-400">{b.releasedReturnSeat}</span>
                                      <span className="no-underline ml-1">({language === "th" ? "ปลดล็อกแล้ว" : "Released"})</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-normal italic text-[11px]">
                                      {t("flight_admin.seat_not_specified")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              b.seat ? (
                                <span className="text-sky-600 dark:text-sky-400">{b.seat}</span>
                              ) : b.releasedSeat ? (
                                <span className="text-slate-400 dark:text-slate-500 font-normal italic text-[11px]">
                                  <span className="line-through decoration-slate-400">{b.releasedSeat}</span>
                                  <span className="no-underline ml-1">({language === "th" ? "ปลดล็อกแล้ว" : "Released"})</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal italic text-[11px]">
                                  {t("flight_admin.seat_not_specified")}
                                </span>
                              )
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                            {b.tripType === "multicity" && b.legs && b.legs.length > 0 ? (
                              <span>
                                {b.legs.map((leg, i) => (
                                  <span key={i}>
                                    {i > 0 && " → "}
                                    <span
                                      title={getCityFullName(leg.from, language)}
                                      className="cursor-help underline decoration-dotted underline-offset-2"
                                    >
                                      {getCityNameOnly(leg.from)}
                                    </span>
                                  </span>
                                ))}
                                {" → "}
                                <span
                                  title={getCityFullName(b.legs[b.legs.length - 1].to, language)}
                                  className="cursor-help underline decoration-dotted underline-offset-2"
                                >
                                  {getCityNameOnly(b.legs[b.legs.length - 1].to)}
                                </span>
                              </span>
                            ) : (
                              <>
                                <span
                                  title={getCityFullName(b.from, language)}
                                  className="cursor-help underline decoration-dotted underline-offset-2"
                                >
                                  {getCityLabel(b.from)}
                                </span>
                                {" → "}
                                <span
                                  title={getCityFullName(b.to, language)}
                                  className="cursor-help underline decoration-dotted underline-offset-2"
                                >
                                  {getCityLabel(b.to)}
                                </span>
                              </>
                            )}{" "}
                            <span className="text-[11px] text-slate-400 font-normal ml-1">
                              ({b.tripType === "round"
                                ? t("flight.round_trip")
                                : b.tripType === "multicity"
                                ? t("flight_admin.trip_multicity")
                                : t("flight.one_way")})
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300 text-xs">
                            {b.tripType === "multicity" && b.legs && b.legs.length > 0 ? (
                              <div className="space-y-1">
                                {b.legs.map((leg, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
                                    {b.legs!.length > 1 && (
                                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] font-bold shrink-0">
                                        {idx + 1}
                                      </span>
                                    )}
                                    <span>{formatDate(leg.departDate || b.departDate, language)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="whitespace-nowrap">
                                {formatDate(b.departDate, language)}
                                {b.returnDate ? ` / ${formatDate(b.returnDate, language)}` : ""}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {b.passengers}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-slate-900 dark:text-slate-100">{b.email}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              {b.phone}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-xs">
                            {b.promoCode || <span className="text-slate-400 font-normal">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => {
                                if (confirm(t("flight_admin.delete_confirm"))) {
                                  deleteBooking(b.id);
                                  refreshData();
                                  toast.success(t("flight_admin.delete_success"));
                                }
                              }}
                              className="text-red-500 hover:text-red-700 font-medium text-xs cursor-pointer hover:underline"
                            >
                              {t("flight_admin.btn_delete")}
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
        )}
        {/* Booked Seat Management Modal */}
        <Dialog
          open={Boolean(activeBookedSeatModal)}
          onOpenChange={(open) => {
            if (!open) setActiveBookedSeatModal(null);
          }}
        >
          <DialogContent
            className="max-w-md w-[92vw] p-0 overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
            onPointerDownOutside={() => setActiveBookedSeatModal(null)}
            onInteractOutside={() => setActiveBookedSeatModal(null)}
          >
            {activeBookedSeatModal && (
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pr-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                        {t("flight_admin.modal_manage_seat")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("flight_admin.modal_seat_on_flight").replace("{seatId}", activeBookedSeatModal.seatId).replace("{flightNo}", selectedFlightNo)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passenger Info Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_passenger")}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{activeBookedSeatModal.booking.passengerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_route")}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {getCityNameOnly(activeBookedSeatModal.booking.from)} → {getCityNameOnly(activeBookedSeatModal.booking.to)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_date")}</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{formatDate(activeBookedSeatModal.booking.departDate, language)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_phone")}</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{activeBookedSeatModal.booking.phone || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_email")}</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{activeBookedSeatModal.booking.email || "-"}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleReleaseBookedSeat(activeBookedSeatModal.seatId)}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs text-center transition-colors cursor-pointer"
                  >
                    {t("flight_admin.modal_btn_release").replace("{seatId}", activeBookedSeatModal.seatId)}
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}