import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider, useTranslation } from './lib/LanguageContext';
import { ThemeProvider } from './lib/ThemeContext';
import { MotionConfig } from 'framer-motion';
import AppNavbar from './components/AppNavbar';
import PersistentBackground from './components/PersistentBackground';
import SpaNavListener from './components/SpaNavListener';
import GlobalPageCurtain from './components/motion-ui/GlobalPageCurtain';
import Home from './pages/Home';
import About from './pages/About';

import Contact from './pages/Contact';
import AISales from './pages/AISales';
import FlightDemo from './pages/FlightDemo';
import FlightAdmin from './pages/FlightAdmin';
import OrderDemo from './pages/OrderDemo';
import FoodOrderDemo from './pages/FoodOrderDemo';
import OrderAdmin from './pages/OrderAdmin';
import ITStoreDemo from './pages/ITStoreDemo';
import ITStoreAdmin from './pages/ITStoreAdmin';
import NiaSite2026 from './pages/NiaSite2026';
import TechsauceEvent from './pages/Event';
import { pagesConfig } from './config/pages';
import './App.css';

const pageComponents: Record<string, ReactNode> = {
  '/': <Home />,
  '/about': <About />,

  '/contact': <Contact />,
  '/ai-sales': <AISales />,
  '/flight-demo': <FlightDemo />,
  '/all-demo': <OrderDemo />,
  '/it-store-demo': <ITStoreDemo />,
  '/nia-site-2026': <NiaSite2026 />,
  '/event': <TechsauceEvent />,
  '/techsauce-2026': <TechsauceEvent />,
};

const ROUTE_TITLE_MAP: Record<string, string> = {
  '/': 'nav.home',
  '/about': 'nav.about',

  '/contact': 'nav.contact',
  '/ai-sales': 'nav.ai_sales',
  '/flight-demo': 'nav.flight',
  '/flight-demo/admin': 'flight.nav_admin',
  '/all-demo': 'nav.all_demos',
  '/food-demo': 'nav.restaurant',
  '/food-demo/admin': 'food.nav_admin',
  '/it-store-demo': 'nav.itstore',
  '/it-store-demo/admin': 'nav.itstore',
  '/nia-site-2026': 'nav.site2026',
  '/event': 'nav.event',
  '/techsauce-2026': 'nav.event',
};

function AppRoutes() {
  const location = useLocation();
  const { t } = useTranslation();

  const [displayLocation, setDisplayLocation] = useState(location);
  const [phase, setPhase] = useState<'idle' | 'covering' | 'holding' | 'revealing'>('idle');
  const [curtainTitle, setCurtainTitle] = useState('');
  const prevPathRef = useRef(location.pathname);
  const isFirstRender = useRef(true);
  const targetLocationRef = useRef(location);
  // Keep targetLocationRef in sync with latest location without mutating during render
  useEffect(() => {
    targetLocationRef.current = location;
  });

  useEffect(() => {
    // Initial mount - render immediately without curtain
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathRef.current = location.pathname;
      return;
    }

    // Path unchanged
    if (location.pathname === prevPathRef.current) {
      return;
    }

    prevPathRef.current = location.pathname;

    // Determine target title from incoming new route
    const translationKey = ROUTE_TITLE_MAP[location.pathname];
    let title = '';
    if (translationKey) {
      const translated = t(translationKey as any);
      if (translated && !translated.startsWith('nav.') && !translated.startsWith('flight.') && !translated.startsWith('food.')) {
        title = translated;
      }
    }
    if (!title) {
      const match = pagesConfig.find((p) => p.path === location.pathname);
      title = match?.name || (location.pathname === '/all-demo' ? 'All Demos' : location.pathname.replace('/', '').toUpperCase()) || 'WEBAVATAR';
    }

    setCurtainTitle(title);

    // Phase 1: Start wipe in over the OLD page
    setPhase('covering');

    // Phase 2: At 360ms, curtain is 100% closed. SWAP TO NEW PAGE under the curtain!
    const switchTimer = setTimeout(() => {
      setDisplayLocation(targetLocationRef.current);
      setPhase('holding');
      window.scrollTo(0, 0);
    }, 360);

    // Phase 3: At 820ms, reveal phase - open the curtain to show new page
    const revealTimer = setTimeout(() => {
      setPhase('revealing');
    }, 820);

    // Phase 4: At 1200ms, complete - reset curtain to idle
    const doneTimer = setTimeout(() => {
      setPhase('idle');
    }, 1200);

    return () => {
      clearTimeout(switchTimer);
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
  }, [location.pathname, t]);

  return (
    <>
      <GlobalPageCurtain phase={phase} curtainTitle={curtainTitle} />

      <main className="main-content">
        <Routes location={displayLocation}>
          {/* Static admin/support routes */}
          <Route path="/flight-demo/admin" element={<FlightAdmin />} />
          <Route path="/food-demo" element={<FoodOrderDemo />} />
          <Route path="/food-demo/admin" element={<OrderAdmin />} />
          <Route path="/it-store-demo/admin" element={<ITStoreAdmin />} />

          {/* Dynamic pages based on pagesConfig */}
          {pagesConfig.map((page) =>
            page.enabled && pageComponents[page.path] ? (
              <Route key={page.path} path={page.path} element={pageComponents[page.path]} />
            ) : null
          )}
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <div className="app-container">
              <PersistentBackground />
              <AppNavbar />

              <AppRoutes />

              <SpaNavListener />
            </div>
          </BrowserRouter>
        </MotionConfig>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
