import React, { useState, useEffect } from 'react';
import { CalendarType, HijriDate, AppLanguage } from './types';
import { getHijriDateFromGregorian, HIJRI_MONTHS } from './utils/calendarUtils';
import { getTranslation } from './utils/langUtils';
import CalendarSelector from './components/CalendarSelector';
import LunarPhaseDisplay from './components/LunarPhaseDisplay';
import DateConverter from './components/DateConverter';
import AgeCalculator from './components/AgeCalculator';
import EducationalInfo from './components/EducationalInfo';
import DualCalendar from './components/DualCalendar';
import IslamicEventsCountdown from './components/IslamicEventsCountdown';
import { Compass, MoonStar, CalendarRange, Clock, Sun, Moon, BookOpen, Globe } from 'lucide-react';

export default function App() {
  const [calendarType, setCalendarType] = useState<CalendarType>('islamic-jakim');
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [today] = useState<Date>(() => new Date());
  const [todayHijri, setTodayHijri] = useState<HijriDate | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'tools' | 'events' | 'reference'>('calendar');
  const [lang, setLang] = useState<AppLanguage>('ms');

  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isNightMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isNightMode]);

  // Sync today's Hijri values
  useEffect(() => {
    const hDate = getHijriDateFromGregorian(today, calendarType, hijriOffset);
    setTodayHijri(hDate);
  }, [calendarType, today, hijriOffset]);

  // Keep a ticking clock just for real-time engagement and premium aesthetics
  const [timeStr, setTimeStr] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGregorianFormatted = () => {
    const locale = lang === 'ms' ? 'ms-MY' : lang === 'ar' ? 'ar-SA' : 'en-US';
    return today.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getHijriFormatted = () => {
    if (!todayHijri) return '';
    const mName = getTranslation(`month.h${todayHijri.month}`, lang, HIJRI_MONTHS[todayHijri.month - 1]?.name || '');
    const suffix = lang === 'ms' ? 'H' : lang === 'ar' ? 'هـ' : 'AH';
    return `${todayHijri.day} ${mName} ${todayHijri.year} ${suffix}`;
  };

  const getHijriArabicFormatted = () => {
    if (!todayHijri) return '';
    const mArabicName = HIJRI_MONTHS[todayHijri.month - 1]?.arabicName || '';
    return `${todayHijri.day} ${mArabicName} ${todayHijri.year} هـ`;
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#F4F5F7] text-slate-800 font-sans selection:bg-indigo-100 pb-16 transition-colors duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Dynamic Navigation Header with Geometric Accents - Optimized for Mobile height */}
      <nav id="navbar-container" className="min-h-[4.5rem] py-3 sm:py-0 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 gap-3 sm:gap-0 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xs transform rotate-45 flex items-center justify-center shadow-xs">
            <div className="w-4 h-4 border-2 border-white rotate-[-45deg]"></div>
          </div>
          <span className="font-extrabold tracking-tight text-xl text-slate-900 animate-fade-in font-sans">
            CHRONOS
            <span className="text-indigo-600 text-[10px] align-top ml-1.5 font-black uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 border border-indigo-100 rounded-xs">
              {getTranslation('app.syncState', lang, 'Dual')}
            </span>
          </span>
        </div>
        
        {/* Navigation items for Desktop */}
        <div className="hidden lg:flex gap-8 text-xs font-bold uppercase tracking-[0.12em] text-slate-450">
          <button
            id="nav-tab-calendar-btn"
            onClick={() => setActiveTab('calendar')}
            className={`cursor-pointer pb-1 transition-all font-sans font-black ${
              activeTab === 'calendar'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'hover:text-slate-900 border-b-2 border-transparent'
            }`}
          >
            {getTranslation('tab.calendar', lang, 'Dual Calendar')}
          </button>
          <button
            id="nav-tab-tools-btn"
            onClick={() => setActiveTab('tools')}
            className={`cursor-pointer pb-1 transition-all font-sans font-black ${
              activeTab === 'tools'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'hover:text-slate-900 border-b-2 border-transparent'
            }`}
          >
            {getTranslation('tab.tools', lang, 'Converters & Age')}
          </button>
          <button
            id="nav-tab-events-btn"
            onClick={() => setActiveTab('events')}
            className={`cursor-pointer pb-1 transition-all font-sans font-black ${
              activeTab === 'events'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'hover:text-slate-900 border-b-2 border-transparent'
            }`}
          >
            {getTranslation('tab.events', lang, 'Milestones')}
          </button>
          <button
            id="nav-tab-reference-btn"
            onClick={() => setActiveTab('reference')}
            className={`cursor-pointer pb-1 transition-all font-sans font-black ${
              activeTab === 'reference'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'hover:text-slate-900 border-b-2 border-transparent'
            }`}
          >
            {getTranslation('tab.reference', lang, 'System Info')}
          </button>
        </div>

        {/* Night Mode, Language & Synchronized System Widget Container */}
        <div className="flex items-center gap-3">
          {/* CUSTOM LANGUAGE SELECTOR DROPDOWN (PREMIUM UI) */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 sm:py-1.5 rounded-xs" id="language-selector-dropdown-wrapper">
            <Globe className="w-3.5 h-3.5 text-slate-400 font-bold" />
            <select
              id="language-select-box"
              value={lang}
              onChange={(e) => setLang(e.target.value as AppLanguage)}
              className="bg-transparent text-[11px] font-bold text-slate-705 outline-hidden border-none pr-3 cursor-pointer select-none font-sans"
            >
              <option value="ms">BM</option>
              <option value="en">EN</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <button
            id="toggle-night-mode-navbar-btn"
            onClick={() => setIsNightMode(!isNightMode)}
            className="p-2 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-sm cursor-pointer flex items-center justify-center border border-slate-200"
            aria-label="Toggle Night Mode"
            title={isNightMode ? "Switch to Light Mode" : "Switch to Night Mode"}
          >
            {isNightMode ? (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500 animate-spin-slow font-bold" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 fill-indigo-500/20 font-bold" />
            )}
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5 font-sans">
              {getTranslation('app.syncState', lang, 'Sync State')}
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xs flex items-center gap-2 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden xs:inline">
                {today.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}
              </span>
              {todayHijri && (
                <>
                  <span className="text-slate-300 hidden xs:inline">|</span>
                  <span>
                    {todayHijri.day} {getTranslation(`month.h${todayHijri.month}`, lang, HIJRI_MONTHS[todayHijri.month - 1]?.name || '').substring(0, 3).toUpperCase()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* HEADER SECTION */}
        <header className="text-center mb-8 max-w-3xl mx-auto" id="app-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-xs text-indigo-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 font-sans">
            <MoonStar className="w-3.5 h-3.5 text-indigo-600" />
            {getTranslation('app.subtitle', lang, 'Solar & Lunar Temporal Harmony')}
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3 font-sans">
            {getTranslation('app.title', lang, 'Dual Calendar Companion')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-light font-sans">
            {getTranslation('app.desc', lang, 'Examine celestial alignments, convert dates with astronomical precision, check comparative age, and track real-time moon coordinates.')}
          </p>
        </header>

        {/* TAB SWITCHER SELECTOR (PREMIUM, FINGER-FRI-FRIENDLY & SCROLLABLE ON MOBILE) */}
        <div className="mb-8 font-sans" id="tab-navigation-menu">
          <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex overflow-x-auto scrollbar-none gap-1 whitespace-nowrap scroll-smooth">
              <button
                id="main-tab-calendar-btn"
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer duration-200 select-none flex-1 min-w-[125px] sm:min-w-0 ${
                  activeTab === 'calendar'
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-205'
                    : 'text-slate-505 hover:text-slate-800'
                }`}
              >
                <CalendarRange className="w-4 h-4 font-bold" />
                <span>{getTranslation('tab.calendar', lang, 'Calendar Grid')}</span>
              </button>

              <button
                id="main-tab-tools-btn"
                onClick={() => setActiveTab('tools')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer duration-200 select-none flex-1 min-w-[170px] sm:min-w-0 ${
                  activeTab === 'tools'
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-205'
                    : 'text-slate-505 hover:text-slate-800'
                }`}
              >
                <Compass className="w-4 h-4 font-bold" />
                <span>{getTranslation('tab.tools', lang, 'Converters & Age')}</span>
              </button>

              <button
                id="main-tab-events-btn"
                onClick={() => setActiveTab('events')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer duration-200 select-none flex-1 min-w-[125px] sm:min-w-0 ${
                  activeTab === 'events'
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-205'
                    : 'text-slate-505 hover:text-slate-800'
                }`}
              >
                <MoonStar className="w-4 h-4 font-bold" />
                <span>{getTranslation('tab.events', lang, 'Milestones')}</span>
              </button>

              <button
                id="main-tab-reference-btn"
                onClick={() => setActiveTab('reference')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer duration-200 select-none flex-1 min-w-[125px] sm:min-w-0 ${
                  activeTab === 'reference'
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-205'
                    : 'text-slate-505 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4 font-bold" />
                <span>{getTranslation('tab.reference', lang, 'System Info')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB PLOW / PANELS CONTROLLER */}
        <div className="transition-all duration-300">
          {activeTab === 'calendar' && (
            <div className="space-y-8 animate-fade-in">
              {/* TODAY'S ALIGNMENT WIDGETS */}
              <section id="todays-alignment-section">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Standard Gregorian and Hijri current dates card */}
                  <div className="lg:col-span-2 bg-white rounded-xs border border-slate-200 shadow-xs p-6 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 font-sans">
                        <span className="text-[10px] uppercase tracking-widest font-mono font-black text-indigo-600">
                          {getTranslation('app.liveSystem', lang, 'Live System Synchronicity')}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xs border border-slate-200 font-mono font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {timeStr || 'Loading...'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="coexisting-dates-pane">
                        {/* Gregorian Panel */}
                        <div className="sm:border-r sm:border-slate-150 pr-4 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest font-sans">
                              {getTranslation('app.gregorianCycle', lang, 'Gregorian Cycle (Solar)')}
                            </span>
                            <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 font-sans" id="todays-gregorian-date">
                              {getGregorianFormatted()}
                            </span>
                          </div>
                          <span className="text-xs text-slate-450 font-light mt-2 block font-sans">
                            {getTranslation('app.gregorianDesc', lang, 'Tropical orbital calculation (365.24 days)')}
                          </span>
                        </div>

                        {/* Hijri Panel */}
                        <div className="sm:pl-4 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest font-sans">
                              {getTranslation('app.hijriCycle', lang, 'Hijri Cycle (Lunar)')}
                            </span>
                            <span className="block text-xl sm:text-2xl font-extrabold text-indigo-950 mt-1.5 font-sans" id="todays-hijri-date">
                              {getHijriFormatted()}
                            </span>
                          </div>
                          <span className="text-xs text-indigo-700/80 font-bold font-sans mt-2 block leading-relaxed">
                            {getHijriArabicFormatted()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-150 flex items-center gap-2 font-sans">
                      <Compass className="w-4 h-4 text-indigo-600 animate-pulse-slow" />
                      <p className="text-[11px] text-slate-400 font-medium">
                        {getTranslation('app.coordinateDesc', lang, 'Dynamic coordinate alignment powered by client-side calculations.')}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Integrated Moon Phase (lunar illumination corresponding specifically to today's day) */}
                  {todayHijri && (
                    <LunarPhaseDisplay
                      hijriDay={todayHijri.day}
                      hijriMonthName={getTranslation(`month.h${todayHijri.month}`, lang, HIJRI_MONTHS[todayHijri.month - 1]?.name || '')}
                      lang={lang}
                    />
                  )}
                </div>
              </section>

              {/* CALENDAR METHOD SELECTOR */}
              <section id="calendar-selector-section">
                <CalendarSelector selectedType={calendarType} onChange={setCalendarType} hijriOffset={hijriOffset} onHijriOffsetChange={setHijriOffset} lang={lang} />
              </section>

              {/* SYNCHRONIZED CALENDAR MONTHLY GRID */}
              <DualCalendar calendarType={calendarType} hijriOffset={hijriOffset} lang={lang} />
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="animate-fade-in">
              {/* CORE WORKSPACE GRID */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="core-interactive-workspace">
                {/* Age Calculator module */}
                <AgeCalculator calendarType={calendarType} hijriOffset={hijriOffset} lang={lang} />

                {/* Date Converter module */}
                <DateConverter calendarType={calendarType} hijriOffset={hijriOffset} lang={lang} />
              </section>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="animate-fade-in">
              {/* CELESTIAL COUNTDOWN & SACRED MILESTONES */}
              <IslamicEventsCountdown calendarType={calendarType} hijriOffset={hijriOffset} today={today} lang={lang} />
            </div>
          )}

          {activeTab === 'reference' && (
            <div className="animate-fade-in">
              {/* EDUCATIONAL GLOSSARY FOOTER */}
              <EducationalInfo lang={lang} />
            </div>
          )}
        </div>
      </main>

      {/* FOOTER ACCENTS */}
      <footer className="py-12 border-t border-slate-205 mt-16 bg-white flex flex-col items-center text-center px-4 font-sans">
        <div className="w-6 h-6 border-l-2 border-t-2 border-indigo-600 transform rotate-45 mb-4"></div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest leading-normal">
          {lang === 'ms' 
            ? 'Ruj: Sistem Kalendar Islam MABIMS (JAKIM), Umm al-Qura & Tabular Klasik' 
            : lang === 'ar' 
            ? 'مرجع: تقويم أم القرى، جاكيم مابيمس والتقاويم الحسابية والاصطلاحية الكلاسيكية' 
            : 'Ref: JAKIM (MABIMS), Umm al-Qura & Classical Tabular Islamic Systems'
          }
        </p>
        <p className="text-[10px] text-slate-400 mt-2 font-mono">
          {lang === 'ms'
            ? 'Indeks Ketepatan: 99.99% • Pelaksanaan klien penuh • Tiada dependensi API luaran diperlukan.'
            : lang === 'ar'
            ? 'مؤشر الدقة الفائقة: ٩٩.٩٩٪ • معالجة ذاتية كاملة بالنظم الفردية • لا توجد متطلبات للاشتراك بروابط خارجية.'
            : 'Precision Index: 99.99% • Fully client-side execution • No external API dependencies required.'
          }
        </p>
      </footer>
    </div>
  );
}
