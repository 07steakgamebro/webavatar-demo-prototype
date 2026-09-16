import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getAirportCode,
  getCityDetails,
  getCityFullName,
} from "@/lib/cities";
import {
  getLockedSeats,
  getBookings,
  getAircraftCabinType,
  type CabinType,
  type Booking,
} from "@/lib/bookings";
import type { SeatMapLegInfo, SeatMapModalProps } from "../types";

export function SeatMapModal({
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

  const currentLeg: SeatMapLegInfo = useMemo(() => {
    return legs[activeModalLeg] || legs[0] || {
      legIndex: 0,
      label: "Flight 1",
      from: "DMK",
      to: "CNX",
      flightNo: "BTN201",
      aircraftModel: "Airbus A320-200",
      aircraftTail: "HS-BNA",
      cabinClass: "economy",
    };
  }, [legs, activeModalLeg]);

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
    const curDepartDate = currentLeg.departDate;
    const adminLocked = getLockedSeats(flightNo);
    const existing = getBookings();

    const booked = existing
      .filter((b: Booking) => {
        // Must match flightNo if available
        if (flightNo && (b.outboundFlightNo === flightNo || b.inboundFlightNo === flightNo || b.legs?.some((l) => l.flightNo === flightNo))) {
          if (curDepartDate) {
            const dateMatch =
              (b.outboundFlightNo === flightNo && (!b.departDate || b.departDate === curDepartDate)) ||
              (b.inboundFlightNo === flightNo && (!b.returnDate || b.returnDate === curDepartDate)) ||
              b.legs?.some((l) => l.flightNo === flightNo && (!l.departDate || l.departDate === curDepartDate));
            if (dateMatch) return true;
          } else {
            return true;
          }
        }
        // Fallback for bookings without flightNo: match route AND date strictly
        if (!b.outboundFlightNo && !b.inboundFlightNo && (!b.legs || b.legs.length === 0)) {
          const bOrig = getAirportCode(b.from);
          const bDest = getAirportCode(b.to);
          const routeMatch = (bOrig === curOrigCode && bDest === curDestCode) ||
                             (b.tripType === "round" && bOrig === curDestCode && bDest === curOrigCode);
          if (routeMatch && (!curDepartDate || !b.departDate || b.departDate === curDepartDate)) {
            return true;
          }
        }
        return false;
      })
      .flatMap((b: Booking) => {
        const seats: string[] = [];

        // Check legs
        if (b.legs && b.legs.length > 0) {
          b.legs.forEach((l) => {
            const lOrig = getAirportCode(l.from);
            const lDest = getAirportCode(l.to);
            const flightMatch = !flightNo || !l.flightNo || l.flightNo === flightNo;
            const routeMatch = lOrig === curOrigCode && lDest === curDestCode;
            const dateMatch = !curDepartDate || !l.departDate || l.departDate === curDepartDate;
            if (flightMatch && routeMatch && dateMatch && l.seat) {
              seats.push(...l.seat.split(",").map((s) => s.trim()));
            }
          });
        }

        // Check outbound
        const outOrig = getAirportCode(b.from);
        const outDest = getAirportCode(b.to);
        const outFlightMatch = !flightNo || !b.outboundFlightNo || b.outboundFlightNo === flightNo;
        const outRouteMatch = outOrig === curOrigCode && outDest === curDestCode;
        const outDateMatch = !curDepartDate || !b.departDate || b.departDate === curDepartDate;

        if (outFlightMatch && outRouteMatch && outDateMatch && b.seat) {
          seats.push(...b.seat.split(",").map((s) => s.trim()));
        }

        // Check inbound (for round trips)
        if (b.tripType === "round") {
          const inOrig = getAirportCode(b.to);
          const inDest = getAirportCode(b.from);
          const inFlightMatch = !flightNo || !b.inboundFlightNo || b.inboundFlightNo === flightNo;
          const inRouteMatch = inOrig === curOrigCode && inDest === curDestCode;
          const inDateMatch = !curDepartDate || !b.returnDate || b.returnDate === curDepartDate;

          if (inFlightMatch && inRouteMatch && inDateMatch) {
            const rSeat = b.returnSeat || (!b.outboundFlightNo && b.seat ? b.seat : "");
            if (rSeat) {
              seats.push(...rSeat.split(",").map((s) => s.trim()));
            }
          }
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
        t("flight.err_seat_business_only").replace("{seatId}", seatId)
      );
      return;
    }

    let updatedLegSeats: string[];
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

    let btnStyle: string;
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
            ? `${seatId} (${t("flight.seat_business_only_label")})`
            : `${seatId} (${isBusiness ? t("flight.cabin_business") : t("flight.cabin_economy")})`
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
                {t("flight.cabin_business")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 min-w-[10px] min-h-[10px] max-w-[10px] max-h-[10px] sm:min-w-[12px] sm:min-h-[12px] sm:max-w-[12px] sm:max-h-[12px] rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shrink-0 block"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium text-[10px] sm:text-[11px] whitespace-nowrap">
                {t("flight.cabin_economy")}
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
                    {legs.length > 1 ? `${currentLeg.label}: ` : ""}
                    {t('flight.selected_seats_more_needed')
                      .replace('{seats}', currentSeats.join(", "))
                      .replace('{more}', String(remainingSeats))}
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
                  {t('flight.next_flight_leg')
                    .replace('{current}', String(activeModalLeg + 2))
                    .replace('{total}', String(legs.length))}
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
                      ? t('flight.confirm_all_legs_seats')
                      : t('flight.save_seats_partial')
                          .replace('{current}', String(currentSeats.length))
                          .replace('{total}', String(maxSeats)))
                  : `${t('flight.seat_confirm')} (${currentSeats.length}/${maxSeats})`}
              </button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SeatMapModal;
