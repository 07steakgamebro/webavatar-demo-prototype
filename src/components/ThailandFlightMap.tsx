import React, { useMemo } from "react";
import { AIRPORT_COORDINATES } from "@/lib/weather";

interface ThailandFlightMapProps {
  originCode: string;
  destCode: string;
  originCity?: string;
  destCity?: string;
  flightNo?: string;
  durationStr?: string;
  className?: string;
}

// Calculate Haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const ThailandFlightMap: React.FC<ThailandFlightMapProps> = ({
  originCode = "DMK",
  destCode = "UTH",
  originCity,
  destCity,
  flightNo,
  durationStr,
  className = "",
}) => {
  const svgW = 320;
  const svgH = 220;

  // Map lat/lon to SVG coordinate space
  const getCoords = (code: string) => {
    const cleanCode = (code || "DMK").toUpperCase();
    const loc = AIRPORT_COORDINATES[cleanCode] || AIRPORT_COORDINATES["DMK"];
    const padX = 26;
    const padY = 18;
    const usableW = svgW - padX * 2;
    const usableH = svgH - padY * 2;
    // Lat: 5.5 - 20.5 (15 deg), Lon: 97.0 - 106.0 (9 deg)
    const x = padX + ((loc.lon - 97.0) / 9.0) * usableW;
    const y = padY + ((20.5 - loc.lat) / 15.0) * usableH;
    return { x: Math.round(x), y: Math.round(y), loc };
  };

  const origin = useMemo(() => getCoords(originCode), [originCode]);
  const dest = useMemo(() => getCoords(destCode), [destCode]);

  const distanceKm = useMemo(() => {
    return calculateDistance(
      origin.loc.lat,
      origin.loc.lon,
      dest.loc.lat,
      dest.loc.lon
    );
  }, [origin, dest]);

  // Quadratic Bezier curve control point calculation
  const { pathD, midX, midY, angleDeg } = useMemo(() => {
    const x1 = origin.x;
    const y1 = origin.y;
    const x2 = dest.x;
    const y2 = dest.y;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);

    const mX = (x1 + x2) / 2;
    const mY = (y1 + y2) / 2;

    // Normal vector perpendicular to trajectory
    const nx = -dy / (dist || 1);
    const ny = dx / (dist || 1);

    // Arc curvature: curve outward nicely
    const curveAmount = Math.min(32, Math.max(16, dist * 0.22));
    const cX = mX + nx * curveAmount;
    const cY = mY + ny * curveAmount;

    // Calculate flight angle for airplane icon
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      pathD: `M ${x1} ${y1} Q ${cX} ${cY} ${x2} ${y2}`,
      midX: mX + nx * (curveAmount * 0.5),
      midY: mY + ny * (curveAmount * 0.5),
      angleDeg: angle,
    };
  }, [origin, dest]);

  return (
    <div
      title={`${flightNo ? flightNo + ": " : ""}${originCity || originCode} ➔ ${destCity || destCode} (${distanceKm} km${durationStr ? " • " + durationStr : ""})`}
      className={`relative w-full h-[220px] bg-gradient-to-b from-slate-100 via-sky-50/50 to-slate-100 dark:from-[#090d16] dark:via-[#0c1220] dark:to-[#080b12] rounded-2xl border border-slate-200/80 dark:border-slate-800/90 overflow-hidden shadow-inner flex items-center justify-center select-none ${className}`}
    >
      {/* Background Radar Grid & Coordinates Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${svgW} ${svgH}`}
        fill="none"
      >
        <defs>
          {/* Dot matrix pattern */}
          <pattern id="mapGridDots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" className="fill-slate-300 dark:fill-slate-700/60" />
          </pattern>

          {/* Linear Gradients */}
          <linearGradient id="routeArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Glow filter for flight path */}
          <filter id="glowPath" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Matrix background grid */}
        <rect width={svgW} height={svgH} fill="url(#mapGridDots)" />

        {/* Subtle Lat/Lon Reference Lines */}
        <line x1="0" y1="75" x2={svgW} y2="75" stroke="currentColor" className="text-slate-200/80 dark:text-slate-800/60" strokeDasharray="3 3" strokeWidth="0.8" />
        <line x1="0" y1="145" x2={svgW} y2="145" stroke="currentColor" className="text-slate-200/80 dark:text-slate-800/60" strokeDasharray="3 3" strokeWidth="0.8" />
        <line x1="115" y1="0" x2="115" y2={svgH} stroke="currentColor" className="text-slate-200/80 dark:text-slate-800/60" strokeDasharray="3 3" strokeWidth="0.8" />
        <line x1="215" y1="0" x2="215" y2={svgH} stroke="currentColor" className="text-slate-200/80 dark:text-slate-800/60" strokeDasharray="3 3" strokeWidth="0.8" />

        {/* ============================================================ */}
        {/* ACCURATE THAILAND SILHOUETTE LANDMASS & COASTLINES           */}
        {/* ============================================================ */}
        <g className="opacity-85 dark:opacity-75 transition-opacity">
          {/* Main Thailand Landmass Path */}
          <path
            d="
              M 95 20
              C 112 18, 128 28, 142 34
              C 160 42, 185 45, 206 48
              C 235 52, 265 58, 276 74
              C 285 88, 278 102, 260 106
              C 232 108, 198 108, 178 114
              C 176 122, 185 134, 182 142
              C 170 140, 160 128, 148 116
              C 134 108, 122 104, 115 106
              C 108 112, 102 124, 96 136
              C 90 148, 86 160, 96 172
              C 106 182, 122 186, 125 194
              C 120 198, 106 198, 92 190
              C 78 182, 68 172, 58 158
              C 52 148, 56 138, 70 130
              C 82 120, 88 108, 90 96
              C 75 88, 62 72, 58 54
              C 56 36, 75 22, 95 20
              Z
            "
            className="fill-slate-200/90 dark:fill-slate-800/70 stroke-slate-300 dark:stroke-slate-700/80"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Gulf of Thailand Water Inset Glow */}
          <path
            d="M 115 108 C 122 106, 134 110, 148 118 C 160 128, 168 138, 175 142 C 158 160, 130 170, 100 170 C 95 158, 98 142, 104 128 C 108 118, 110 110, 115 108 Z"
            className="fill-sky-500/10 dark:fill-sky-500/5 stroke-sky-400/20"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* Regional Labels */}
          <text x="80" y="32" className="fill-slate-400 dark:fill-slate-500 text-[8px] font-bold tracking-widest uppercase select-none opacity-60">NORTH</text>
          <text x="215" y="72" className="fill-slate-400 dark:fill-slate-500 text-[8px] font-bold tracking-widest uppercase select-none opacity-60">ISAN</text>
          <text x="122" y="92" className="fill-slate-400 dark:fill-slate-500 text-[8px] font-bold tracking-widest uppercase select-none opacity-60">CENTRAL</text>
          <text x="72" y="182" className="fill-slate-400 dark:fill-slate-500 text-[8px] font-bold tracking-widest uppercase select-none opacity-60">SOUTH</text>
        </g>

        {/* ============================================================ */}
        {/* FLIGHT TRAJECTORY ARC & ANIMATED DASHED PATH                */}
        {/* ============================================================ */}
        {/* Glow halo under arc */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#routeArcGrad)"
          strokeWidth="5"
          strokeOpacity="0.3"
          filter="url(#glowPath)"
        />

        {/* Solid Route Line Base */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#routeArcGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Animated Dashed Overlay */}
        <path
          d={pathD}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeDasharray="4 6"
          strokeLinecap="round"
          className="opacity-90"
        />

        {/* ============================================================ */}
        {/* ORIGIN AIRPORT RADAR BEACON                                  */}
        {/* ============================================================ */}
        <g transform={`translate(${origin.x}, ${origin.y})`}>
          {/* Pulsing Radar Ring */}
          <circle cx="0" cy="0" r="10" className="fill-sky-500/20 stroke-sky-400 animate-ping" strokeWidth="1" />
          <circle cx="0" cy="0" r="6" className="fill-sky-500/40 stroke-sky-400" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="3.5" className="fill-sky-500 dark:fill-sky-400" />
          {/* Airport Label Tag */}
          <rect
            x="-18"
            y="-18"
            width="36"
            height="14"
            rx="7"
            className="fill-slate-900/90 dark:fill-slate-800/95 stroke-sky-400/80 shadow-md"
            strokeWidth="1"
          />
          <text
            x="0"
            y="-8"
            textAnchor="middle"
            className="fill-sky-300 font-mono font-black text-[9px] tracking-wider"
          >
            {originCode}
          </text>
        </g>

        {/* ============================================================ */}
        {/* DESTINATION AIRPORT RADAR BEACON                             */}
        {/* ============================================================ */}
        <g transform={`translate(${dest.x}, ${dest.y})`}>
          {/* Pulsing Radar Ring */}
          <circle cx="0" cy="0" r="10" className="fill-rose-500/20 stroke-rose-400 animate-ping" strokeWidth="1" />
          <circle cx="0" cy="0" r="6" className="fill-rose-500/40 stroke-rose-400" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="3.5" className="fill-rose-500 dark:fill-rose-400" />
          {/* Airport Label Tag */}
          <rect
            x="-18"
            y="-18"
            width="36"
            height="14"
            rx="7"
            className="fill-slate-900/90 dark:fill-slate-800/95 stroke-rose-400/80 shadow-md"
            strokeWidth="1"
          />
          <text
            x="0"
            y="-8"
            textAnchor="middle"
            className="fill-rose-300 font-mono font-black text-[9px] tracking-wider"
          >
            {destCode}
          </text>
        </g>

        {/* ============================================================ */}
        {/* AIRPLANE ICON AT MID-FLIGHT                                  */}
        {/* ============================================================ */}
        <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg + 90})`}>
          <circle cx="0" cy="0" r="11" className="fill-amber-500/20 stroke-amber-400/70" strokeWidth="1" />
          <path
            d="M 0 -8 L 6 6 L 0 3 L -6 6 Z"
            className="fill-amber-400 stroke-amber-600 dark:stroke-amber-300 drop-shadow-sm"
            strokeWidth="0.8"
          />
        </g>
      </svg>

      {/* Bottom Right: Route Summary Badge */}
      <div className="absolute bottom-2.5 right-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs text-[10px] flex items-center gap-1.5 z-10 select-none max-w-[calc(100%-1.25rem)] overflow-hidden">
        <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">{originCode}</span>
        <span className="text-slate-400 shrink-0">➔</span>
        <span className="font-mono font-bold text-amber-500 dark:text-amber-400 shrink-0">{destCode}</span>
        {distanceKm > 0 && (
          <>
            <span className="text-slate-300 dark:text-slate-700 shrink-0">|</span>
            <span className="font-medium text-slate-500 dark:text-slate-400 font-mono truncate">{distanceKm} km</span>
          </>
        )}
      </div>
    </div>
  );
};