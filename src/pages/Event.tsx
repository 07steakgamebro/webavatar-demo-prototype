import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Copy, Check,
  Award, Building2, Presentation,
  Calendar, MapPin, X,
  RotateCcw, ChevronDown
} from 'lucide-react';
import {
  techsauceData,
  ZONE_LABELS,
  getBoothZone,
  getBoothZoneLabel,
} from '../lib/techsauceData';
import { useTranslation } from '../lib/LanguageContext';
import AppFooter from '../components/AppFooter';
import './Pages.css';

type TabType = 'workshops' | 'exhibitors' | 'awards';

function getAccessBadgeClass(access: string) {
  const acc = (access || '').toLowerCase();
  if (acc.includes('reserve')) return 'techsauce-access-reserve';
  if (acc.includes('invitation')) return 'techsauce-access-invitation';
  if (acc.includes('walk-in') || acc.includes('walkin')) return 'techsauce-access-walkin';
  return 'techsauce-access-default';
}

function getRoomBadgeClass(room: string) {
  const r = (room || '').toLowerCase();
  if (r.includes('room a')) return 'techsauce-room-a';
  if (r.includes('room b')) return 'techsauce-room-b';
  return 'techsauce-room-default';
}

function getDayHeaderTitle(dateStr: string, lang: string): string {
  if (dateStr === '2026-08-26') return lang === 'th' ? 'วันที่ 1 — 26 สิงหาคม 2026' : 'Day 1 — August 26, 2026';
  if (dateStr === '2026-08-27') return lang === 'th' ? 'วันที่ 2 — 27 สิงหาคม 2026' : 'Day 2 — August 27, 2026';
  if (dateStr === '2026-08-28') return lang === 'th' ? 'วันที่ 3 — 28 สิงหาคม 2026' : 'Day 3 — August 28, 2026';
  return dateStr;
}

