import React, { useState, useEffect } from 'react';
import { CalendarType, HijriDate } from '../types';
import {
  getHijriDateFromGregorian,
  getLunarPhaseInfo,
  HIJRI_MONTHS,
  GREGORIAN_MONTHS,
  hijriToGregorian,
  getDaysInHijriMonth,
} from '../utils/calendarUtils';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Info,
  Compass,
  LayoutGrid,
  Trophy,
  ArrowRight
} from 'lucide-react';

interface DualCalendarProps {
  calendarType: CalendarType;
  hijriOffset?: number;
}

export default function DualCalendar({ calendarType, hijriOffset = 0 }: DualCalendarProps) {
  const today = new Date();
  
  // Selection mode for primary calendar display
  const [mainDisplay, setMainDisplay] = useState<'gregorian' | 'hijri'>('gregorian');

  // Gregorian navigation states
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-indexed

  // Hijri navigation states (initialized correctly using offset and type)
  const initialTodayHijri = getHijriDateFromGregorian(today, calendarType, hijriOffset);
  const [currentHijriYear, setCurrentHijriYear] = useState<number>(initialTodayHijri.year);
  const [currentHijriMonth, setCurrentHijriMonth] = useState<number>(initialTodayHijri.month);

  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(0);

  // Layout configuration setting: Align to standard weekdays OR start dynamically at the 1st day of the month sequentially
  const [gridStartsOnFirst, setGridStartsOnFirst] = useState<boolean>(false);
  const isFirstDayStart = gridStartsOnFirst;

  // Synchronize Gregorian to Hijri bidirectionally when mainDisplay is gregorian
  useEffect(() => {
    if (mainDisplay === 'gregorian') {
      const isTodayMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1;
      const refDay = isTodayMonth ? today.getDate() : 15;
      const refDate = new Date(currentYear, currentMonth - 1, refDay, 12, 0, 0);
      const hDate = getHijriDateFromGregorian(refDate, calendarType, hijriOffset);
      if (hDate.month !== currentHijriMonth || hDate.year !== currentHijriYear) {
        setCurrentHijriMonth(hDate.month);
        setCurrentHijriYear(hDate.year);
      }
    }
  }, [currentYear, currentMonth, mainDisplay, calendarType, hijriOffset]);

  // Synchronize Hijri to Gregorian bidirectionally when mainDisplay is hijri
  useEffect(() => {
    if (mainDisplay === 'hijri') {
      const gDate = hijriToGregorian(currentHijriYear, currentHijriMonth, 1, calendarType, hijriOffset);
      const gMonth = gDate.getMonth() + 1;
      const gYear = gDate.getFullYear();
      if (gMonth !== currentMonth || gYear !== currentYear) {
        setCurrentMonth(gMonth);
        setCurrentYear(gYear);
      }
    }
  }, [currentHijriYear, currentHijriMonth, mainDisplay, calendarType, hijriOffset]);

  // Helper for solar days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // Resolve grid dimensions and properties driven by Main Display setting
  let daysInPeriod = 0;
  let firstDayOfWeekIndex = 0;
  const gridCells: { isPadding: boolean; date: Date | null; rawDayNumber: number }[] = [];

  if (mainDisplay === 'gregorian') {
    daysInPeriod = getDaysInMonth(currentYear, currentMonth);
    firstDayOfWeekIndex = getFirstDayOfWeek(currentYear, currentMonth);

    // Padding for starting offset cells
    if (!isFirstDayStart) {
      for (let i = 0; i < firstDayOfWeekIndex; i++) {
        gridCells.push({ isPadding: true, date: null, rawDayNumber: 0 });
      }
    }
    // Standard days insertion
    for (let d = 1; d <= daysInPeriod; d++) {
      const dateObj = new Date(currentYear, currentMonth - 1, d, 12, 0, 0);
      gridCells.push({
        isPadding: false,
        date: dateObj,
        rawDayNumber: d,
      });
    }
  } else {
    // Hijri Month Calculation - loop over lunar month days
    daysInPeriod = getDaysInHijriMonth(currentHijriYear, currentHijriMonth, calendarType, hijriOffset);
    const firstDayDateObj = hijriToGregorian(currentHijriYear, currentHijriMonth, 1, calendarType, hijriOffset);
    firstDayOfWeekIndex = firstDayDateObj.getDay();

    // Padding for starting offset cells based on Hijri day 1 weekday
    if (!isFirstDayStart) {
      for (let i = 0; i < firstDayOfWeekIndex; i++) {
        gridCells.push({ isPadding: true, date: null, rawDayNumber: 0 });
      }
    }
    // Standard days insertion with exact physical corresponding dates
    for (let hDay = 1; hDay <= daysInPeriod; hDay++) {
      const dateObj = hijriToGregorian(currentHijriYear, currentHijriMonth, hDay, calendarType, hijriOffset);
      gridCells.push({
        isPadding: false,
        date: dateObj,
        rawDayNumber: hDay,
      });
    }
  }

  // Segment grid into 7-day rows (weeks)
  const weeks: { isPadding: boolean; date: Date | null; rawDayNumber: number }[][] = [];
  for (let i = 0; i < gridCells.length; i += 7) {
    weeks.push(gridCells.slice(i, i + 7));
  }

  const currentWeekDays = weeks[activeWeekIndex] || weeks[0] || [];

  // Continuous scrolls through weeks
  const handlePrevWeek = () => {
    if (activeWeekIndex === 0) {
      if (mainDisplay === 'gregorian') {
        let prevMonthIndex = currentMonth - 1;
        let prevYearIndex = currentYear;
        if (prevMonthIndex === 0) {
          prevMonthIndex = 12;
          prevYearIndex -= 1;
        }
        const prevMonthDays = getDaysInMonth(prevYearIndex, prevMonthIndex);
        const prevFirstDayOfWeek = getFirstDayOfWeek(prevYearIndex, prevMonthIndex);
        const totalCells = (isFirstDayStart ? 0 : prevFirstDayOfWeek) + prevMonthDays;
        const prevWeeksCount = Math.ceil(totalCells / 7);

        setCurrentMonth(prevMonthIndex);
        setCurrentYear(prevYearIndex);
        setActiveWeekIndex(prevWeeksCount - 1);
      } else {
        let prevMonthIndex = currentHijriMonth - 1;
        let prevYearIndex = currentHijriYear;
        if (prevMonthIndex === 0) {
          prevMonthIndex = 12;
          prevYearIndex -= 1;
        }
        const prevMonthDays = getDaysInHijriMonth(prevYearIndex, prevMonthIndex, calendarType, hijriOffset);
        const firstDayDateOfPrev = hijriToGregorian(prevYearIndex, prevMonthIndex, 1, calendarType, hijriOffset);
        const prevFirstDayOfWeek = firstDayDateOfPrev.getDay();
        const totalCells = (isFirstDayStart ? 0 : prevFirstDayOfWeek) + prevMonthDays;
        const prevWeeksCount = Math.ceil(totalCells / 7);

        setCurrentHijriMonth(prevMonthIndex);
        setCurrentHijriYear(prevYearIndex);
        setActiveWeekIndex(prevWeeksCount - 1);
      }
    } else {
      setActiveWeekIndex((prev) => prev - 1);
    }
  };

  const handleNextWeek = () => {
    const totalWeeks = weeks.length;
    if (activeWeekIndex === totalWeeks - 1) {
      if (mainDisplay === 'gregorian') {
        if (currentMonth === 12) {
          setCurrentMonth(1);
          setCurrentYear((prev) => prev + 1);
        } else {
          setCurrentMonth((prev) => prev + 1);
        }
        setActiveWeekIndex(0);
      } else {
        let nextMonthIndex = currentHijriMonth + 1;
        let nextYearIndex = currentHijriYear;
        if (nextMonthIndex === 13) {
          nextMonthIndex = 1;
          nextYearIndex += 1;
        }
        setCurrentHijriMonth(nextMonthIndex);
        setCurrentHijriYear(nextYearIndex);
        setActiveWeekIndex(0);
      }
    } else {
      setActiveWeekIndex((prev) => prev + 1);
    }
  };

  // Handle standard month shifts
  const handlePrevMonth = () => {
    if (mainDisplay === 'gregorian') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentHijriMonth === 1) {
        setCurrentHijriMonth(12);
        setCurrentHijriYear((prev) => prev - 1);
      } else {
        setCurrentHijriMonth((prev) => prev - 1);
      }
    }
    setActiveWeekIndex(0);
  };

  const handleNextMonth = () => {
    if (mainDisplay === 'gregorian') {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    } else {
      if (currentHijriMonth === 12) {
        setCurrentHijriMonth(1);
        setCurrentHijriYear((prev) => prev + 1);
      } else {
        setCurrentHijriMonth((prev) => prev + 1);
      }
    }
    setActiveWeekIndex(0);
  };

  const handleResetToToday = () => {
    const todayObj = new Date();
    setCurrentYear(todayObj.getFullYear());
    setCurrentMonth(todayObj.getMonth() + 1);
    
    const hToday = getHijriDateFromGregorian(todayObj, calendarType, hijriOffset);
    setCurrentHijriYear(hToday.year);
    setCurrentHijriMonth(hToday.month);
    
    // Locate which week today belongs to
    if (mainDisplay === 'gregorian') {
      const padding = getFirstDayOfWeek(todayObj.getFullYear(), todayObj.getMonth() + 1);
      const dayVal = todayObj.getDate();
      const cellIdx = (isFirstDayStart ? 0 : padding) + dayVal - 1;
      setActiveWeekIndex(Math.floor(cellIdx / 7));
    } else {
      const hDaysCount = getDaysInHijriMonth(hToday.year, hToday.month, calendarType, hijriOffset);
      const firstDayDate = hijriToGregorian(hToday.year, hToday.month, 1, calendarType, hijriOffset);
      const padding = firstDayDate.getDay();
      const cellIdx = (isFirstDayStart ? 0 : padding) + hToday.day - 1;
      setActiveWeekIndex(Math.floor(cellIdx / 7));
    }
  };

  // Generate lists for select dropdowns
  const yearsRange = Array.from({ length: 151 }, (_, i) => 1930 + i); // 1930 to 2080
  const hijriYearsRange = Array.from({ length: 151 }, (_, i) => 1350 + i); // 1350 to 1500

  // Calculate coordinates and metrics for the telemetry pane and header
  let firstDayDateObj: Date;
  let lastDayDateObj: Date;
  let firstHijri: HijriDate;
  let lastHijri: HijriDate;
  let monthSpanText = '';

  if (mainDisplay === 'gregorian') {
    firstDayDateObj = new Date(currentYear, currentMonth - 1, 1, 12, 0, 0);
    lastDayDateObj = new Date(currentYear, currentMonth - 1, daysInPeriod, 12, 0, 0);

    firstHijri = getHijriDateFromGregorian(firstDayDateObj, calendarType, hijriOffset);
    lastHijri = getHijriDateFromGregorian(lastDayDateObj, calendarType, hijriOffset);

    const firstHijriMonthName = HIJRI_MONTHS[firstHijri.month - 1]?.name || '';
    const lastHijriMonthName = HIJRI_MONTHS[lastHijri.month - 1]?.name || '';
    monthSpanText =
      firstHijri.month === lastHijri.month
        ? `${firstHijriMonthName} ${firstHijri.year} AH`
        : `${firstHijriMonthName} AH ➔ ${lastHijriMonthName} ${lastHijri.year} AH`;
  } else {
    firstDayDateObj = hijriToGregorian(currentHijriYear, currentHijriMonth, 1, calendarType, hijriOffset);
    lastDayDateObj = hijriToGregorian(currentHijriYear, currentHijriMonth, daysInPeriod, calendarType, hijriOffset);

    firstHijri = { year: currentHijriYear, month: currentHijriMonth, day: 1 };
    lastHijri = { year: currentHijriYear, month: currentHijriMonth, day: daysInPeriod };

    const firstGregMonth = GREGORIAN_MONTHS[firstDayDateObj.getMonth()]?.name || '';
    const lastGregMonth = GREGORIAN_MONTHS[lastDayDateObj.getMonth()]?.name || '';
    monthSpanText =
      firstDayDateObj.getMonth() === lastDayDateObj.getMonth()
        ? `${firstGregMonth} ${firstDayDateObj.getFullYear()}`
        : `${firstGregMonth} ➔ ${lastGregMonth} ${lastDayDateObj.getFullYear()}`;
  }

  // Count moon phase matches inside the period
  let fullMoonsCount = 0;
  let newMoonsCount = 0;

  for (let d = 1; d <= daysInPeriod; d++) {
    const hDay = mainDisplay === 'gregorian'
      ? getHijriDateFromGregorian(new Date(currentYear, currentMonth - 1, d, 12, 0, 0), calendarType, hijriOffset).day
      : d;
    if (hDay === 1 || hDay === 30) newMoonsCount++;
    if (hDay === 14 || hDay === 15) fullMoonsCount++;
  }

  // Moon Phase representation
  const getMoonEmoji = (hijriDay: number) => {
    const phase = getLunarPhaseInfo(hijriDay);
    switch (phase.iconType) {
      case 'new':
        return '🌑';
      case 'wax_crescent':
        return '🌒';
      case 'first_quarter':
        return '🌓';
      case 'wax_gibbous':
        return '🌔';
      case 'full':
        return '🌕';
      case 'wan_gibbous':
        return '🌖';
      case 'third_quarter':
        return '🌗';
      case 'wan_crescent':
        return '🌘';
      default:
        return '🌙';
    }
  };

  return (
    <div
      id="dual-calendar-workspace"
      className="bg-white rounded-xs border border-slate-200 shadow-xs p-6 mb-10 transition-all duration-300"
    >
      {/* HEADER CONTROLS DESK */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="p-2 bg-indigo-550/10 rounded-xs text-indigo-600">
            <LayoutGrid className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
              Solar & Lunar Synchronized Grid
            </h2>
            <p className="text-xs text-slate-500">
              Spatially map Hijri and Gregorian coordinates across custom temporal slices
            </p>
          </div>
        </div>

        {/* CONTROLS CHASSIS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Display Calendar Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              Main Display:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xs border border-slate-200">
              {(['gregorian', 'hijri'] as const).map((type) => (
                <button
                  key={type}
                  id={`main-display-btn-${type}`}
                  onClick={() => {
                    setMainDisplay(type);
                    setActiveWeekIndex(0);
                  }}
                  className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer ${
                    mainDisplay === type
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          {/* View Mode Selectors */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xs border border-slate-200">
            {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
              <button
                key={mode}
                id={`view-mode-btn-${mode}`}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />

          {/* Grid Layout Alignment Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              Grid Start:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xs border border-slate-200">
              <button
                id="grid-start-std-btn"
                onClick={() => setGridStartsOnFirst(false)}
                className={`px-2.5 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer ${
                  !gridStartsOnFirst
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Weekday
              </button>
              <button
                id="grid-start-first-btn"
                onClick={() => setGridStartsOnFirst(true)}
                className={`px-2.5 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer ${
                  gridStartsOnFirst
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title="Force grid of month to start on the 1st day of the month sequentially"
              >
                Day 1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC TIMELINE SHIFT CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-slate-50 p-4 rounded-xs border border-slate-200">
        <div>
          {viewMode === 'monthly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                {mainDisplay === 'gregorian'
                  ? `${GREGORIAN_MONTHS[currentMonth - 1]?.name} ${currentYear}`
                  : `${HIJRI_MONTHS[currentHijriMonth - 1]?.name} ${currentHijriYear} AH`}
              </span>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-750 px-2.5 py-0.5 rounded-xs font-mono font-bold">
                {monthSpanText}
              </span>
            </div>
          )}
          {viewMode === 'weekly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                WEEK {activeWeekIndex + 1} &bull; {mainDisplay === 'gregorian'
                  ? `${GREGORIAN_MONTHS[currentMonth - 1]?.name} ${currentYear}`
                  : `${HIJRI_MONTHS[currentHijriMonth - 1]?.name} ${currentHijriYear} AH`}
              </span>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-750 px-2.5 py-0.5 rounded-xs font-mono font-bold">
                {currentWeekDays.filter(c => !c.isPadding).length} Synced Day Cards
              </span>
            </div>
          )}
          {viewMode === 'yearly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                {mainDisplay === 'gregorian'
                  ? `CALENDAR YEAR: GREGORIAN ${currentYear} / HIJRI ${firstHijri.year} AH`
                  : `LUNAR CALENDAR YEAR: HIJRI ${currentHijriYear} AH / GREGORIAN ${firstDayDateObj.getFullYear()}`}
              </span>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-750 px-2.5 py-0.5 rounded-xs font-mono font-bold">
                12-Month Map
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {viewMode === 'weekly' ? (
            <button
              id="prev-week-btn"
              onClick={handlePrevWeek}
              className="p-2 border border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xs transition-all cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4 font-bold" />
            </button>
          ) : viewMode === 'monthly' ? (
            <button
              id="prev-month-btn"
              onClick={handlePrevMonth}
              className="p-2 border border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xs transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4 font-bold" />
            </button>
          ) : (
            <button
              id="prev-year-btn"
              onClick={() => {
                if (mainDisplay === 'gregorian') {
                  setCurrentYear((prev) => prev - 1);
                } else {
                  setCurrentHijriYear((prev) => prev - 1);
                }
              }}
              className="p-2 border border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xs transition-all cursor-pointer"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4 font-bold" />
            </button>
          )}

          {/* Fallback month selectors */}
          {viewMode !== 'yearly' && (
            <select
              id="month-select"
              value={mainDisplay === 'gregorian' ? currentMonth : currentHijriMonth}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (mainDisplay === 'gregorian') {
                  setCurrentMonth(val);
                } else {
                  setCurrentHijriMonth(val);
                }
                setActiveWeekIndex(0);
              }}
              className="px-2 py-1.5 bg-white border border-slate-250 rounded-xs text-[11px] font-black uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-550 cursor-pointer text-slate-800"
            >
              {(mainDisplay === 'gregorian' ? GREGORIAN_MONTHS : HIJRI_MONTHS).map((m) => {
                return (
                  <option key={m.index} value={m.index}>
                    {m.name.toUpperCase()}
                  </option>
                );
              })}
            </select>
          )}

          {/* Year option selector */}
          <select
            id="year-select"
            value={mainDisplay === 'gregorian' ? currentYear : currentHijriYear}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (mainDisplay === 'gregorian') {
                setCurrentYear(val);
              } else {
                setCurrentHijriYear(val);
              }
              setActiveWeekIndex(0);
            }}
            className="px-2.5 py-1.5 bg-white border border-slate-255 rounded-xs text-[11px] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
          >
            {(mainDisplay === 'gregorian' ? yearsRange : hijriYearsRange).map((yr) => (
              <option key={yr} value={yr}>
                {yr} {mainDisplay === 'hijri' ? 'AH' : ''}
              </option>
            ))}
          </select>

          {viewMode === 'weekly' ? (
            <button
              id="next-week-btn"
              onClick={handleNextWeek}
              className="p-2 border border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xs transition-all cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4 font-bold" />
            </button>
          ) : viewMode === 'monthly' ? (
            <button
              id="next-month-btn"
              onClick={handleNextMonth}
              className="p-2 border border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xs transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4 font-bold" />
            </button>
          ) : (
            <button
              id="next-year-btn"
              onClick={() => {
                if (mainDisplay === 'gregorian') {
                  setCurrentYear((prev) => prev + 1);
                } else {
                  setCurrentHijriYear((prev) => prev + 1);
                }
              }}
              className="p-2 border border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xs transition-all cursor-pointer"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4 font-bold" />
            </button>
          )}

          <button
            id="reset-today-btn"
            onClick={handleResetToToday}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-indigo-650 text-white text-[9px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer"
            title="Snap back to today"
          >
            TODAY
          </button>
        </div>
      </div>

      {/* CORE RENDER DECISION TREE */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-6" id="weekly-view-grid">
          {currentWeekDays.map((cell, idx) => {
            if (cell.isPadding || !cell.date) {
              return (
                <div
                  key={`week-pad-${idx}`}
                  className="hidden md:flex aspect-square min-h-[140px] bg-slate-50/15 border border-dashed border-slate-200 rounded-xs items-center justify-center text-[10px] text-slate-300 font-mono"
                >
                  PAD
                </div>
              );
            }

            const dObj = cell.date;
            const hDate = mainDisplay === 'hijri'
              ? { year: currentHijriYear, month: currentHijriMonth, day: cell.rawDayNumber }
              : getHijriDateFromGregorian(dObj, calendarType, hijriOffset);
            
            const isToday =
              today.getDate() === dObj.getDate() &&
              today.getMonth() === dObj.getMonth() &&
              today.getFullYear() === dObj.getFullYear();

            const isFullMoon = hDate.day === 14 || hDate.day === 15;
            const isNewMoon = hDate.day === 1;
            const isWhiteNights = hDate.day === 13 || hDate.day === 14 || hDate.day === 15;

            const moonEmoji = getMoonEmoji(hDate.day);
            const phaseInfo = getLunarPhaseInfo(hDate.day);
            
            const gregDay = dObj.getDate();
            const gregMonthObj = GREGORIAN_MONTHS[dObj.getMonth()];
            const hijriMonthObj = HIJRI_MONTHS[hDate.month - 1];
            const weekdayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div
                key={`week-day-${idx}`}
                className={`p-4 flex flex-col justify-between border rounded-xs transition-all relative min-h-[160px] ${
                  isToday
                    ? 'border-indigo-600 bg-indigo-50/15 ring-1 ring-indigo-600/25 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-indigo-600 font-mono">
                      {weekdayName.toUpperCase()}
                    </span>
                    <span className="block text-2xl font-black font-mono mt-1 text-slate-900">
                      {mainDisplay === 'gregorian' ? gregDay : hDate.day}
                    </span>
                  </div>
                  {isToday && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                    </span>
                  )}
                </div>

                <div className="my-5 flex flex-col items-center">
                  <span className="text-3xl filter drop-shadow-xs transition-transform hover:scale-115 cursor-default select-none">
                    {moonEmoji}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 mt-2 text-center uppercase tracking-tight">
                    {phaseInfo.phaseName}
                  </span>
                </div>

                {/* Show both dates on weekly cards */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-0.5">
                  {mainDisplay === 'gregorian' ? (
                    <>
                      <span className="text-[11px] font-extrabold text-slate-800">
                        H. Day {hDate.day}
                      </span>
                      <span className="text-[9px] text-indigo-805 font-black uppercase tracking-wider truncate" title={hijriMonthObj?.name}>
                        {hijriMonthObj?.name}
                      </span>
                      <span className="text-[8px] font-light text-slate-400 mt-1 uppercase" dir="rtl">
                        {hijriMonthObj?.arabicName || ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-extrabold text-slate-800">
                        G. Day {gregDay}
                      </span>
                      <span className="text-[9px] text-indigo-850 font-black uppercase tracking-wider truncate" title={gregMonthObj?.name}>
                        {gregMonthObj?.name}
                      </span>
                      <span className="text-[8px] font-light text-slate-400 mt-1 uppercase">
                        {dObj.getFullYear()} CE
                      </span>
                    </>
                  )}
                </div>

                {/* Badges */}
                {isWhiteNights && (
                  <span className="absolute top-2 right-2 text-[8px] bg-amber-500/10 text-amber-700 px-1 py-0.2 rounded-xs font-bold leading-normal truncate" title="Ayyam al-Bidh (White Nights)">
                    🌕 Bidh
                  </span>
                )}
                {isNewMoon && (
                  <span className="absolute top-2 right-2 text-[8px] bg-indigo-550/10 text-indigo-700 px-1 py-0.2 rounded-xs font-bold leading-normal truncate" title="Hilal Crescent aligned">
                    🌙 Hilal
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'monthly' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6" id="monthly-view-grid">
          {/* CALENDAR ROW GRID */}
          <div className="xl:col-span-3">
            {/* Calendar Weekday titles */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center mb-2">
              {(isFirstDayStart
                ? [...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].slice(firstDayOfWeekIndex), ...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].slice(0, firstDayOfWeekIndex)]
                : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
              ).map((day) => (
                <div
                  key={day}
                  className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar dynamic coordinates cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {gridCells.map((cell, idx) => {
                if (cell.isPadding || !cell.date) {
                  return (
                    <div
                      key={`pad-${idx}`}
                      className="aspect-square min-h-[55px] sm:min-h-[80px] bg-slate-50/30 border border-slate-100/50 rounded-xs opacity-40"
                    />
                  );
                }

                const dObj = cell.date;
                const hDate = mainDisplay === 'hijri'
                  ? { year: currentHijriYear, month: currentHijriMonth, day: cell.rawDayNumber }
                  : getHijriDateFromGregorian(dObj, calendarType, hijriOffset);
                
                const isToday =
                  today.getDate() === dObj.getDate() &&
                  today.getMonth() === dObj.getMonth() &&
                  today.getFullYear() === dObj.getFullYear();

                const isFullMoon = hDate.day === 14 || hDate.day === 15;
                const isNewMoon = hDate.day === 1;

                const moonEmoji = getMoonEmoji(hDate.day);
                const hijriMonthObj = HIJRI_MONTHS[hDate.month - 1];
                const gregDay = dObj.getDate();
                const gregMonthObj = GREGORIAN_MONTHS[dObj.getMonth()];

                return (
                  <div
                    key={`day-${idx}`}
                    className={`relative p-1.5 sm:p-2.5 min-h-[60px] sm:min-h-[85px] aspect-square flex flex-col justify-between border rounded-xs transition-colors hover:bg-slate-50 ${
                      isToday
                        ? 'border-indigo-600 bg-indigo-50/15 ring-1 ring-indigo-600/25'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Top line: primary day number & today dot indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-semibold font-mono ${
                          isToday ? 'text-indigo-600 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {mainDisplay === 'gregorian' ? gregDay : hDate.day}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
                      )}
                    </div>

                    {/* Middle representation: lunar moon emoji & indicator */}
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <div className="flex flex-col text-[10px] leading-tight">
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold font-mono tracking-tighter ${
                            isToday ? 'text-indigo-805 font-black' : 'text-slate-500'
                          }`}
                        >
                          {mainDisplay === 'gregorian' ? `H.${hDate.day}` : `G.${gregDay}`}
                        </span>
                        
                        {/* Show abbreviated auxiliary month context on day 1 or grid row start */}
                        {mainDisplay === 'gregorian' ? (
                          (hDate.day === 1 || gregDay === 1) && (
                            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-indigo-600 font-sans truncate max-w-[40px] sm:max-w-[60px]" title={hijriMonthObj?.name}>
                              {hijriMonthObj?.name.substring(0, 4)}.
                            </span>
                          )
                        ) : (
                          (hDate.day === 1 || gregDay === 1) && (
                            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-emerald-605 font-sans truncate max-w-[40px] sm:max-w-[60px]" title={gregMonthObj?.name}>
                              {gregMonthObj?.name.substring(0, 4)}.
                            </span>
                          )
                        )}
                      </div>

                      {/* Moon Icon / Emoji */}
                      <span
                        className="text-xs sm:text-base cursor-default select-none transition-transform hover:scale-125"
                        title={`${hijriMonthObj?.name} ${hDate.day} AH / ${gregMonthObj?.name} ${gregDay}`}
                      >
                        {moonEmoji}
                      </span>
                    </div>

                    {/* Lunar Events Glow Indicator */}
                    {isFullMoon && (
                      <div className="absolute top-1 right-1 w-1 h-1 bg-amber-500 rounded-full animate-pulse" title="Badr (Full Moon) Alignment" />
                    )}
                    {isNewMoon && (
                      <div className="absolute top-1 right-1 w-1 h-1 bg-indigo-650 rounded-full animate-pulse" title="Hilal (New Moon) Alignment" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDE DATA METRICS PANEL CHASSIS */}
          <div className="xl:col-span-1 bg-slate-550/5 p-5 rounded-xs border border-slate-200/80 flex flex-col justify-between font-sans">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 block mb-2">
                Grid Telemetry
              </span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-snug mb-3">
                {mainDisplay === 'gregorian'
                  ? `${GREGORIAN_MONTHS[currentMonth - 1]?.name} ${currentYear}`
                  : `${HIJRI_MONTHS[currentHijriMonth - 1]?.name} ${currentHijriYear} AH`}{' '}
                Overview
              </h3>

              {/* Metrics Checklist */}
              <div className="space-y-3.5 mt-5">
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      {mainDisplay === 'gregorian' ? 'Hijri Spanning Interval' : 'CE Spanning Interval'}
                    </span>
                    <span className="text-xs font-semibold text-slate-750 leading-tight block mt-0.5 font-mono">
                      {monthSpanText}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Lunar Cycles
                    </span>
                    <span className="text-xs font-semibold text-slate-700 block mt-0.5 font-mono">
                      {fullMoonsCount} Full (Badr) &bull; {newMoonsCount} New (Hilal)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Sub-Engine Algorithm
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-700 block mt-0.5">
                      {calendarType === 'islamic-umalqura'
                        ? 'Umm al-Qura (KSA)'
                        : calendarType === 'islamic-civil'
                        ? 'Islamic Civil Tabular'
                        : 'Classic astronomical'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Trophy className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Hilal correction
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 font-mono block mt-0.5">
                      {hijriOffset === 0 ? '±0 Days (Standard)' : `${hijriOffset > 0 ? '+' : ''}${hijriOffset} d Correction`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 pt-4 border-t border-slate-200 bg-white p-3 rounded-xs border border-dashed border-slate-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] leading-relaxed text-slate-500">
                    Switch the <strong className="text-indigo-600">Main Display</strong> to instantly restructure the grid, coordinate layout, and navigation driven dynamically by solar or lunar cycle boundaries.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center xl:text-left">
              <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider">
                SYNCHRONIZED CORE &bull; V2.5
              </span>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'yearly' && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4" id="yearly-view-panel">
          {Array.from({ length: 12 }, (_, monthIdx) => {
            const mNum = monthIdx + 1;
            
            if (mainDisplay === 'gregorian') {
              const mName = GREGORIAN_MONTHS[monthIdx]?.name || '';
              const mDaysCount = getDaysInMonth(currentYear, mNum);
              const mFirstDay = getFirstDayOfWeek(currentYear, mNum);

              const cells = [];
              for (let i = 0; i < mFirstDay; i++) {
                cells.push(null);
              }
              for (let d = 1; d <= mDaysCount; d++) {
                cells.push(d);
              }

              // Evaluate spanned lunar months contextually
              const fmDate = new Date(currentYear, monthIdx, 1, 12, 0, 0);
              const lmDate = new Date(currentYear, monthIdx, mDaysCount, 12, 0, 0);
              const fmHijri = getHijriDateFromGregorian(fmDate, calendarType, hijriOffset);
              const lmHijri = getHijriDateFromGregorian(lmDate, calendarType, hijriOffset);
              const spanningText = fmHijri.month === lmHijri.month
                ? `${HIJRI_MONTHS[fmHijri.month - 1]?.name.substring(0, 4)}.`
                : `${HIJRI_MONTHS[fmHijri.month - 1]?.name.substring(0, 3)} - ${HIJRI_MONTHS[lmHijri.month - 1]?.name.substring(0, 3)}`;

              return (
                <div
                  key={`year-month-greg-${monthIdx}`}
                  onClick={() => {
                    setCurrentMonth(mNum);
                    setViewMode('monthly');
                    setActiveWeekIndex(0);
                  }}
                  className="bg-white border border-slate-200 hover:border-indigo-600 p-4 rounded-xs transition-colors cursor-pointer hover:shadow-xs flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {mName}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-xs uppercase tracking-tight">
                      {spanningText}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-[2px] text-center mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((ch, idx) => (
                      <div key={idx} className="text-[7px] font-black text-slate-300 font-mono">
                        {ch}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-[2px]">
                    {cells.map((day, idx) => {
                      if (day === null) {
                        return <div key={`tiny-pad-${idx}`} className="aspect-square bg-slate-50 opacity-20" />;
                      }

                      const tempD = new Date(currentYear, monthIdx, day, 12, 0, 0);
                      const isNow =
                        today.getDate() === day &&
                        today.getMonth() === monthIdx &&
                        today.getFullYear() === currentYear;

                      const tempH = getHijriDateFromGregorian(tempD, calendarType, hijriOffset);
                      const isFull = tempH.day === 14 || tempH.day === 15;
                      const isNew = tempH.day === 1;

                      return (
                        <div
                          key={`tiny-day-${day}`}
                          className={`aspect-square text-[7px] font-mono font-bold flex items-center justify-center rounded-[1px] ${
                            isNow
                              ? 'bg-indigo-650 text-white font-extrabold shadow-xs'
                              : isFull
                              ? 'bg-amber-100 text-amber-800'
                              : isNew
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-400'
                          }`}
                          title={`${mName} ${day} (H. ${tempH.day})`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Inspect Month</span>
                    <ArrowRight className="w-2.5 h-2.5 text-indigo-605" />
                  </div>
                </div>
              );
            } else {
              // HIJRI YEARLY DISPLAY MODE
              const mName = HIJRI_MONTHS[monthIdx]?.name || '';
              const mArabic = HIJRI_MONTHS[monthIdx]?.arabicName || '';
              const mDaysCount = getDaysInHijriMonth(currentHijriYear, mNum, calendarType, hijriOffset);
              const firstDayDateOfM = hijriToGregorian(currentHijriYear, mNum, 1, calendarType, hijriOffset);
              const mFirstDay = firstDayDateOfM.getDay();

              const cells = [];
              for (let i = 0; i < mFirstDay; i++) {
                cells.push(null);
              }
              for (let d = 1; d <= mDaysCount; d++) {
                cells.push(d);
              }

              // Est Gregorian months spanned by that Hijri month
              const lmDate = hijriToGregorian(currentHijriYear, mNum, mDaysCount, calendarType, hijriOffset);
              const fGregMonth = GREGORIAN_MONTHS[firstDayDateOfM.getMonth()]?.name.substring(0, 3);
              const lGregMonth = GREGORIAN_MONTHS[lmDate.getMonth()]?.name.substring(0, 3);
              const spanningText = firstDayDateOfM.getMonth() === lmDate.getMonth()
                ? `${fGregMonth}.`
                : `${fGregMonth} - ${lGregMonth}`;

              return (
                <div
                  key={`year-month-hijri-${monthIdx}`}
                  onClick={() => {
                    setCurrentHijriMonth(mNum);
                    setViewMode('monthly');
                    setActiveWeekIndex(0);
                  }}
                  className="bg-white border border-slate-200 hover:border-indigo-600 p-4 rounded-xs transition-colors cursor-pointer hover:shadow-xs flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {mName}
                      </span>
                      <span className="text-[8px] font-light text-slate-400" dir="rtl">
                        {mArabic}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-xs uppercase tracking-tight">
                      {spanningText}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-[2px] text-center mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((ch, idx) => (
                      <div key={idx} className="text-[7px] font-black text-slate-305 font-mono">
                        {ch}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-[2px]">
                    {cells.map((day, idx) => {
                      if (day === null) {
                        return <div key={`tiny-pad-hijri-${idx}`} className="aspect-square bg-slate-50 opacity-20" />;
                      }

                      const tempD = hijriToGregorian(currentHijriYear, mNum, day, calendarType, hijriOffset);
                      const isNow =
                        today.getDate() === tempD.getDate() &&
                        today.getMonth() === tempD.getMonth() &&
                        today.getFullYear() === tempD.getFullYear();

                      const isFull = day === 14 || day === 15;
                      const isNew = day === 1;

                      return (
                        <div
                          key={`tiny-day-hijri-${day}`}
                          className={`aspect-square text-[7px] font-mono font-bold flex items-center justify-center rounded-[1px] ${
                            isNow
                              ? 'bg-indigo-650 text-white font-extrabold shadow-xs'
                              : isFull
                              ? 'bg-amber-100 text-amber-850'
                              : isNew
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-400'
                          }`}
                          title={`H. ${mName} ${day} / ${GREGORIAN_MONTHS[tempD.getMonth()]?.name} ${tempD.getDate()}`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Inspect Month</span>
                    <ArrowRight className="w-2.5 h-2.5 text-indigo-605" />
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
