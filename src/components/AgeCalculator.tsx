import React, { useState, useEffect } from 'react';
import { CalendarType, AgeResult, HijriDate } from '../types';
import {
  getHijriDateFromGregorian,
  hijriToGregorian,
  calculateGregorianAge,
  calculateHijriAge,
  getNextGregorianBirthday,
  getNextHijriBirthday,
  HIJRI_MONTHS,
  GREGORIAN_MONTHS,
  getDaysInHijriMonth
} from '../utils/calendarUtils';
import { Cake, Calendar, Timer, Sparkles, ArrowRightLeft, RefreshCw, CalendarDays, HelpCircle } from 'lucide-react';

interface AgeCalculatorProps {
  calendarType: CalendarType;
}

export default function AgeCalculator({ calendarType }: AgeCalculatorProps) {
  // Input mode: entering birthday in Gregorian ('g') or Hijri ('h')
  const [bdayInputMode, setBdayInputMode] = useState<'g' | 'h'>('g');

  // Today's date reference
  const [today] = useState<Date>(() => new Date());

  // Birthdate state
  const [gregorianBday, setGregorianBday] = useState<string>('1998-05-15');
  
  // Hijri birthdate input state (in case user enters it in Hijri)
  const [hijriBdayYear, setHijriBdayYear] = useState<number>(1419);
  const [hijriBdayMonth, setHijriBdayMonth] = useState<number>(1); // Muharram
  const [hijriBdayDay, setHijriBdayDay] = useState<number>(19);
  const [maxHijriBdayDays, setMaxHijriBdayDays] = useState<number>(30);

  // Resolved Birthdate as standard GS Date object
  const [resolvedBday, setResolvedBday] = useState<Date | null>(null);

  // Hijri representation of the birthdate
  const [resolvedHijriBday, setResolvedHijriBday] = useState<HijriDate | null>(null);

  // Calculated Age Results
  const [gregorianAge, setGregorianAge] = useState<AgeResult | null>(null);
  const [hijriAge, setHijriAge] = useState<AgeResult | null>(null);

  // Birthday Countdowns
  const [nextGregBday, setNextGregBday] = useState<{ date: Date, daysRemaining: number } | null>(null);
  const [nextHijriBday, setNextHijriBday] = useState<{ date: Date, daysRemaining: number, hijriDate: HijriDate } | null>(null);

  // 1) Solve Max Hijri Bday Days when Month/Year in Hijri input changes
  useEffect(() => {
    if (bdayInputMode === 'h') {
      const days = getDaysInHijriMonth(hijriBdayYear, hijriBdayMonth, calendarType);
      setMaxHijriBdayDays(days);
      if (hijriBdayDay > days) {
        setHijriBdayDay(days);
      }
    }
  }, [hijriBdayYear, hijriBdayMonth, calendarType, bdayInputMode]);

  // 2) Resolve the actual Date and convert back and forth depending on selected entry mode
  useEffect(() => {
    if (bdayInputMode === 'g') {
      const parts = gregorianBday.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const dateObj = new Date(year, month, day);
          setResolvedBday(dateObj);
          
          const hBirth = getHijriDateFromGregorian(dateObj, calendarType);
          setResolvedHijriBday(hBirth);
          
          // Keep Hijri input numbers synchronized for visual toggle consistency
          setHijriBdayYear(hBirth.year);
          setHijriBdayMonth(hBirth.month);
          setHijriBdayDay(hBirth.day);
        }
      }
    } else {
      // Hijri Input Mode
      const gDate = hijriToGregorian(hijriBdayYear, hijriBdayMonth, hijriBdayDay, calendarType);
      setResolvedBday(gDate);
      setResolvedHijriBday({ year: hijriBdayYear, month: hijriBdayMonth, day: hijriBdayDay });

      // Synchronize Gregorian input state
      const yyyy = gDate.getFullYear();
      const mm = String(gDate.getMonth() + 1).padStart(2, '0');
      const dd = String(gDate.getDate()).padStart(2, '0');
      setGregorianBday(`${yyyy}-${mm}-${dd}`);
    }
  }, [gregorianBday, hijriBdayYear, hijriBdayMonth, hijriBdayDay, bdayInputMode, calendarType]);

  // 3) Perform age and countdown computations whenever resolved birthday changes
  useEffect(() => {
    if (resolvedBday && today) {
      if (resolvedBday > today) {
        // Birthdate is in the future relative to today's date
        setGregorianAge(null);
        setHijriAge(null);
        setNextGregBday(null);
        setNextHijriBday(null);
        return;
      }
      
      const gAge = calculateGregorianAge(resolvedBday, today);
      const hAge = calculateHijriAge(resolvedBday, today, calendarType);
      
      setGregorianAge(gAge);
      setHijriAge(hAge);

      const nextG = getNextGregorianBirthday(resolvedBday, today);
      const nextH = getNextHijriBirthday(resolvedBday, today, calendarType);

      setNextGregBday(nextG);
      setNextHijriBday(nextH);
    }
  }, [resolvedBday, today, calendarType]);

  const handleInputModeToggle = () => {
    setBdayInputMode((prev) => (prev === 'g' ? 'h' : 'g'));
  };

  const getHijriMonthName = (month: number) => {
    return HIJRI_MONTHS[month - 1]?.name || '';
  };

  const getGregMonthName = (month: number) => {
    return GREGORIAN_MONTHS[month - 1]?.name || '';
  };

  // Difference calculation
  const getAgeDifferenceText = () => {
    if (!gregorianAge || !hijriAge) return '';
    const diffYears = hijriAge.years - gregorianAge.years;
    const diffMonths = hijriAge.months - gregorianAge.months;
    const diffDays = hijriAge.days - gregorianAge.days;
    
    if (diffYears === 0 && diffMonths === 0) {
      if (diffDays === 0) return 'Your age is identical in both calendars';
      return `Your lunar age is older by ${diffDays} days!`;
    }

    let text = `You are ${diffYears} ${diffYears === 1 ? 'year' : 'years'} older in the Hijri calendar!`;
    return text;
  };

  return (
    <div id="age-calculator-container" className="bg-white rounded-xs border border-slate-200 shadow-xs p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xs text-indigo-600">
            <Cake className="w-5 h-5 font-bold" id="age-calculator-icon" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Age Metrics Compare</h2>
            <p className="text-xs text-slate-500">Dual bio-metric solar and lunar telemetry tracking</p>
          </div>
        </div>

        <button
          id="toggle-birthdate-selector-btn"
          onClick={handleInputModeToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-200 animate-pulse-slow" />
          {bdayInputMode === 'g' ? 'Enter Birthdate in Hijri' : 'Enter Birthdate in Gregorian'}
        </button>
      </div>

      {/* BIRTHDATE INPUT SECTION */}
      <div className="bg-slate-50/55 rounded-xs p-5 border border-slate-200 mb-6 font-mono">
        {bdayInputMode === 'g' ? (
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Select Solar Birthdate (Gregorian)
            </label>
            <input
              id="birthdate-gregorian-picker"
              type="date"
              max={new Date().toISOString().split('T')[0]} // Cannot be in the future
              min="0622-07-16" // Post epoch
              value={gregorianBday}
              onChange={(e) => setGregorianBday(e.target.value)}
              className="w-full sm:max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-xs font-semibold shadow-xs font-mono"
            />
            {resolvedHijriBday && (
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5 font-sans font-light">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                Your birthdate corresponds to Hijri: <strong className="text-slate-700 font-semibold">{resolvedHijriBday.day} {getHijriMonthName(resolvedHijriBday.month)} {resolvedHijriBday.year} AH</strong>
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Select Lunar Birthdate (Hijri Calendar)
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 leading-none">
                  Hijri Year
                </label>
                <input
                  id="birthdate-hijri-year"
                  type="number"
                  min="1"
                  max="1650"
                  value={hijriBdayYear}
                  onChange={(e) => setHijriBdayYear(Math.max(1, parseInt(e.target.value, 10) || 1420))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-xs font-semibold shadow-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 leading-none">
                  Month
                </label>
                <select
                  id="birthdate-hijri-month"
                  value={hijriBdayMonth}
                  onChange={(e) => setBdayInputMode === 'h' ? setHijriBdayMonth(parseInt(e.target.value, 10)) : setHijriBdayMonth(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-xs font-semibold shadow-xs h-[34px] font-sans"
                >
                  {HIJRI_MONTHS.map((item) => (
                    <option key={item.index} value={item.index}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 leading-none">
                  Day <span className="text-slate-400 font-light text-[8px] font-sans">max {maxHijriBdayDays}</span>
                </label>
                <select
                  id="birthdate-hijri-day"
                  value={hijriBdayDay}
                  onChange={(e) => setHijriBdayDay(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-xs font-semibold shadow-xs h-[34px] font-sans"
                >
                  {Array.from({ length: maxHijriBdayDays }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {resolvedBday && (
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5 font-sans font-light">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                Corresponding Gregorian is: <strong className="text-slate-700 font-semibold">{resolvedBday.getDate()} {getGregMonthName(resolvedBday.getMonth() + 1)} {resolvedBday.getFullYear()}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {resolvedBday && resolvedBday > today ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 animate-bounce mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">Date occurs in the future!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">Biological age calculations cannot compute for dates occurring after today.</p>
        </div>
      ) : gregorianAge && hijriAge ? (
        /* COMPARATIVE VIEW GRID */
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GREGORIAN SOLAR AGE CARD */}
            <div className="bg-white border border-slate-200 border-l-4 border-l-slate-800 p-5 flex flex-col rounded-xs relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">Gregorian Age</h3>
                <span className="text-[9px] bg-slate-100 px-2 py-0.5 font-mono font-bold uppercase tracking-wider text-slate-500 rounded-xs border border-slate-200">Solar-Based</span>
              </div>
              <div>
                <div className="text-5xl sm:text-6xl font-light tracking-tighter text-slate-900 font-mono">
                  {gregorianAge.years}<span className="text-xl font-normal text-slate-400 ml-1.5">Yrs</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Months</div>
                    <div className="text-lg font-mono font-bold text-slate-800">{String(gregorianAge.months).padStart(2, '0')}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Days</div>
                    <div className="text-lg font-mono font-bold text-slate-800">{String(gregorianAge.days).padStart(2, '0')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* HIJRI LUNAR AGE CARD */}
            <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-600 p-5 flex flex-col rounded-xs relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 font-sans">Hijriah Age</h3>
                <span className="text-[9px] bg-indigo-50 px-2 py-0.5 font-mono font-bold uppercase tracking-wider text-indigo-700 rounded-xs border border-indigo-100">Lunar-Based</span>
              </div>
              <div>
                <div className="text-5xl sm:text-6xl font-light tracking-tighter text-slate-900 font-mono">
                  {hijriAge.years}<span className="text-xl font-normal text-slate-400 ml-1.5">Yrs</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[9px] text-indigo-400 uppercase font-black tracking-wider leading-none">Months</div>
                    <div className="text-lg font-mono font-bold text-indigo-600">{String(hijriAge.months).padStart(2, '0')}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-indigo-400 uppercase font-black tracking-wider leading-none">Days</div>
                    <div className="text-lg font-mono font-bold text-indigo-600">{String(hijriAge.days).padStart(2, '0')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DRIFT EXPLANATOR INFOBAR */}
          <div className="bg-indigo-50/60 rounded-xs border border-indigo-100/80 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  {getAgeDifferenceText()}
                </p>
                <p className="text-[11px] text-indigo-805 mt-1 leading-relaxed font-light">
                  Because the lunar Hijri year accumulates roughly <strong className="text-indigo-950 font-bold">11 days fewer</strong> than the solar cycle, your relative lunar age indices advance. For every 33 solar years elapsed, you experience approximately 34 lunar cycles! Total days alive: <strong className="text-indigo-950 font-mono font-bold bg-indigo-100 px-1.5 py-0.5 rounded-xs text-[11px]">{gregorianAge.totalDays.toLocaleString()} days</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* BIRTHDAY COUNTDOWN BLOCKS */}
          <div className="pt-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-4 flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-indigo-600 font-bold" /> Target Anniversaries
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="birthday-countdowns-grid">
              {/* Gregorian countdown */}
              {nextGregBday && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xs">
                  <div>
                    <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">
                      Gregorian Solar Bday
                    </span>
                    <span className="block text-xs font-bold text-slate-700 font-sans">
                      {nextGregBday.date.getDate()} {getGregMonthName(nextGregBday.date.getMonth() + 1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-bold text-slate-400 uppercase leading-none">Remaining</div>
                    <div className="text-sm font-mono font-black text-slate-800 mt-1">
                      {nextGregBday.daysRemaining === 0 ? "TODAY! 🎉" : `${nextGregBday.daysRemaining} days`}
                    </div>
                  </div>
                </div>
              )}

              {/* Hijri countdown */}
              {nextHijriBday && (
                <div className="flex items-center justify-between bg-indigo-50/45 border border-indigo-150 p-4 rounded-xs">
                  <div>
                    <span className="block text-[9px] text-indigo-500 font-black uppercase tracking-widest leading-none mb-1.5">
                      Hijriah Lunar Bday
                    </span>
                    <span className="block text-xs font-bold text-indigo-900 font-sans">
                      {nextHijriBday.hijriDate.day} {getHijriMonthName(nextHijriBday.hijriDate.month)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-bold text-indigo-400 uppercase leading-none">Remaining</div>
                    <div className="text-sm font-mono font-black text-indigo-950 mt-1">
                      {nextHijriBday.daysRemaining === 0 ? "TODAY! 🎉" : `${nextHijriBday.daysRemaining} days`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="text-xs text-slate-400">Choose a valid birthdate to see comparison telemetry</p>
        </div>
      )}
    </div>
  );
}
