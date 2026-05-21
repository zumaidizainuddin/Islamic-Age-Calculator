import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, AlertCircle, CalendarRange } from 'lucide-react';

interface InfoItem {
  title: string;
  arabic?: string;
  body: string;
}

const INSIGHTS: InfoItem[] = [
  {
    title: 'The Great Calendar Drift',
    body: 'The Gregorian calendar is a solar calendar based on the time it takes Earth to complete one full orbit around the Sun (~365.2425 days). The Hijri calendar is a lunar calendar based on the synodic cycles of the Moon (~354.367 days). Because a Hijri year is roughly 11 days shorter, its months drift continuously backward through the solar seasons over a 33-year cycle.'
  },
  {
    title: 'Leap Year Patterns',
    body: 'In the Gregorian calendar, a leap day (February 29) is added every 4 years to adjust for the extra ~0.24 days in a solar year. In the Tabular Islamic calendar, a cycle of 30 years is defined with exactly 11 leap years (years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, and 29), where an extra day is appended to the final month, Dhu al-Hijjah, making it 30 days instead of 29.'
  },
  {
    title: 'The Umm al-Qura System',
    body: 'Unlike tabular Hijri calendars which rely purely on fixed alternate-month mathematics, the official Umm al-Qura calendar of Saudi Arabia is calculated astronomically. It aims to predict when the crescent Hilal moon will be visible on the horizon at dusk on the 29th day of each month. This means month boundaries correspond directly to physical lunar coordinates and coordinates can vary by +-1 day from tabular equations.'
  },
  {
    title: 'Sacred & Dynamic Months',
    body: 'Four of the twelve Hijri months are considered sacred in Islam: Muharram (1), Rajab (7), Dhu al-Qadah (11), and Dhu al-Hijjah (12). Ramadan (9) is the holy month of fasting, followed immediately by Shawwal (10), which starts with Eid al-Fitr. Dhu al-Hijjah (12) is the month of the Hajj pilgrimage and Eid al-Adha.'
  }
];

export default function EducationalInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="educational-info" className="bg-white rounded-xs border border-slate-200 p-6 mt-10 transition-all duration-300">
      <button
        id="toggle-educational-insights-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2 bg-indigo-50 rounded-xs text-indigo-600">
            <BookOpen className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Astronomical & Calendar Insights</h3>
            <p className="text-xs text-slate-500">Understand the mathematical science behind solar and lunar coordinate mapping</p>
          </div>
        </div>
        <div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400 hover:text-slate-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 hover:text-slate-700" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-6 pt-5 border-t border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" id="educational-details-grid">
          {INSIGHTS.map((item, idx) => (
            <div key={idx} className="bg-slate-50/50 rounded-xs p-5 border border-slate-200/80 hover:bg-slate-50 transition-all duration-300">
              <span className="block text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-indigo-600 font-bold" />
                {item.title}
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
