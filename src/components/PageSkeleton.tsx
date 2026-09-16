import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

interface PageSkeletonProps {
  variant?: 'flight' | 'order';
}

const shimmer = {
  initial: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const;

interface SkeletonBlockProps {
  className?: string;
  style?: CSSProperties;
}

function SkeletonBlock({ className, style }: SkeletonBlockProps) {
  return <div className={`skeleton-shimmer ${className ?? ''}`} style={style} aria-hidden="true" />;
}

/** Full-page wireframe skeleton shown while demo page content loads */
export default function PageSkeleton({ variant = 'flight' }: PageSkeletonProps) {
  return (
    <motion.div
      className="skeleton-page"
      variants={shimmer}
      initial="initial"
      exit="exit"
      aria-label="Loading…"
      aria-busy="true"
    >
      {/* Navbar bar */}
      <div className="skeleton-navbar">
        <SkeletonBlock className="skeleton-logo" />
        <div className="skeleton-nav-links">
          {[90, 80, 110, 85, 80].map((w, i) => (
            <SkeletonBlock key={i} className="skeleton-nav-item" style={{ width: w }} />
          ))}
        </div>
        <SkeletonBlock className="skeleton-cta-btn" />
      </div>

      {variant === 'flight' ? <FlightSkeleton /> : <OrderSkeleton />}
    </motion.div>
  );
}

function FlightSkeleton() {
  return (
    <>
      {/* Hero image */}
      <SkeletonBlock className="skeleton-hero" />

      {/* Booking form card */}
      <div className="skeleton-section skeleton-form-card">
        <SkeletonBlock className="skeleton-form-title" />
        <div className="skeleton-form-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="skeleton-field" />
          ))}
        </div>
        <SkeletonBlock className="skeleton-submit-btn" />
      </div>

      {/* Promo cards */}
      <div className="skeleton-section">
        <SkeletonBlock className="skeleton-section-title" />
        <div className="skeleton-cards-grid skeleton-cards-3col">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-card skeleton-card-tall">
              <SkeletonBlock className="skeleton-card-img-full" />
              <div className="skeleton-card-footer">
                <SkeletonBlock className="skeleton-text-sm" />
                <SkeletonBlock className="skeleton-text-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function OrderSkeleton() {
  return (
    <>
      {/* Header */}
      <div className="skeleton-order-header">
        <SkeletonBlock className="skeleton-logo" />
        <SkeletonBlock className="skeleton-cta-btn" />
      </div>

      <div className="skeleton-order-layout">
        {/* Menu grid */}
        <div className="skeleton-menu-col">
          <SkeletonBlock className="skeleton-section-title" />
          {/* Category pills */}
          <div className="skeleton-pills-row">
            {[70, 90, 80, 100, 75].map((w, i) => (
              <SkeletonBlock key={i} className="skeleton-pill" style={{ width: w }} />
            ))}
          </div>
          {/* Food cards 2-col */}
          <div className="skeleton-cards-grid skeleton-cards-2col">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card skeleton-card-food">
                <SkeletonBlock className="skeleton-card-img-square" />
                <div className="skeleton-card-body">
                  <SkeletonBlock className="skeleton-text-md" />
                  <SkeletonBlock className="skeleton-text-sm" />
                  <SkeletonBlock className="skeleton-text-sm" style={{ width: '60%' }} />
                  <SkeletonBlock className="skeleton-add-btn" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart sidebar */}
        <div className="skeleton-cart-col">
          <SkeletonBlock className="skeleton-text-md" />
          <SkeletonBlock className="skeleton-cart-empty" />
          <SkeletonBlock className="skeleton-submit-btn" />
        </div>
      </div>
    </>
  );
}
