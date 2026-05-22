import React, { useState, useEffect } from 'react';
import { CalendarType, HijriDate } from './types';
import { getHijriDateFromGregorian, HIJRI_MONTHS, GREGORIAN_MONTHS } from './utils/calendarUtils';
import CalendarSelector from './components/CalendarSelector';
import LunarPhaseDisplay from './components/LunarPhaseDisplay';
import DateConverter from './components/DateConverter';
import AgeCalculator from './components/AgeCalculator';
import EducationalInfo from './components/EducationalInfo';
import DualCalendar from './components/DualCalendar';
import IslamicEventsCountdown from './components/IslamicEventsCountdown';
import { Compass, MoonStar, CalendarRange, Clock } from 'lucide-react';

export default function App() {
  const [calendarType, setCalendarType] = useState<CalendarType>('islamic-umalqura');
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [today, setToday] = useState<Date>(() => new Date());
  const [todayHijri, setTodayHijri] = useState<HijriDate | null>(null);

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
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getHijriFormatted = () => {
    if (!todayHijri) return '';
    const mName = HIJRI_MONTHS[todayHijri.month - 1]?.name || '';
    return `${todayHijri.day} ${mName} ${todayHijri.year} AH`;
  };

  const getHijriArabicFormatted = () => {
    if (!todayHijri) return '';
    const mArabicName = HIJRI_MONTHS[todayHijri.month - 1]?.arabicName || '';
    return `${todayHijri.day} ${mArabicName} ${todayHijri.year} هـ`;
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 font-sans selection:bg-indigo-100 pb-16">
      {/* Dynamic Navigation Header with Geometric Accents */}
      <nav className="h-20 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 py-4 sm:py-0 gap-3 sm:gap-0 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xs transform rotate-45 flex items-center justify-center shadow-xs">
            <div className="w-4 h-4 border-2 border-white rotate-[-45deg]"></div>
          </div>
          <span className="font-extrabold tracking-tight text-xl text-slate-900">
            CHRONOS
            <span className="text-indigo-600 text-[10px] align-top ml-1 font-black uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 border border-indigo-100 rounded-xs">
              Dual
            </span>
          </span>
        </div>
        
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          <a href="#dual-calendar-workspace" className="text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all">
            Calendar Grid
          </a>
          <a href="#core-interactive-workspace" className="hover:text-slate-900 transition-all">
            Age Metrics
          </a>
          <a href="#date-converter-card" className="hover:text-slate-900 transition-all">
            Converter
          </a>
          <a href="#calendar-selector-container" className="hover:text-slate-900 transition-all">
            Engine Rules
          </a>
          <a href="#educational-info" className="hover:text-slate-900 transition-all">
            Insights
          </a>
        </div>

        <div className="text-center sm:text-right">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
            Synchronized System
          </div>
          <div className="text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {today.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            {todayHijri && (
              <>
                <span className="text-slate-300">|</span>
                <span>
                  {todayHijri.day} {(HIJRI_MONTHS[todayHijri.month - 1]?.name.substring(0, 3)).toUpperCase()} {todayHijri.year} AH
                </span>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* HEADER SECTION */}
        <header className="text-center mb-10 max-w-3xl mx-auto" id="app-header">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-50 border border-indigo-100 rounded-xs text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4">
            <MoonStar className="w-3.5 h-3.5 text-indigo-600" />
            Solar & Lunar Temporal Harmony
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Dual Calendar Companion
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-light">
            Examine the celestial mathematical alignments. Convert days with astronomical precision, check comparative age parameters, and track real-time moon phase coordinates.
          </p>
        </header>

        {/* TODAY'S ALIGNMENT WIDGETS */}
        <section className="mb-10" id="todays-alignment-section">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Standard Gregorian and Hijri current dates card */}
            <div className="lg:col-span-2 bg-white rounded-xs border border-slate-200 shadow-xs p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase tracking-widest font-mono font-black text-indigo-600">
                    Live System Synchronicity
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
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Gregorian Cycle (Solar)</span>
                      <span className="block text-2xl font-extrabold text-slate-900 mt-1.5" id="todays-gregorian-date">
                        {getGregorianFormatted()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-light mt-2 block">Tropical orbital calculation (365.24 days)</span>
                  </div>

                  {/* Hijri Panel */}
                  <div className="sm:pl-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest">Hijri Cycle (Lunar)</span>
                      <span className="block text-2xl font-extrabold text-indigo-950 mt-1.5" id="todays-hijri-date">
                        {getHijriFormatted()}
                      </span>
                    </div>
                    <span className="text-xs text-indigo-700/80 font-bold font-arabic mt-2 block leading-relaxed" dir="rtl">
                      {getHijriArabicFormatted()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-150 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600 animate-pulse-slow" />
                <p className="text-[11px] text-slate-400 font-medium">
                  Dynamic coordinate alignment powered by client-side browser calculations.
                </p>
              </div>
            </div>

            {/* Dynamic Integrated Moon Phase (lunar illumination corresponding specifically to today's day) */}
            {todayHijri && (
              <LunarPhaseDisplay
                hijriDay={todayHijri.day}
                hijriMonthName={HIJRI_MONTHS[todayHijri.month - 1]?.name || ''}
              />
            )}
          </div>
        </section>

        {/* CALENDAR METHOD SELECTOR */}
        <section className="mb-10" id="calendar-selector-section">
          <CalendarSelector selectedType={calendarType} onChange={setCalendarType} hijriOffset={hijriOffset} onHijriOffsetChange={setHijriOffset} />
        </section>

        {/* SYNCHRONIZED CALENDAR MONTHLY GRID */}
        <DualCalendar calendarType={calendarType} hijriOffset={hijriOffset} />

        {/* CELESTIAL COUNTDOWN & SACRED MILESTONES */}
        <IslamicEventsCountdown calendarType={calendarType} hijriOffset={hijriOffset} today={today} />

        {/* CORE WORKSPACE GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="core-interactive-workspace">
          {/* Age Calculator module */}
          <AgeCalculator calendarType={calendarType} hijriOffset={hijriOffset} />

          {/* Date Converter module */}
          <DateConverter calendarType={calendarType} hijriOffset={hijriOffset} />
        </section>

        {/* EDUCATIONAL GLOSSARY FOOTER */}
        <EducationalInfo />
      </main>

      {/* FOOTER ACCENTS */}
      <footer className="py-12 border-t border-slate-200 mt-16 bg-white flex flex-col items-center text-center px-4">
        <div className="w-6 h-6 border-l-2 border-t-2 border-indigo-600 transform rotate-45 mb-4"></div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
          Ref: Umm al-Qura & Classical Tabular Islamic Systems
        </p>
        <p className="text-[10px] text-slate-400 mt-2 font-mono">
          Developed by Zumaidi Zainuddin (https://zoomyd.xyz/mukmin/) 
        </p>
      </footer>
    </div>
  );
}
