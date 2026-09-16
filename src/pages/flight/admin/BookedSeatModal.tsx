import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";
import { formatDate } from "@/lib/dateUtils";
import { getCityDetails } from "@/lib/cities";
import type { Booking } from "@/lib/bookings";

interface BookedSeatModalProps {
  activeBookedSeatModal: { seatId: string; booking: Booking } | null;
  onClose: () => void;
  onReleaseSeat: (seatId: string) => void;
  selectedFlightNo: string;
}

export function BookedSeatModal({
  activeBookedSeatModal,
  onClose,
  onReleaseSeat,
  selectedFlightNo,
}: BookedSeatModalProps) {
  const { t, language } = useTranslation();

  const getCityNameOnly = (city: string) => {
    return getCityDetails(city || "", language).cityName;
  };

  return (
    <Dialog
      open={Boolean(activeBookedSeatModal)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-md w-[92vw] p-0 overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        onPointerDownOutside={() => onClose()}
        onInteractOutside={() => onClose()}
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
                    {t("flight_admin.modal_seat_on_flight")
                      .replace("{seatId}", activeBookedSeatModal.seatId)
                      .replace("{flightNo}", selectedFlightNo)}
                  </p>
                </div>
              </div>
            </div>

            {/* Passenger Info Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_passenger")}</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {activeBookedSeatModal.booking.passengerName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_route")}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {getCityNameOnly(activeBookedSeatModal.booking.from)} → {getCityNameOnly(activeBookedSeatModal.booking.to)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_date")}</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatDate(activeBookedSeatModal.booking.departDate, language)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_phone")}</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {activeBookedSeatModal.booking.phone || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t("flight_admin.modal_email")}</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {activeBookedSeatModal.booking.email || "-"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onReleaseSeat(activeBookedSeatModal.seatId)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs text-center transition-colors cursor-pointer"
              >
                {t("flight_admin.modal_btn_release").replace("{seatId}", activeBookedSeatModal.seatId)}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BookedSeatModal;