export default function TechsauceEvent() {
  const { t, language } = useTranslation();

  // Active Tab: 'workshops' | 'exhibitors' | 'awards'
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase().replace('#', '') : '';
    if (hash === 'exhibitors' || hash === 'awards' || hash === 'workshops') {
      return hash as TabType;
    }
    return 'workshops';
  });


  // Workshop Filters (Default to today's date "2026-08-27")
  const [workshopSearch, setWorkshopSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const matchToday = techsauceData.workshops.some((w) => w.date === todayStr);
    return matchToday ? todayStr : 'all';
  });
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedAccess, setSelectedAccess] = useState<string>('all');

  // Exhibitor Filter
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [exhibitorSearch, setExhibitorSearch] = useState('');

  // Awards Active Category
  const [activeAwardCategory, setActiveAwardCategory] = useState<string>('all');

  // Expanded state for Award details toggles (individual card only)
  const [expandedAwards, setExpandedAwards] = useState<Record<string, boolean>>({});

  const toggleAwardExpand = (key: string) => {
    setExpandedAwards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Copied state for feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Synchronize hash with active tab for direct URL navigation & Avatar tool calls
  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (hash === 'workshops' || hash === 'exhibitors' || hash === 'awards') {
      setActiveTab(hash as TabType);
    }
  }, []);

  useEffect(() => {
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  const switchTab = (tab: TabType, scrollIntoView = false) => {
    setActiveTab(tab);
    if (window.history.pushState) {
      window.history.pushState(null, '', `#${tab}`);
    } else {
      window.location.hash = tab;
    }
    if (scrollIntoView) {
      const navEl = document.getElementById('event-tab-navigation');
      if (navEl) {
        navEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filtered Workshops
  const filteredWorkshops = useMemo(() => {
    return techsauceData.workshops.filter((w) => {
      const matchDay = selectedDay === 'all' || w.date === selectedDay;
      const matchRoom = selectedRoom === 'all' || w.room === selectedRoom;
      const matchAccess = selectedAccess === 'all' || w.access.toLowerCase().includes(selectedAccess.toLowerCase());

      const query = workshopSearch.trim().toLowerCase();
      const matchSearch =
        !query ||
        w.title.toLowerCase().includes(query) ||
        w.room.toLowerCase().includes(query) ||
        w.access.toLowerCase().includes(query) ||
        w.speakers.some(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.company.toLowerCase().includes(query) ||
            s.role.toLowerCase().includes(query)
        );

      return matchDay && matchRoom && matchAccess && matchSearch;
    });
  }, [selectedDay, selectedRoom, selectedAccess, workshopSearch]);

  // Group filtered workshops by date for day-separated timeline view
  const workshopsByDate = useMemo(() => {
    const groups: { date: string; workshops: typeof filteredWorkshops }[] = [];
    const dateMap = new Map<string, typeof filteredWorkshops>();

    filteredWorkshops.forEach((w) => {
      if (!dateMap.has(w.date)) {
        dateMap.set(w.date, []);
      }
      dateMap.get(w.date)!.push(w);
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    sortedDates.forEach((date) => {
      groups.push({
        date,
        workshops: dateMap.get(date)!,
      });
    });

    return groups;
  }, [filteredWorkshops]);

  // Filtered Exhibitors
  const filteredExhibitors = useMemo(() => {
    return techsauceData.exhibitors.filter((e) => {
      const q = exhibitorSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        e.company.toLowerCase().includes(q) ||
        (e.booth && e.booth.toLowerCase().includes(q)) ||
        getBoothZoneLabel(e.booth, 'th').toLowerCase().includes(q) ||
        getBoothZoneLabel(e.booth, 'en').toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (selectedZone === 'all') return true;
      if (selectedZone === 'A') return getBoothZone(e.booth) === 'A';
      if (selectedZone === 'B') return getBoothZone(e.booth) === 'B';
      if (selectedZone === 'C') return getBoothZone(e.booth) === 'C';
      if (selectedZone === 'D') return getBoothZone(e.booth) === 'D';
      if (selectedZone === 'numbered' || selectedZone === 'NUM') return getBoothZone(e.booth) === 'NUM';
      if (selectedZone === 'other') return !getBoothZone(e.booth);

      return true;
    });
  }, [exhibitorSearch, selectedZone]);

  const awardCategories = useMemo(() => {
    return Object.keys(techsauceData.techsauce_awards.categories);
  }, []);

  const totalHonorsCount = useMemo(() => {
    return Object.values(techsauceData.techsauce_awards.categories).reduce((acc, cat) => acc + cat.length, 0);
  }, []);

  return (
    <main id="techsauce-event-main" className="techsauce-page-root w-full relative overflow-hidden bg-transparent text-foreground">
      {/* Anchor targets for direct scanner & route jumping */}
      <div id="workshops" className="sr-only" aria-hidden="true" />
      <div id="exhibitors" className="sr-only" aria-hidden="true" />
      <div id="awards" className="sr-only" aria-hidden="true" />

      {/* ═══════════════════════════════════════
          HERO SECTION — SUMMIT OVERVIEW & QUICK ACTIONS
          ═══════════════════════════════════════ */}
      <section id="event-hero" aria-label="Techsauce Global Summit 2026 Overview" className="techsauce-hero bg-transparent">
        <div className="techsauce-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="techsauce-hero-content"
          >
            {/* Summit Badge */}
            <div className="techsauce-badge">
              <span>Techsauce Global Summit 2026</span>
            </div>

            {/* Main Title */}
            <h1 className="techsauce-hero-title">
              {t('event.title')}
              <span className="techsauce-title-sub">{t('event.subtitle')}</span>
            </h1>

            {/* Event Theme Subtitle */}
            <p className="techsauce-hero-theme">
              {t('event.theme_desc')}
            </p>

            {/* Event Metadata Cards */}
            <div className="techsauce-meta-grid" role="region" aria-label="Summit Schedule and Location Details">
              <div className="techsauce-meta-item">
                <div className="techsauce-meta-icon-wrap">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="techsauce-meta-label">{t('event.meta_dates_label')}</div>
                  <div className="techsauce-meta-value">{t('event.meta_dates_val')}</div>
                </div>
              </div>

              <div className="techsauce-meta-item">
                <div className="techsauce-meta-icon-wrap">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <div className="techsauce-meta-label">{t('event.meta_venue_label')}</div>
                  <div className="techsauce-meta-value">{t('event.meta_venue_val')}</div>
                </div>
              </div>

              <div className="techsauce-meta-item">
                <div className="techsauce-meta-icon-wrap">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="techsauce-meta-label">{t('event.meta_awards_label')}</div>
                  <div className="techsauce-meta-value">{t('event.meta_awards_val')}</div>
                </div>
              </div>
            </div>

            {/* Key Stats Strip */}
            <div className="techsauce-stats-strip" role="region" aria-label="Summit Key Figures">
              <div className="techsauce-stat-card">
                <div className="techsauce-stat-num">{techsauceData.workshops.length}</div>
                <div className="techsauce-stat-lbl">{t('event.stat_workshops')}</div>
              </div>
              <div className="techsauce-stat-card">
                <div className="techsauce-stat-num">{techsauceData.exhibitors.length}</div>
                <div className="techsauce-stat-lbl">{t('event.stat_exhibitors')}</div>
              </div>
              <div className="techsauce-stat-card">
                <div className="techsauce-stat-num">{awardCategories.length}</div>
                <div className="techsauce-stat-lbl">{t('event.stat_categories')}</div>
              </div>
              <div className="techsauce-stat-card">
                <div className="techsauce-stat-num">{totalHonorsCount}</div>
                <div className="techsauce-stat-lbl">{t('event.stat_honors')}</div>
              </div>
            </div>

            {/* Single Primary Tab Navigation */}
            <nav id="event-tab-navigation" role="tablist" aria-label="Event Directory Sections" className="techsauce-hero-quicknav">
              <button
                id="tab-workshops"
                type="button"
                role="tab"
                aria-controls="section-workshops"
                aria-selected={activeTab === 'workshops'}
                onClick={() => switchTab('workshops', true)}
                className={`techsauce-hero-quick-btn ${activeTab === 'workshops' ? 'active' : ''}`}
                aria-label="Curated Workshops"
              >
                <Presentation className="w-4 h-4 text-primary" />
                <span className="font-bold">{t('event.tab_workshops')}</span>
                <span className="techsauce-quick-badge">{techsauceData.workshops.length}</span>
              </button>

              <button
                id="tab-exhibitors"
                type="button"
                role="tab"
                aria-controls="section-exhibitors"
                aria-selected={activeTab === 'exhibitors'}
                onClick={() => switchTab('exhibitors', true)}
                className={`techsauce-hero-quick-btn ${activeTab === 'exhibitors' ? 'active' : ''}`}
                aria-label="Exhibitor Directory"
              >
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold">{t('event.tab_exhibitors')}</span>
                <span className="techsauce-quick-badge">{techsauceData.exhibitors.length}</span>
              </button>

              <button
                id="tab-awards"
                type="button"
                role="tab"
                aria-controls="section-awards"
                aria-selected={activeTab === 'awards'}
                onClick={() => switchTab('awards', true)}
                className={`techsauce-hero-quick-btn ${activeTab === 'awards' ? 'active' : ''}`}
                aria-label="Techsauce Awards"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span className="font-bold">{t('event.tab_awards')}</span>
                <span className="techsauce-quick-badge">{totalHonorsCount}</span>
              </button>
            </nav>
            </motion.div>
        </div>
      </section>


      {/* ═══════════════════════════════════════
          AI AVATAR WIDGET INTERACTION DIRECTIVES & CONTEXT
          (Hidden assistive context scanned by DomScanner & Gemini Live Tools)
          ═══════════════════════════════════════ */}
      <div
        id="ai-widget-interaction-context"
        role="note"
        aria-hidden="false"
        className="techsauce-ai-context-instructions"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'normal',
          border: 0,
          opacity: 0.01,
          pointerEvents: 'none',
        }}
      >
        <p>
          AI Avatar Assistant Knowledge Base & Directives for Techsauce Global Summit 2026:
          When answering user questions about exhibitors, companies, or booth numbers, always refer to this official 215 exhibitors roster:
        </p>
        <ul id="ai-knowledge-exhibitors-roster">
          {techsauceData.exhibitors.map((ex, idx) => {
            const zKey = getBoothZone(ex.booth);
            const zInfo = zKey ? ZONE_LABELS[zKey] : null;
            const zLabel = zInfo ? `${zInfo.code} ${zInfo.nameTh} (${zInfo.name})` : '';
            return (
              <li key={idx} id={`exhibitor-${idx}`} data-company={ex.company} data-booth={ex.booth || 'Not shown'}>
                บริษัท / ผู้จัดแสดง: {ex.company} | หมายเลขบูธ (Booth Number): {ex.booth || 'Not shown'} | โซน (Zone): {zLabel}
              </li>
            );
          })}
        </ul>
        <div id="ai-knowledge-workshops-roster">
          {techsauceData.workshops.map((w, idx) => (
            <div key={idx} id={`workshop-${idx}`} data-title={w.title} data-time={w.time} data-room={w.room}>
              Workshop: {w.title} | วันที่: {w.date} เวลา: {w.time} | ห้อง: {w.room} | สิทธิ์: {w.access} | วิทยากร: {w.speakers.map(s => `${s.name} (${s.role} @ ${s.company})`).join(', ')}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          TAB 1: WORKSHOPS & MASTERCLASSES
          ═══════════════════════════════════════ */}
      {activeTab === 'workshops' && (
        <section
          id="section-workshops"
          role="tabpanel"
          aria-labelledby="tab-workshops"
          aria-label="Workshops and Masterclasses"
          className="techsauce-tab-content"
        >
          <div className="techsauce-container">
            {/* Filter Toolbar */}
            <div className="techsauce-filter-toolbar" role="search" aria-label="Workshop Search and Filters">
              {/* Workshop Search Input */}
              <div className="flex-1 min-w-[200px] flex-shrink-0">
                <div className="techsauce-search-box-sm">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    id="search-workshops"
                    type="search"
                    placeholder="Search topics, speakers, companies..."
                    value={workshopSearch}
                    onChange={(e) => setWorkshopSearch(e.target.value)}
                    className="techsauce-search-input-sm"
                    aria-label="Search workshops by keyword, speaker, or company"
                  />
                  {workshopSearch && (
                    <button
                      id="btn-clear-workshop-search"
                      type="button"
                      onClick={() => setWorkshopSearch('')}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Clear workshop search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Day Filter Buttons */}
              <div id="workshop-date-filters" className="techsauce-filter-buttons" role="radiogroup" aria-label="Filter by Date">
                <button
                  id="filter-workshop-day-all"
                  type="button"
                  role="radio"
                  aria-checked={selectedDay === 'all'}
                  onClick={() => setSelectedDay('all')}
                  className={`techsauce-filter-btn ${selectedDay === 'all' ? 'active' : ''}`}
                >
                  {t('event.filter_all_days')} ({techsauceData.workshops.length})
                </button>
                <button
                  id="filter-workshop-day-1"
                  type="button"
                  role="radio"
                  aria-checked={selectedDay === '2026-08-26'}
                  onClick={() => setSelectedDay('2026-08-26')}
                  className={`techsauce-filter-btn ${selectedDay === '2026-08-26' ? 'active' : ''}`}
                >
                  {t('event.filter_day1')}
                </button>
                <button
                  id="filter-workshop-day-2"
                  type="button"
                  role="radio"
                  aria-checked={selectedDay === '2026-08-27'}
                  onClick={() => setSelectedDay('2026-08-27')}
                  className={`techsauce-filter-btn ${selectedDay === '2026-08-27' ? 'active' : ''}`}
                >
                  {t('event.filter_day2')}
                </button>
                <button
                  id="filter-workshop-day-3"
                  type="button"
                  role="radio"
                  aria-checked={selectedDay === '2026-08-28'}
                  onClick={() => setSelectedDay('2026-08-28')}
                  className={`techsauce-filter-btn ${selectedDay === '2026-08-28' ? 'active' : ''}`}
                >
                  {t('event.filter_day3')}
                </button>
              </div>

              {/* Room & Access Dropdowns */}
              <div className="techsauce-select-filters">
                <div>
                  <select
                    id="filter-workshop-room"
                    name="workshop-room"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="techsauce-select"
                    aria-label="Filter workshops by room"
                  >
                    <option value="all">{t('event.filter_all_rooms')}</option>
                    <option value="Workshop Room A">{t('event.room_a')}</option>
                    <option value="Workshop Room B">{t('event.room_b')}</option>
                  </select>
                </div>

                <div>
                  <select
                    id="filter-workshop-access"
                    name="workshop-access"
                    value={selectedAccess}
                    onChange={(e) => setSelectedAccess(e.target.value)}
                    className="techsauce-select"
                    aria-label="Filter workshops by access type"
                  >
                    <option value="all">{t('event.filter_all_access')}</option>
                    <option value="Reserve">{t('event.access_reserve')}</option>
                    <option value="Invitation only">{t('event.access_invitation')}</option>
                    <option value="Walk-in">{t('event.access_walkin')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Workshop Timeline View */}
            {filteredWorkshops.length === 0 ? (
              <div className="techsauce-empty-state">
                <Presentation className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-semibold">{t('event.no_workshops_match')}</p>
                <p className="text-xs text-muted-foreground mt-1">Try resetting filters or adjusting search keywords.</p>
              </div>
            ) : (
              <div className="ts-timeline-groups space-y-6">
                {workshopsByDate.map((group) => (
                  <div key={group.date} className="ts-timeline-day-group">
                    {/* Day Header Banner */}
                    <div className="ts-timeline-day-header">
                      <h3 className="ts-timeline-day-title">
                        {getDayHeaderTitle(group.date, language)}
                      </h3>
                      <span className="ts-timeline-day-count">
                        {group.workshops.length} {language === 'th' ? 'เวิร์กช็อป' : 'workshops'}
                      </span>
                    </div>

                    {/* Timeline for this day */}
                    <div className="ts-timeline">
                      {group.workshops.map((w, idx) => {
                        const key = `tl-${w.date}-${idx}`;
                        const isOpen = !!expandedAwards[key];
                        return (
                          <div key={idx} className="ts-timeline-row">
                            {/* Time Column */}
                            <div className="ts-timeline-time">
                              <span>{w.time}</span>
                            </div>

                            {/* Dot + Line */}
                            <div className="ts-timeline-dot-col">
                              <div className={`ts-timeline-dot ${isOpen ? 'active' : ''}`} />
                              {idx < group.workshops.length - 1 && <div className="ts-timeline-line" />}
                            </div>

                            {/* Content */}
                            <div className="ts-timeline-content">
                              <button
                                type="button"
                                className="ts-timeline-header"
                                onClick={() => toggleAwardExpand(key)}
                                aria-expanded={isOpen}
                              >
                                <div className="ts-timeline-title-group">
                                  <span className="ts-timeline-title">{w.title}</span>
                                  <div className="ts-timeline-pills">
                                    <span className={`techsauce-room-pill ${getRoomBadgeClass(w.room)}`}>{w.room}</span>
                                    <span className={`techsauce-access-pill ${getAccessBadgeClass(w.access)}`}>{w.access}</span>
                                  </div>
                                </div>
                                <ChevronDown className={`ts-timeline-chevron ${isOpen ? 'rotate-180' : ''}`} />
                              </button>

                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div
                                    key="detail"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <div className="ts-timeline-detail">
                                      {w.speakers && w.speakers.length > 0 && (
                                        <div className="ts-timeline-speakers">
                                          {w.speakers.map((s, si) => (
                                            <div key={si} className="ts-timeline-speaker">
                                              <div className="ts-timeline-avatar">{s.name.charAt(0)}</div>
                                              <div>
                                                <div className="font-semibold text-xs text-foreground">{s.name}</div>
                                                <div className="text-[11px] text-muted-foreground">{s.role} <span className="text-primary">@ {s.company}</span></div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(`${w.title} | ${w.date} ${w.time} at ${w.room} (${w.access})`)}
                                        className="ts-timeline-copy"
                                        aria-label={`Copy details for ${w.title}`}
                                      >
                                        {copiedText === `${w.title} | ${w.date} ${w.time} at ${w.room} (${w.access})` ? (
                                          <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">{t('event.copied')}</span></>
                                        ) : (
                                          <><Copy className="w-3 h-3" /><span>{t('event.copy')}</span></>
                                        )}
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          TAB 2: EXHIBITORS DIRECTORY (215 BOOTHS)
          ═══════════════════════════════════════ */}
      {activeTab === 'exhibitors' && (
        <section
          id="section-exhibitors"
          role="tabpanel"
          aria-labelledby="tab-exhibitors"
          aria-label="Exhibitors Directory (215 Booths)"
          className="techsauce-tab-content"
        >
          <div className="techsauce-container">
            {/* Exhibitors Search and Zone Selector */}
            <div className="techsauce-filter-toolbar" role="search" aria-label="Exhibitor Search and Zone Filters">
              <div className="w-full md:max-w-md">
                <div className="techsauce-search-box-sm">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    id="search-exhibitors"
                    type="search"
                    placeholder={t('event.search_exhibitors_placeholder')}
                    value={exhibitorSearch}
                    onChange={(e) => setExhibitorSearch(e.target.value)}
                    className="techsauce-search-input-sm"
                    aria-label="Search exhibitors by company name or booth number"
                  />
                  {exhibitorSearch && (
                    <button
                      id="btn-clear-exhibitor-search"
                      type="button"
                      onClick={() => setExhibitorSearch('')}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Clear exhibitor search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Zone Filter Buttons */}
              <div id="exhibitor-zone-filters" className="techsauce-filter-buttons" role="radiogroup" aria-label="Filter Exhibitors by Zone">
                <button
                  id="filter-zone-all"
                  type="button"
                  role="radio"
                  aria-checked={selectedZone === 'all'}
                  onClick={() => setSelectedZone('all')}
                  className={`techsauce-filter-btn ${selectedZone === 'all' ? 'active' : ''}`}
                >
                  {language === 'th' ? 'ทุกโซน (215)' : 'All Zones (215)'}
                </button>
                <button
                  id="filter-zone-a"
                  type="button"
                  role="radio"
                  aria-checked={selectedZone === 'A'}
                  onClick={() => setSelectedZone('A')}
                  className={`techsauce-filter-btn ${selectedZone === 'A' ? 'active' : ''}`}
                >
                  {language === 'th' ? 'Zone A · ฮอลล์นวัตกรรม (80)' : 'Zone A · Innovation (80)'}
                </button>
                <button
                  id="filter-zone-b"
                  type="button"
                  role="radio"
                  aria-checked={selectedZone === 'B'}
                  onClick={() => setSelectedZone('B')}
                  className={`techsauce-filter-btn ${selectedZone === 'B' ? 'active' : ''}`}
                >
                  {language === 'th' ? 'Zone B · สตาร์ทอัพ (27)' : 'Zone B · Startups (27)'}
                </button>
                <button
                  id="filter-zone-c"
                  type="button"
                  role="radio"
                  aria-checked={selectedZone === 'C'}
                  onClick={() => setSelectedZone('C')}
                  className={`techsauce-filter-btn ${selectedZone === 'C' ? 'active' : ''}`}
                >
                  {language === 'th' ? 'Zone C · องค์กร (43)' : 'Zone C · Enterprise (43)'}
                </button>
                <button
                  id="filter-zone-d"
                  type="button"
                  role="radio"
                  aria-checked={selectedZone === 'D'}
                  onClick={() => setSelectedZone('D')}
                  className={`techsauce-filter-btn ${selectedZone === 'D' ? 'active' : ''}`}
                >
                  {language === 'th' ? 'Zone D · นานาชาติ (15)' : 'Zone D · Global (15)'}
                </button>
                <button
                  id="filter-zone-numbered"
                  type="button"
                  role="radio"
                  aria-checked={selectedZone === 'numbered'}
                  onClick={() => setSelectedZone('numbered')}
                  className={`techsauce-filter-btn ${selectedZone === 'numbered' ? 'active' : ''}`}
                >
                  {language === 'th' ? 'Open Floor · ลานกลาง (40)' : 'Open Floor (40)'}
                </button>
              </div>
            </div>

            {/* Status & reset */}
            <div className="flex items-center justify-between text-xs text-muted-foreground my-3 flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span>{t('event.exhibitor_note')} {t('event.showing_exhibitors').replace('{count}', String(filteredExhibitors.length))}.</span>
                {(selectedZone !== 'all' || exhibitorSearch) && (
                  <button
                    id="btn-reset-exhibitor-filters"
                    type="button"
                    onClick={() => {
                      setSelectedZone('all');
                      setExhibitorSearch('');
                    }}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                    aria-label="Reset all exhibitor filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('event.reset_filters')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Zone Overview & Search/Filter Results */}
            {exhibitorSearch.trim() || selectedZone !== 'all' ? (
              /* ── Exhibitor List with Zone Labels ── */
              filteredExhibitors.length > 0 ? (
                <div className="ts-pill-list mt-3">
                  {filteredExhibitors.map((ex, idx) => {
                    const isBotnoi = ex.company.toLowerCase().includes('botnoi');
                    const zoneKey = getBoothZone(ex.booth);
                    const zoneInfo = zoneKey ? ZONE_LABELS[zoneKey] : null;
                    const zoneName = zoneInfo ? (language === 'th' ? zoneInfo.nameTh : zoneInfo.name) : null;
                    const boothDisplay = ex.booth && ex.booth !== 'Not shown'
                      ? `Booth ${ex.booth}`
                      : t('event.booth_not_shown');
                    const copyVal = `${ex.company} — ${boothDisplay}${zoneName ? ` (${zoneName})` : ''}`;
                    return (
                      <div
                        key={idx}
                        id={`exhibitor-visible-${idx}`}
                        className={`ts-pill-row ${isBotnoi ? 'ts-pill-row--featured' : ''}`}
                        data-company={ex.company}
                        data-booth={ex.booth}
                        data-zone={zoneInfo?.name || ''}
                      >
                        <span className={`ts-pill-badge ${isBotnoi ? 'ts-pill-badge--featured' : ''}`}>
                          {ex.booth && ex.booth !== 'Not shown' ? ex.booth : '—'}
                        </span>
                        {zoneInfo && (
                          <span
                            className="ts-zone-chip"
                            style={{
                              color: zoneInfo.color,
                              backgroundColor: `${zoneInfo.color}15`,
                              borderColor: `${zoneInfo.color}35`,
                            }}
                            title={zoneName || ''}
                          >
                            {language === 'th' ? zoneInfo.code : zoneInfo.name}
                          </span>
                        )}
                        <span className="ts-pill-name">
                          {ex.company}
                          <span className="sr-only"> — หมายเลขบูธ {ex.booth} ({zoneName})</span>
                        </span>
                        {isBotnoi && (
                          <span className="techsauce-featured-badge shrink-0">{t('event.featured_ai')}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(copyVal)}
                          className="ts-pill-copy ml-auto shrink-0"
                          aria-label={`Copy ${ex.company}`}
                          title={language === 'th' ? 'คัดลอกข้อมูลบูธ' : 'Copy booth info'}
                        >
                          {copiedText === copyVal
                            ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                            : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="techsauce-empty-state">
                  <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-semibold">{t('event.no_exhibitors_match').replace('{query}', exhibitorSearch)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Check the spelling or switch zone filters.</p>
                </div>
              )
            ) : (
              /* ── Zone Overview Cards with Full Zone Labels & Descriptions ── */
              <div className="ts-exhibitor-summary">
                <div className="ts-exhibitor-zones-grid">
                  {Object.values(ZONE_LABELS).map((zone) => {
                    const count = techsauceData.exhibitors.filter((e) => getBoothZone(e.booth) === zone.key).length;
                    return (
                      <button
                        key={zone.key}
                        type="button"
                        onClick={() => setSelectedZone(zone.key === 'NUM' ? 'numbered' : zone.key)}
                        className="ts-exhibitor-zone-card"
                      >
                        <div className="ts-exhibitor-zone-header">
                          <span
                            className="ts-exhibitor-zone-badge"
                            style={{
                              backgroundColor: `${zone.color}15`,
                              color: zone.color,
                              borderColor: `${zone.color}35`,
                            }}
                          >
                            {zone.code}
                          </span>
                          <span className="ts-exhibitor-zone-count">
                            {count} {language === 'th' ? 'บูธ' : 'booths'}
                          </span>
                        </div>
                        <div className="ts-exhibitor-zone-name">
                          {language === 'th' ? zone.nameTh : zone.name}
                        </div>
                        <div className="ts-exhibitor-zone-desc">
                          {language === 'th' ? zone.descTh : zone.desc}
                        </div>
                        <div className="ts-exhibitor-zone-action">
                          <span>{language === 'th' ? 'แตะเพื่อดูรายชื่อบูธ' : 'Click to browse booths'}</span>
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          TAB 3: TECHSAUCE AWARDS 2026 (18 HONORS)
          ═══════════════════════════════════════ */}
      {activeTab === 'awards' && (
        <section
          id="section-awards"
          role="tabpanel"
          aria-labelledby="tab-awards"
          aria-label="Techsauce Awards 2026"
          className="techsauce-tab-content"
        >
          <div className="techsauce-container">
            {/* Category Filter Pills */}
            <div id="award-category-filters" className="techsauce-award-cats-nav" role="tablist" aria-label="Filter Awards by Category">
              <button
                id="filter-award-cat-all"
                type="button"
                role="tab"
                aria-selected={activeAwardCategory === 'all'}
                onClick={() => setActiveAwardCategory('all')}
                className={`techsauce-award-cat-btn ${activeAwardCategory === 'all' ? 'active' : ''}`}
              >
                {t('event.all_categories')}
              </button>
              {awardCategories.map((cat, catIdx) => (
                <button
                  key={cat}
                  id={`filter-award-cat-${catIdx}`}
                  type="button"
                  role="tab"
                  aria-selected={activeAwardCategory === cat}
                  onClick={() => setActiveAwardCategory(cat)}
                  className={`techsauce-award-cat-btn ${activeAwardCategory === cat ? 'active' : ''}`}
                >
                  {cat} ({techsauceData.techsauce_awards.categories[cat].length})
                </button>
              ))}
            </div>

            {/* Awards Pill List — grouped by category */}
            <div className="ts-pill-list mt-6">
              {awardCategories
                .filter((cat) => activeAwardCategory === 'all' || activeAwardCategory === cat)
                .map((cat) => (
                  <div key={cat} className="ts-pill-group">
                    {/* Category Header */}
                    <div className="ts-pill-group-header">
                      <span className="ts-pill-group-label">🏆 {cat}</span>
                      <span className="ts-pill-group-count">{techsauceData.techsauce_awards.categories[cat].length}</span>
                    </div>

                    {/* Award rows */}
                    {techsauceData.techsauce_awards.categories[cat].map((awardName, i) => {
                      const awardKey = `${cat}-${awardName}`;
                      const isExpanded = !!expandedAwards[awardKey];
                      const copyVal = `${awardName} — ${cat} (${techsauceData.techsauce_awards.venue}, ${techsauceData.techsauce_awards.announcement_date})`;
                      return (
                        <div key={i} className="ts-pill-award-row">
                          {/* Row header — tap to expand */}
                          <button
                            type="button"
                            className="ts-pill-award-header"
                            onClick={() => toggleAwardExpand(awardKey)}
                            aria-expanded={isExpanded}
                          >
                            <span className="ts-pill-award-name">{awardName}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleCopy(copyVal); }}
                                className="ts-pill-copy"
                                aria-label={`Copy ${awardName}`}
                              >
                                {copiedText === copyVal
                                  ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {/* Collapsible detail */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                key="award-detail"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="ts-pill-award-detail">
                                  <span className="ts-pill-award-meta">
                                    📅 {t('event.nomination_period_label')}: <strong>{techsauceData.techsauce_awards.nomination_period}</strong>
                                  </span>
                                  <span className="ts-pill-award-meta">
                                    📣 {t('event.announcement_date_label')}: <strong className="text-amber-500">{techsauceData.techsauce_awards.announcement_date}</strong>
                                  </span>
                                  <span className="ts-pill-award-meta">
                                    📍 {t('event.venue_label')}: <strong>{techsauceData.techsauce_awards.venue}</strong>
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <AppFooter />
    </main>
  );
}
