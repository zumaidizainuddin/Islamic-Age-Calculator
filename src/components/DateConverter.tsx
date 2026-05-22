import React, { useState, useEffect } from 'react';
import { CalendarType, HijriDate } from '../types';
import { getHijriDateFromGregorian, hijriToGregorian, getDaysInHijriMonth, HIJRI_MONTHS, GREGORIAN_MONTHS, hijriToJulian } from '../utils/calendarUtils';
import { ArrowLeftRight, Calendar as CalendarIcon, Info, HelpCircle } from 'lucide-react';

interface DateConverterProps {
  calendarType: CalendarType;
  hijriOffset?: number;
}

export default function DateConverter({ calendarType, hijriOffset = 0 }: DateConverterProps) {
  // Mode state: 'g2h' (Gregorian to Hijri) vs 'h2g' (Hijri to Gregorian)
  const [conversionMode, setConversionMode] = useState<'g2h' | 'h2g'>('g2h');

  // Input states for Gregorian
  const [gregorianInput, setGregorianInput] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Converted output for Gregorian -> Hijri
  const [convertedHijri, setConvertedHijri] = useState<HijriDate | null>(null);

  // Input states for Hijri
  const [hijriInputYear, setHijriInputYear] = useState<number>(1447);
  const [hijriInputMonth, setHijriInputMonth] = useState<number>(12); // Dhu al-Hijjah
  const [hijriInputDay, setHijriInputDay] = useState<number>(1);
  const [maxHijriDays, setMaxHijriDays] = useState<number>(30);

  // Converted output for Hijri -> Gregorian
  const [convertedGregorian, setConvertedGregorian] = useState<Date | null>(null);

  // Run conversion whenever Gregorian inputs or calendarType changes
  useEffect(() => {
    if (gregorianInput) {
      const parts = gregorianInput.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const dateObj = new Date(year, month, day);
          const hDate = getHijriDateFromGregorian(dateObj, calendarType, hijriOffset);
          setConvertedHijri(hDate);
        }
      }
    }
  }, [gregorianInput, calendarType, hijriOffset]);

  // Dynamically update max days for Hijri input month/year to prevent choosing invalid days
  useEffect(() => {
    const days = getDaysInHijriMonth(hijriInputYear, hijriInputMonth, calendarType, hijriOffset);
    setMaxHijriDays(days);
    if (hijriInputDay > days) {
      setHijriInputDay(days);
    }
  }, [hijriInputYear, hijriInputMonth, calendarType, hijriOffset]);

  // Run conversion whenever Hijri inputs change
  useEffect(() => {
    if (hijriInputYear && hijriInputMonth && hijriInputDay) {
      const gDate = hijriToGregorian(hijriInputYear, hijriInputMonth, hijriInputDay, calendarType, hijriOffset);
      setConvertedGregorian(gDate);
    }
  }, [hijriInputYear, hijriInputMonth, hijriInputDay, calendarType, maxHijriDays, hijriOffset]);

  const toggleMode = () => {
    setConversionMode((prev) => (prev === 'g2h' ? 'h2g' : 'g2h'));
  };

  // Safe formatting of the weekday name
  const getWeekdayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getArabicWeekdayName = (gDate: Date) => {
    const dayIndex = gDate.getDay();
    const weekdays = [
      'الأحد (al-Ahad)',
      'الاثنين (al-Ithnin)',
      'الثلاثاء (al-Thulatha)',
      'الأربعاء (al-Arba\'a)',
      'الخميس (al-Khams)',
      'الجمعة (al-Jumu\'ah)',
      'السبت (al-Sabt)'
    ];
    return weekdays[dayIndex];
  };

  return (
    <div id="date-converter-card" className="bg-white rounded-xs border border-slate-200 shadow-xs p-6 flex flex-col h-full animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-550/10 rounded-xs text-indigo-600">
            <ArrowLeftRight className="w-5 h-5 font-bold" id="date-converter-icon" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Bidirectional Converter</h2>
            <p className="text-xs text-slate-500">Astronomical coordinate conversion engine</p>
          </div>
        </div>

        <button
          id="toggle-conversion-mode-btn"
          onClick={toggleMode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
        >
          {conversionMode === 'g2h' ? 'Switch to Hijri➔Gregorian' : 'Switch to Gregorian➔Hijri'}
        </button>
      </div>

      {conversionMode === 'g2h' ? (
        /* GREGORIAN TO HIJRI SECTION */
        <div id="gregorian-to-hijri-workspace" className="flex-1 flex flex-col justify-between space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Select Solar Gregorian Date
            </label>
            <div className="relative">
              <input
                id="gregorian-date-input"
                type="date"
                min="0622-07-16" // Start at Islamic calendar start epoch
                max="2199-12-31"
                value={gregorianInput}
                onChange={(e) => setGregorianInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-505 focus:border-indigo-500 text-slate-850 text-xs font-semibold font-mono"
              />
            </div>
            <div className="mt-3 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-450 leading-normal font-sans font-light">
                Supported Gregorian range starts on July 16, 622 CE (Hijri Epoch 1 Muharram 1 AH).
              </p>
            </div>
          </div>

          <div className="bg-indigo-50/45 rounded-xs border border-indigo-155 p-5 mt-auto">
            <span className="text-[9px] font-mono tracking-widest font-black text-indigo-600 uppercase">
              Resulting Hijri Date Equivalent
            </span>
            {convertedHijri && (
              <div className="mt-2" id="converted-hijri-result-box">
                <span className="block text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {convertedHijri.day} {HIJRI_MONTHS[convertedHijri.month - 1]?.name} {convertedHijri.year} AH
                </span>
                
                <span className="block text-sm font-semibold text-indigo-805 mt-2 font-arabic leading-relaxed text-right" dir="rtl">
                  {convertedHijri.day} {HIJRI_MONTHS[convertedHijri.month - 1]?.arabicName} {convertedHijri.year} هـ
                </span>

                <div className="mt-4 pt-3 border-t border-indigo-150 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[9px] text-indigo-600 font-extrabold uppercase tracking-wide">
                      Day of Week
                    </span>
                    <span className="block text-xs text-slate-700 font-medium">
                      {gregorianInput ? getWeekdayName(new Date(gregorianInput)) : ''}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-indigo-600 font-extrabold uppercase tracking-wide">
                      Arabic Weekday
                    </span>
                    <span className="block text-xs text-slate-700 font-medium truncate">
                      {gregorianInput ? getArabicWeekdayName(new Date(gregorianInput)) : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* HIJRI TO GREGORIAN SECTION */
        <div id="hijri-to-gregorian-workspace" className="flex-1 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-3 gap-2.5 font-mono">
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5 leading-none">
                Hijri Year
              </label>
              <input
                id="hijri-input-year"
                type="number"
                min="1"
                max="1650"
                value={hijriInputYear}
                onChange={(e) => setHijriInputYear(Math.max(1, parseInt(e.target.value, 10) || 1447))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-550 text-slate-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5 leading-none">
                Hijri Month
              </label>
              <select
                id="hijri-input-month"
                value={hijriInputMonth}
                onChange={(e) => setHijriInputMonth(parseInt(e.target.value, 10))}
                className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 text-xs font-semibold h-[34px] font-sans"
              >
                {HIJRI_MONTHS.map((item) => (
                  <option key={item.index} value={item.index}>
                    {item.index} - {item.name} ({item.arabicName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5 leading-none">
                Hijri Day <span className="text-slate-400 font-light text-[8px] font-sans">max {maxHijriDays}</span>
              </label>
              <select
                id="hijri-input-day"
                value={hijriInputDay}
                onChange={(e) => setHijriInputDay(parseInt(e.target.value, 10))}
                className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 text-xs font-semibold h-[34px]"
              >
                {Array.from({ length: maxHijriDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xs mt-auto">
            <span className="text-[9px] font-mono tracking-widest font-black text-slate-400 uppercase">
              Resulting Gregorian Date Equivalent
            </span>
            {convertedGregorian && (
              <div className="mt-2" id="converted-gregorian-result-box">
                <span className="block text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {convertedGregorian.getDate()} {GREGORIAN_MONTHS[convertedGregorian.getMonth()]?.name} {convertedGregorian.getFullYear()}
                </span>
                
                <span className="block text-xs font-semibold text-slate-500 mt-2 capitalize">
                  {getWeekdayName(convertedGregorian)}, {getArabicWeekdayName(convertedGregorian).split(' ')[0]}
                </span>

                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[9px] text-slate-450 font-extrabold uppercase tracking-wide">
                      Solar Season
                    </span>
                    <span className="block text-xs text-slate-700 font-medium">
                      {convertedGregorian.getMonth() >= 2 && convertedGregorian.getMonth() <= 4 ? '🌸 Spring' :
                       convertedGregorian.getMonth() >= 5 && convertedGregorian.getMonth() <= 7 ? '☀️ Summer' :
                       convertedGregorian.getMonth() >= 8 && convertedGregorian.getMonth() <= 10 ? '🍂 Autumn' : '❄️ Winter'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-450 font-extrabold uppercase tracking-wide">
                      Julian Day Number (JD)
                    </span>
                    <span className="block text-xs font-mono text-slate-700 font-bold">
                      {Math.round(hijriToJulian(hijriInputYear, hijriInputMonth, hijriInputDay))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
