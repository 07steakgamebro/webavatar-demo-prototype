import { getAirportCode } from "./cities";

export type FlightLeg = {
  from: string;
  to: string;
  departDate: string;
  flightNo?: string;
  departTime?: string;
  arrivalTime?: string;
  airlineName?: string;
  airlineCode?: string;
  price?: number;
  seat?: string;
  releasedSeat?: string;
  aircraftModel?: string;
  aircraftTail?: string;
  class?: string;
};

export type Aircraft = {
  id: string;
  flightNo: string;
  airlineCode: string;
  airlineName: string;
  model: string;
  tailNumber: string;
  type: string;
  route: string;
  depTime: string;
  arrTime: string;
  capacity: number;
  businessSeats: number;
  economySeats: number;
  price?: number;
  priceStr?: string;
  originCity?: string;
  originCode?: string;
  destCity?: string;
  destCode?: string;
  terminalInfo?: string;
  durationStr?: string;
};

/**
 * Complete fleet of 117 aircraft corresponding to the active routes (green cells)
 * from "รายชื่อสนามบิน - ชีต1.pdf"
 */
import { MOCK_FLEET } from '../data/mockFleet';
import { DEFAULT_FLIGHT_LOCKED_SEATS } from '../data/mockLockedSeats';

export { MOCK_FLEET, DEFAULT_FLIGHT_LOCKED_SEATS };


import { safeGetJSON, safeSetJSON, safeRemove } from "./storage";

export type Booking = {
  id: string;
  createdAt: string;
  tripType: "round" | "oneway" | "multicity";
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  legs?: FlightLeg[];
  passengers: number;
  promoCode?: string;
  passengerName: string;
  email: string;
  phone: string;
  seat?: string;
  returnSeat?: string;
  releasedSeat?: string;
  releasedReturnSeat?: string;
  pricePerPax?: number;
  class?: string;
  aircraftModel?: string;
  aircraftTail?: string;
  outboundFlightNo?: string;
  outboundTime?: string;
  inboundFlightNo?: string;
  inboundTime?: string;
  inboundAircraftModel?: string;
  inboundAircraftTail?: string;
};

const KEY = "nok_bookings";

export function getBookings(): Booking[] {
  return safeGetJSON<Booking[]>(KEY, [], (data) => Array.isArray(data));
}

