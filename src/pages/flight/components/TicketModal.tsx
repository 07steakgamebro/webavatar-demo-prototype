import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plane } from "lucide-react";
import { MOCK_FLEET } from "@/lib/bookings";
import {
  getAirportCode,
  getCityDetails,
  getCityFullName,
  getPromoDiscountRate,
} from "@/lib/cities";
import { parseDateForCard } from "../utils/dateHelpers";

interface TicketModalProps {
  booking: any;
  open: boolean;
  onClose: () => void;
}

export function TicketModal({ booking, open, onClose }: TicketModalProps) {
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

  const rawFlightNo = currentLeg?.flightNo || (activeLeg === 1 && booking.inboundFlightNo ? booking.inboundFlightNo : booking.outboundFlightNo);
  const matchedAircraft = rawFlightNo
    ? MOCK_FLEET.find((f) => f.flightNo === rawFlightNo)
    : MOCK_FLEET.find((f) => f.originCode === getCode(originCity) && f.destCode === getCode(destCity));

  const flightNumber = rawFlightNo || matchedAircraft?.flightNo || "BTN201";
  const aircraftModel = currentLeg?.aircraftModel || (activeLeg === 1 && booking.inboundAircraftModel ? booking.inboundAircraftModel : booking.aircraftModel) || matchedAircraft?.model || "Airbus A320neo";
  const aircraftTail = currentLeg?.aircraftTail || (activeLeg === 1 && booking.inboundAircraftTail ? booking.inboundAircraftTail : booking.aircraftTail) || matchedAircraft?.tailNumber || "";
  const seatNumber = currentLeg?.seat || (activeLeg === 1 && booking.returnSeat ? booking.returnSeat : booking.seat) || "-";
  const flightClass = (currentLeg?.class || booking.class) === "business" ? t('flight.cabin_business') : t('flight.cabin_economy');

  const basePrice = booking.pricePerPax || currentLeg?.price || matchedAircraft?.price || (hasMultipleLegs ? booking.legs.reduce((sum: number, l: any) => sum + (l.price || 0), 0) : 990);
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

export default TicketModal;
