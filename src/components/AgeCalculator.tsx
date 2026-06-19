import React, { useState, useEffect } from 'react';
import { CalendarType, AgeResult, HijriDate, AppLanguage } from '../types';
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
import { Cake, Timer, Sparkles, ArrowRightLeft, CalendarDays, HelpCircle } from 'lucide-react';
import { getTranslation } from '../utils/langUtils';

interface AgeCalculatorProps {
  calendarType: CalendarType;
  hijriOffset?: number;
  lang: AppLanguage;
}

export default function AgeCalculator({ calendarType, hijriOffset = 0, lang }: AgeCalculatorProps) {
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
      const days = getDaysInHijriMonth(hijriBdayYear, hijriBdayMonth, calendarType, hijriOffset);
      setMaxHijriBdayDays(days);
      if (hijriBdayDay > days) {
        setHijriBdayDay(days);
      }
    }
  }, [hijriBdayYear, hijriBdayMonth, calendarType, bdayInputMode, hijriOffset]);

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
          
          const hBirth = getHijriDateFromGregorian(dateObj, calendarType, hijriOffset);
          setResolvedHijriBday(hBirth);
          
          // Keep Hijri input numbers synchronized for visual toggle consistency
          setHijriBdayYear(hBirth.year);
          setHijriBdayMonth(hBirth.month);
          setHijriBdayDay(hBirth.day);
        }
      }
    } else {
      // Hijri Input Mode
      const gDate = hijriToGregorian(hijriBdayYear, hijriBdayMonth, hijriBdayDay, calendarType, hijriOffset);
      setResolvedBday(gDate);
      setResolvedHijriBday({ year: hijriBdayYear, month: hijriBdayMonth, day: hijriBdayDay });

      // Synchronize Gregorian input state
      const yyyy = gDate.getFullYear();
      const mm = String(gDate.getMonth() + 1).padStart(2, '0');
      const dd = String(gDate.getDate()).padStart(2, '0');
      setGregorianBday(`${yyyy}-${mm}-${dd}`);
    }
  }, [gregorianBday, hijriBdayYear, hijriBdayMonth, hijriBdayDay, bdayInputMode, calendarType, hijriOffset]);

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
      const hAge = calculateHijriAge(resolvedBday, today, calendarType, hijriOffset);
      
      setGregorianAge(gAge);
      setHijriAge(hAge);

      const nextG = getNextGregorianBirthday(resolvedBday, today);
      const nextH = getNextHijriBirthday(resolvedBday, today, calendarType, hijriOffset);

      setNextGregBday(nextG);
      setNextHijriBday(nextH);
    }
  }, [resolvedBday, today, calendarType, hijriOffset]);

  const handleInputModeToggle = () => {
    setBdayInputMode((prev) => (prev === 'g' ? 'h' : 'g'));
  };

  const getHijriMonthName = (month: number) => {
    return getTranslation(`month.h${month}`, lang, HIJRI_MONTHS[month - 1]?.name || '');
  };

  const getGregMonthName = (month: number) => {
    return getTranslation(`month.g${month}`, lang, GREGORIAN_MONTHS[month - 1]?.name || '');
  };

  // Difference calculation
  const getAgeDifferenceText = () => {
    if (!gregorianAge || !hijriAge) return '';
    const diffYears = hijriAge.years - gregorianAge.years;
    const diffMonths = hijriAge.months - gregorianAge.months;
    const diffDays = hijriAge.days - gregorianAge.days;
    
    if (diffYears === 0 && diffMonths === 0) {
      if (diffDays === 0) return getTranslation('age.diffIdentical', lang, 'Your age is identical in both calendars');
      // "Your lunar age is older by 5 days!" -> dynamic
      const olderByText = getTranslation('age.olderBy', lang, 'Your lunar age is older by');
      const daysText = getTranslation('age.daysLower', lang, 'days');
      return `${olderByText} ${diffDays} ${daysText}!`;
    }

    const yrText = diffYears === 1 
      ? getTranslation('age.yearSingle', lang, 'year') 
      : getTranslation('age.yearPlural', lang, 'years');
    const olderHText = getTranslation('age.olderInHijri', lang, 'older in the Hijri calendar!');
    const youAreText = getTranslation('age.youAre', lang, 'You are');

    return `${youAreText} ${diffYears} ${yrText} ${olderHText}`;
  };

  return (
    <div id="age-calculator-container" className="bg-white rounded-xs border border-slate-200 shadow-xs p-6 flex flex-col h-full animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xs text-indigo-600">
            <Cake className="w-5 h-5 font-bold" id="age-calculator-icon" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
              {getTranslation('age.title', lang, 'Age Metrics Compare')}
            </h2>
            <p className="text-xs text-slate-500">
              {getTranslation('age.desc', lang, 'Dual bio-metric solar and lunar telemetry tracking')}
            </p>
          </div>
        </div>

        <button
          id="toggle-birthdate-selector-btn"
          onClick={handleInputModeToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-200 animate-pulse-slow font-bold" />
          {bdayInputMode === 'g' 
            ? getTranslation('age.enterH', lang, 'Enter Birthdate in Hijri') 
            : getTranslation('age.enterG', lang, 'Enter Birthdate in Gregorian')}
        </button>
      </div>

      {/* BIRTHDATE INPUT SECTION */}
      <div className="bg-slate-50/55 rounded-xs p-5 border border-slate-200 mb-6 font-mono">
        {bdayInputMode === 'g' ? (
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 font-sans">
              {getTranslation('age.selectG', lang, 'Select Solar Birthdate (Gregorian)')}
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
                {getTranslation('age.corresH', lang, 'Your birthdate corresponds to Hijri:')}{' '}
                <strong className="text-slate-700 font-semibold font-mono">
                  {resolvedHijriBday.day} {getHijriMonthName(resolvedHijriBday.month)} {resolvedHijriBday.year} AH
                </strong>
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 font-sans">
              {getTranslation('age.selectH', lang, 'Select Lunar Birthdate (Hijri Calendar)')}
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 leading-none font-sans">
                  {getTranslation('conv.year', lang, 'Hijri Year')}
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
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 leading-none font-sans">
                  {getTranslation('conv.month', lang, 'Hijri Month')}
                </label>
                <select
                  id="birthdate-hijri-month"
                  value={hijriBdayMonth}
                  onChange={(e) => setHijriBdayMonth(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-505 focus:border-indigo-500 text-slate-800 text-xs font-semibold shadow-xs h-[34px] font-sans"
                >
                  {HIJRI_MONTHS.map((item) => (
                    <option key={item.index} value={item.index}>
                      {getHijriMonthName(item.index)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 leading-none font-sans">
                  {getTranslation('conv.day', lang, 'Hijri Day')}{' '}
                  <span className="text-slate-400 font-light text-[8px] font-sans">max {maxHijriBdayDays}</span>
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
                {getTranslation('age.corresG', lang, 'Corresponding Gregorian is:')}{' '}
                <strong className="text-slate-700 font-semibold font-mono">
                  {resolvedBday.getDate()} {getGregMonthName(resolvedBday.getMonth() + 1)} {resolvedBday.getFullYear()}
                </strong>
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
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">
                  {getTranslation('age.gregAge', lang, 'Gregorian Age')}
                </h3>
                <span className="text-[9px] bg-slate-100 px-2 py-0.5 font-mono font-bold uppercase tracking-wider text-slate-500 rounded-xs border border-slate-200 font-sans">
                  {getTranslation('age.solarBased', lang, 'Solar-Based')}
                </span>
              </div>
              <div>
                <div className="text-5xl sm:text-6xl font-light tracking-tighter text-slate-900 font-mono">
                  {gregorianAge.years}
                  <span className="text-xl font-normal text-slate-400 ml-1.5 font-sans">
                    {lang === 'ms' ? 'Thn' : lang === 'ar' ? 'سنة' : 'Yrs'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 font-mono">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none font-sans">
                      {getTranslation('age.months', lang, 'Months')}
                    </div>
                    <div className="text-lg font-mono font-bold text-slate-800">
                      {String(gregorianAge.months).padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none font-sans">
                      {getTranslation('age.days', lang, 'Days')}
                    </div>
                    <div className="text-lg font-mono font-bold text-slate-800">
                      {String(gregorianAge.days).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HIJRI LUNAR AGE CARD */}
            <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-600 p-5 flex flex-col rounded-xs relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 font-sans">
                  {getTranslation('age.hijriAge', lang, 'Hijriah Age')}
                </h3>
                <span className="text-[9px] bg-indigo-50 px-2 py-0.5 font-mono font-bold uppercase tracking-wider text-indigo-700 rounded-xs border border-indigo-100 font-sans">
                  {getTranslation('age.lunarBased', lang, 'Lunar-Based')}
                </span>
              </div>
              <div>
                <div className="text-5xl sm:text-6xl font-light tracking-tighter text-slate-900 font-mono">
                  {hijriAge.years}
                  <span className="text-xl font-normal text-slate-400 ml-1.5 font-sans">
                    {lang === 'ms' ? 'Thn' : lang === 'ar' ? 'سنة' : 'Yrs'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 font-mono">
                  <div>
                    <div className="text-[9px] text-indigo-400 uppercase font-black tracking-wider leading-none font-sans">
                      {getTranslation('age.months', lang, 'Months')}
                    </div>
                    <div className="text-lg font-mono font-bold text-indigo-600">
                      {String(hijriAge.months).padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-indigo-400 uppercase font-black tracking-wider leading-none font-sans">
                      {getTranslation('age.days', lang, 'Days')}
                    </div>
                    <div className="text-lg font-mono font-bold text-indigo-600">
                      {String(hijriAge.days).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DRIFT EXPLANATOR INFOBAR */}
          <div className="bg-indigo-50/60 rounded-xs border border-indigo-100/80 p-5 font-sans">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  {getAgeDifferenceText()}
                </p>
                <p className="text-[11px] text-indigo-805 mt-1 leading-relaxed font-light">
                  {lang === 'ms' ? (
                    <>
                      Kerana tahun Hijrah lunar mengumpulkan kira-kira <strong className="text-indigo-950 font-bold">11 hari kurang</strong> daripada kitaran solar, umur relatif anda bertambah lebih cepat dalam Hijrah. Bagi setiap 33 tahun solar berlalu, anda mengalami kira-kira 34 kitaran lunar! Jumlah hari hidup: <strong className="text-indigo-950 font-mono font-bold bg-indigo-100 px-1.5 py-0.5 rounded-xs text-[11px]">{gregorianAge.totalDays.toLocaleString()} hari</strong>.
                    </>
                  ) : lang === 'ar' ? (
                    <>
                      نظراً لأن السنة الهجرية القمرية تقل عن الدورة الشمسية بنحو <strong className="text-indigo-950 font-bold">١١ يوماً</strong>، فإن عمرك الهجري يتقدم بشكل أسرع. لكل ٣٣ سنة شمسية تمر، تعيش ما يقارب ٣٤ دورة قمرية! إجمالي الأيام: <strong className="text-indigo-950 font-mono font-bold bg-indigo-100 px-1.5 py-0.5 rounded-xs text-[11px] font-mono">{gregorianAge.totalDays.toLocaleString()} يوماً</strong>.
                    </>
                  ) : (
                    <>
                      Because the lunar Hijri year accumulates roughly <strong className="text-indigo-950 font-bold">11 days fewer</strong> than the solar cycle, your relative lunar age indices advance. For every 33 solar years elapsed, you experience approximately 34 lunar cycles! Total days alive: <strong className="text-indigo-950 font-mono font-bold bg-indigo-100 px-1.5 py-0.5 rounded-xs text-[11px] font-mono">{gregorianAge.totalDays.toLocaleString()} days</strong>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* BIRTHDAY COUNTDOWN BLOCKS */}
          <div className="pt-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-4 flex items-center gap-2 font-sans">
              <Timer className="w-3.5 h-3.5 text-indigo-600 font-bold" />{' '}
              {getTranslation('age.anniversaries', lang, 'Target Anniversaries')}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono" id="birthday-countdowns-grid">
              {/* Gregorian countdown */}
              {nextGregBday && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xs">
                  <div>
                    <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5 font-sans">
                      {getTranslation('age.gregBday', lang, 'Gregorian Solar Bday')}
                    </span>
                    <span className="block text-xs font-bold text-slate-705 font-sans">
                      {nextGregBday.date.getDate()} {getGregMonthName(nextGregBday.date.getMonth() + 1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-bold text-slate-400 uppercase leading-none font-sans">
                      {getTranslation('age.remaining', lang, 'Remaining')}
                    </div>
                    <div className="text-sm font-mono font-black text-slate-805 mt-1">
                      {nextGregBday.daysRemaining === 0 
                        ? getTranslation('age.today', lang, 'TODAY! 🎉') 
                        : `${nextGregBday.daysRemaining} ${getTranslation('age.daysLower', lang, 'days')}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Hijri countdown */}
              {nextHijriBday && (
                <div className="flex items-center justify-between bg-indigo-50/45 border border-indigo-150 p-4 rounded-xs">
                  <div>
                    <span className="block text-[9px] text-indigo-500 font-black uppercase tracking-widest leading-none mb-1.5 font-sans">
                      {getTranslation('age.hijriBday', lang, 'Hijriah Lunar Bday')}
                    </span>
                    <span className="block text-xs font-bold text-indigo-900 font-sans">
                      {nextHijriBday.hijriDate.day} {getHijriMonthName(nextHijriBday.hijriDate.month)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-bold text-indigo-400 uppercase leading-none font-sans">
                      {getTranslation('age.remaining', lang, 'Remaining')}
                    </div>
                    <div className="text-sm font-mono font-black text-indigo-95 mt-1">
                      {nextHijriBday.daysRemaining === 0 
                        ? getTranslation('age.today', lang, 'TODAY! 🎉') 
                        : `${nextHijriBday.daysRemaining} ${getTranslation('age.daysLower', lang, 'days')}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-10 font-sans">
          <p className="text-xs text-slate-405">{getTranslation('age.chooseValid', lang, 'Choose a valid birthdate to see comparison telemetry')}</p>
        </div>
      )}
    </div>
  );
}