export function saveBooking(b: Omit<Booking, "id" | "createdAt">): Booking {
  const booking: Booking = {
    ...b,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const all = getBookings();
  all.unshift(booking);
  safeSetJSON(KEY, all);
  return booking;
}

export function deleteBooking(id: string) {
  const all = getBookings().filter((b) => b.id !== id);
  safeSetJSON(KEY, all);
}

export function clearBookings() {
  safeRemove(KEY);
}


export const DEFAULT_LOCKED_SEATS = ["1B", "2E", "3A", "3F", "5D", "6B", "6C", "7A", "8F", "9C", "9D"];
export const LOCKED_SEATS_KEY = "botnoi_flight_locked_seats";

export function getLockedSeats(flightNo?: string): string[] {
  const fallback = flightNo && DEFAULT_FLIGHT_LOCKED_SEATS[flightNo]
    ? DEFAULT_FLIGHT_LOCKED_SEATS[flightNo]
    : DEFAULT_LOCKED_SEATS;

  const key = flightNo ? `${LOCKED_SEATS_KEY}_${flightNo}` : LOCKED_SEATS_KEY;
  return safeGetJSON<string[]>(key, fallback, (data) => Array.isArray(data));
}

export function saveLockedSeats(seats: string[], flightNo?: string): void {
  const key = flightNo ? `${LOCKED_SEATS_KEY}_${flightNo}` : LOCKED_SEATS_KEY;
  safeSetJSON(key, seats);
}

export function toggleSeatLock(seatId: string, flightNo?: string): string[] {
  const current = getLockedSeats(flightNo);
  let updated: string[];
  if (current.includes(seatId)) {
    updated = current.filter((s) => s !== seatId);
  } else {
    updated = [...current, seatId];
  }
  saveLockedSeats(updated, flightNo);
  return updated;
}

export function lockSeats(seatIds: string[], flightNo?: string): string[] {
  const current = getLockedSeats(flightNo);
  const updated = Array.from(new Set([...current, ...seatIds]));
  saveLockedSeats(updated, flightNo);
  return updated;
}

export function unlockSeats(seatIds: string[], flightNo?: string): string[] {
  const current = getLockedSeats(flightNo);
  const updated = current.filter((s) => !seatIds.includes(s));
  saveLockedSeats(updated, flightNo);
  return updated;
}

export function unlockAllSeats(flightNo?: string): string[] {
  saveLockedSeats([], flightNo);
  return [];
}

export function releaseAllSeatsForFlight(
  flightNo?: string,
  originCode?: string,
  destCode?: string
): { updatedBookings: Booking[]; updatedLockedSeats: string[] } {
  saveLockedSeats([], flightNo);
  const allBookings = getBookings();
  const updatedBookings: Booking[] = [];

  for (const b of allBookings) {
    let bookingModified = false;
    const bOrig = getAirportCode(b.from);
    const bDest = getAirportCode(b.to);

    let newSeat = b.seat;
    let newReturnSeat = b.returnSeat;
    let newReleasedSeat = b.releasedSeat;
    let newReleasedReturnSeat = b.releasedReturnSeat;
    let newLegs = b.legs;

    // Check outbound
    const matchesOutbound =
      (flightNo && b.outboundFlightNo === flightNo) ||
      (originCode && destCode && bOrig === originCode && bDest === destCode && (!b.outboundFlightNo || b.outboundFlightNo === flightNo));

    if (matchesOutbound && b.seat) {
      bookingModified = true;
      const currentReleased = newReleasedSeat ? newReleasedSeat.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const seatsToRelease = b.seat.split(",").map((s) => s.trim()).filter(Boolean);
      seatsToRelease.forEach((s) => {
        if (!currentReleased.includes(s)) currentReleased.push(s);
      });
      newSeat = "";
      newReleasedSeat = currentReleased.join(", ");
    }

    // Check inbound (round-trip)
    const matchesInbound =
      (flightNo && b.inboundFlightNo === flightNo) ||
      (b.tripType === "round" && originCode && destCode && bOrig === destCode && bDest === originCode && (!b.inboundFlightNo || b.inboundFlightNo === flightNo));

    if (matchesInbound && b.returnSeat) {
      bookingModified = true;
      const currentReleased = newReleasedReturnSeat ? newReleasedReturnSeat.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const seatsToRelease = b.returnSeat.split(",").map((s) => s.trim()).filter(Boolean);
      seatsToRelease.forEach((s) => {
        if (!currentReleased.includes(s)) currentReleased.push(s);
      });
      newReturnSeat = "";
      newReleasedReturnSeat = currentReleased.join(", ");
    }

    // Check legs
    if (b.legs && b.legs.length > 0) {
      newLegs = b.legs.map((l) => {
        if (!l.seat) return l;
        const legOrig = getAirportCode(l.from);
        const legDest = getAirportCode(l.to);
        const matchesLeg =
          (flightNo && l.flightNo === flightNo) ||
          (originCode && destCode && legOrig === originCode && legDest === destCode && (!l.flightNo || l.flightNo === flightNo));
        if (matchesLeg) {
          bookingModified = true;
          const currentLegReleased = l.releasedSeat ? l.releasedSeat.split(",").map((s) => s.trim()).filter(Boolean) : [];
          const seatsToRelease = l.seat.split(",").map((s) => s.trim()).filter(Boolean);
          seatsToRelease.forEach((s) => {
            if (!currentLegReleased.includes(s)) currentLegReleased.push(s);
          });
          return { ...l, seat: "", releasedSeat: currentLegReleased.join(", ") };
        }
        return l;
      });
    }

    if (bookingModified) {
      updatedBookings.push({
        ...b,
        seat: newSeat,
        returnSeat: newReturnSeat,
        releasedSeat: newReleasedSeat,
        releasedReturnSeat: newReleasedReturnSeat,
        legs: newLegs,
      });
    } else {
      updatedBookings.push(b);
    }
  }

  safeSetJSON(KEY, updatedBookings);

  return {
    updatedBookings,
    updatedLockedSeats: [],
  };
}

export function resetLockedSeatsToDefault(flightNo?: string): string[] {
  const defaultList = flightNo && DEFAULT_FLIGHT_LOCKED_SEATS[flightNo]
    ? DEFAULT_FLIGHT_LOCKED_SEATS[flightNo]
    : DEFAULT_LOCKED_SEATS;
  saveLockedSeats(defaultList, flightNo);
  return defaultList;
}

export function releaseSeatBooking(
  seatId: string,
  flightNo?: string,
  originCode?: string,
  destCode?: string,
  bookingId?: string
): { updatedBookings: Booking[]; updatedLockedSeats: string[]; releasedBooking?: Booking } {
  const allBookings = getBookings();
  let releasedBooking: Booking | undefined;
  const updatedBookings: Booking[] = [];

  for (const b of allBookings) {
    let bookingModified = false;
    const isTargetBooking = Boolean(bookingId && b.id === bookingId);
    const bOrig = getAirportCode(b.from);
    const bDest = getAirportCode(b.to);
    const matchesRoute = (!originCode || bOrig === originCode) && (!destCode || bDest === destCode);
    const matchesFlight =
      !flightNo ||
      b.outboundFlightNo === flightNo ||
      b.inboundFlightNo === flightNo ||
      b.legs?.some((l) => l.flightNo === flightNo) ||
      !b.outboundFlightNo;

    let newSeat = b.seat;
    let newReturnSeat = b.returnSeat;
    let newReleasedSeat = b.releasedSeat;
    let newReleasedReturnSeat = b.releasedReturnSeat;
    let newLegs = b.legs;

    // 1. Check main seat
    if (b.seat) {
      const seats = b.seat.split(",").map((s) => s.trim());
      if (seats.includes(seatId) && (isTargetBooking || matchesFlight || matchesRoute || bOrig === originCode)) {
        bookingModified = true;
        releasedBooking = b;
        const remaining = seats.filter((s) => s !== seatId);
        newSeat = remaining.join(", ");
        const currentReleased = newReleasedSeat ? newReleasedSeat.split(",").map((s) => s.trim()) : [];
        if (!currentReleased.includes(seatId)) {
          currentReleased.push(seatId);
        }
        newReleasedSeat = currentReleased.join(", ");
      }
    }

    // 2. Check returnSeat
    if (b.returnSeat) {
      const retSeats = b.returnSeat.split(",").map((s) => s.trim());
      if (retSeats.includes(seatId) && (isTargetBooking || matchesFlight || matchesRoute)) {
        bookingModified = true;
        releasedBooking = b;
        const remaining = retSeats.filter((s) => s !== seatId);
        newReturnSeat = remaining.join(", ");
        const currentReleased = newReleasedReturnSeat ? newReleasedReturnSeat.split(",").map((s) => s.trim()) : [];
        if (!currentReleased.includes(seatId)) {
          currentReleased.push(seatId);
        }
        newReleasedReturnSeat = currentReleased.join(", ");
      }
    }

    // 3. Check legs
    if (b.legs && b.legs.length > 0) {
      newLegs = b.legs.map((l) => {
        if (!l.seat) return l;
        const legSeats = l.seat.split(",").map((s) => s.trim());
        const legOrig = getAirportCode(l.from);
        const legDest = getAirportCode(l.to);
        const legRouteMatch = (!originCode || legOrig === originCode) && (!destCode || legDest === destCode);
        const legFlightMatch = !flightNo || l.flightNo === flightNo;
        if (legSeats.includes(seatId) && (isTargetBooking || legFlightMatch || legRouteMatch || legOrig === originCode)) {
          bookingModified = true;
          releasedBooking = b;
          const remaining = legSeats.filter((s) => s !== seatId);
          const currentLegReleased = l.releasedSeat ? l.releasedSeat.split(",").map((s) => s.trim()) : [];
          if (!currentLegReleased.includes(seatId)) {
            currentLegReleased.push(seatId);
          }
          return { ...l, seat: remaining.join(", "), releasedSeat: currentLegReleased.join(", ") };
        }
        return l;
      });
    }

    if (bookingModified) {
      updatedBookings.push({
        ...b,
        seat: newSeat,
        returnSeat: newReturnSeat,
        releasedSeat: newReleasedSeat,
        releasedReturnSeat: newReleasedReturnSeat,
        legs: newLegs,
      });
    } else {
      updatedBookings.push(b);
    }
  }

  safeSetJSON(KEY, updatedBookings);

  // Also remove from lockedSeats if present
  const currentLocked = getLockedSeats(flightNo);
  const updatedLocked = currentLocked.filter((s) => s !== seatId);
  saveLockedSeats(updatedLocked, flightNo);

  const globalLocked = getLockedSeats();
  if (globalLocked.includes(seatId)) {
    saveLockedSeats(globalLocked.filter((s) => s !== seatId));
  }

  return {
    updatedBookings,
    updatedLockedSeats: updatedLocked,
    releasedBooking,
  };
}

export function forceLockBookedSeat(seatId: string, flightNo?: string, originCode?: string, destCode?: string): string[] {
  releaseSeatBooking(seatId, flightNo, originCode, destCode);
  const currentLocked = getLockedSeats(flightNo);
  const updatedLocked = Array.from(new Set([...currentLocked, seatId]));
  saveLockedSeats(updatedLocked, flightNo);
  return updatedLocked;
}

export type CabinType = "turboprop" | "narrowbody" | "widebody";

export function getAircraftCabinType(model?: string, type?: string): CabinType {
  const m = (model || "").toLowerCase();
  const t = (type || "").toLowerCase();
  if (m.includes("atr") || t.includes("turboprop") || t.includes("regional")) {
    return "turboprop";
  }
  if (m.includes("777") || m.includes("787") || m.includes("350") || m.includes("wide") || t.includes("wide")) {
    return "widebody";
  }
  return "narrowbody";
}

