import type React from 'react';

export interface TypewriterHeadingProps {
  text: string;
  className?: string;
}

export interface BookingForm {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  adults?: number;
  children?: number;
  infants?: number;
  class?: 'economy' | 'business';
  promoCode: string;
  passengerName: string;
  email: string;
  phone: string;
  seat: string;
  returnSeat?: string;
  // Dynamic add-ons
  baggageWeight?: number; // in KG (0, 15, 20, 25, 30, 40)
  baggagePrice?: number;
  travelInsurance?: boolean;
  insurancePrice?: number;
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

export interface SeatMapModalProps {
  open: boolean;
  onClose: () => void;
  legs: SeatMapLegInfo[];
  initialLegIndex?: number;
  selectedLegSeats: Record<number, string>;
  onSaveLegSeats: (legSeats: Record<number, string>) => void;
  maxSeats?: number;
}

export interface FieldProps {
  id?: string;
  dataTestId?: string;
  label: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  onClick?: () => void;
  required?: boolean;
  isError?: boolean;
  errorText?: string;
  className?: string;
  containerRef?: React.Ref<HTMLDivElement>;
}
