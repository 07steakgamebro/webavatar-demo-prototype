import { useTranslation } from "@/lib/LanguageContext";
import type { FieldProps } from "../types";

export function Field({
  id,
  dataTestId,
  label,
  htmlFor,
  children,
  onClick,
  required,
  isError,
  errorText,
  className = "",
  containerRef,
}: FieldProps) {
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
          : "bg-[var(--input)] border-[var(--border)] " +
            (onClick
              ? "cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/80 hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-md"
              : "focus-within:border-[var(--primary)] focus-within:shadow-md focus-within:ring-1 focus-within:ring-[var(--primary)]/20")
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <label
          htmlFor={htmlFor}
          className={`text-[10px] font-bold uppercase tracking-wider block cursor-pointer select-none ${
            isError
              ? "text-rose-600 dark:text-rose-400 font-black"
              : "text-[var(--muted-foreground)]"
          }`}
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
        {isError && (
          <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-200/80 dark:bg-rose-900/80 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            {errorText
              ? language === "th"
                ? "ไม่ถูกต้อง"
                : "Invalid"
              : language === "th"
              ? "เลือกเมืองซ้ำกันไม่ได้"
              : "Cannot select same city"}
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

export default Field;
