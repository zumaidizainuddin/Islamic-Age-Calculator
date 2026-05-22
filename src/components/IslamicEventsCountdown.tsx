import React, { useState, useMemo } from 'react';
import { CalendarType, HijriDate } from '../types';
import { getHijriDateFromGregorian, hijriToGregorian, HIJRI_MONTHS, GREGORIAN_MONTHS } from '../utils/calendarUtils';
import { 
  Calendar, 
  Search, 
  Sparkles, 
  Clock, 
  Info, 
  ChevronRight, 
  Copy, 
  Check, 
  Filter, 
  ArrowUpDown, 
  CalendarDays, 
  MoonStar, 
  Compass,
  BookOpen
} from 'lucide-react';

interface IslamicEvent {
  id: string;
  name: string;
  englishName: string;
  hijriDate: string;
  month: number;
  day: number;
  category: 'eid' | 'ramadan' | 'nights' | 'general';
  description: string;
  virtues?: string;
}

interface IslamicEventsCountdownProps {
  calendarType: CalendarType;
  hijriOffset: number;
  today: Date;
}

const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: 'awal-zulhijah',
    name: 'Beginning of Dhu al-Hijjah',
    englishName: '1 Dhu al-Hijjah / Awal Zulhijah',
    hijriDate: '1 Dhu al-Hijjah',
    month: 12,
    day: 1,
    category: 'general',
    description: 'The start of the sacred month of Hajj pilgrimages. The first ten nights of Dhu al-Hijjah are highly blessed.',
    virtues: 'Prophet Muhammad (PBUH) said: "There are no days in which righteous deeds are more beloved to Allah than these ten days."'
  },
  {
    id: 'hari-arafah',
    name: 'Day of Arafah',
    englishName: '9 Dhu al-Hijjah / Hari Arafah',
    hijriDate: '9 Dhu al-Hijjah',
    month: 12,
    day: 9,
    category: 'general',
    description: 'Considered the peak of Hajj (pilgrimage), where pilgrims stand on Mount Arafah in deep supplication.',
    virtues: 'Fasting on this day expiates the sins of the preceding year and the coming year for non-pilgrims.'
  },
  {
    id: 'aidiladha',
    name: 'Eid al-Adha',
    englishName: 'Festival of Sacrifice / Hari Raya Aidiladha',
    hijriDate: '10 Dhu al-Hijjah',
    month: 12,
    day: 10,
    category: 'eid',
    description: 'A major Islamic festival celebrating Prophet Ibrahim’s unwavering obedience to sacrifice his son Ishmael in response to God’s command.',
    virtues: 'Marked by Eid prayers, giving charity, and distributing Qurban (sacrificial meat) to the needy and relatives.'
  },
  {
    id: 'awal-muharram',
    name: 'Islamic New Year',
    englishName: '1 Muharram / Awal Muharram',
    hijriDate: '1 Muharram',
    month: 1,
    day: 1,
    category: 'general',
    description: 'Marks the first day of the Islamic lunar calendar, reflecting on the historical Hijrah migration of the Prophet (PBUH) from Mecca to Medina.',
    virtues: 'Specially observed as a time of reflection, renewal, and planning or setting intentions for the upcoming year.'
  },
  {
    id: 'hari-asyura',
    name: 'Day of Ashura',
    englishName: '10 Muharram / Hari Asyura',
    hijriDate: '10 Muharram',
    month: 1,
    day: 10,
    category: 'nights',
    description: 'Commemorates the day Allah parted the Red Sea to deliver Prophet Musa (Moses) and the Israelites from the tyranny of the Pharaoh.',
    virtues: 'Sunnah fasting on this day and the 9th of Muharram is highly rewarded, washing away the sins of the previous year.'
  },
  {
    id: 'maulidur-rasul',
    name: 'Mawlid al-Nabi',
    englishName: "Prophet's Birthday / Maulidur Rasul",
    hijriDate: "12 Rabi' al-Awwal",
    month: 3,
    day: 12,
    category: 'general',
    description: 'Observance of the anniversary of the birth of Prophet Muhammad (PBUH), who was sent as a mercy to all creation.',
    virtues: 'Celebrated with increased Salawat (blessings), charity, learning about his noble characters (Shama’il), and feeding others.'
  },
  {
    id: 'israk-mikraj',
    name: "Isra' and Mi'raj",
    englishName: 'The Night Journey / Israk Mikraj',
    hijriDate: '27 Rajab',
    month: 7,
    day: 27,
    category: 'nights',
    description: 'The divine night journey where the Prophet (PBUH) traveled from Mecca to Jerusalem in a single night and ascended through celestial domains.',
    virtues: 'This event marks when the five daily prayers (Salah) were officially prescribed and gifted to the Muslim Ummah.'
  },
  {
    id: 'nisfu-syaaban',
    name: "Mid-Sha'ban",
    englishName: "Night of Liberation / Nisfu Syaaban",
    hijriDate: "15 Sha'ban",
    month: 8,
    day: 15,
    category: 'nights',
    description: 'The night of record and liberation, occurring halfway through Sha’ban, leading directly into the holy month of Ramadan.',
    virtues: 'A night for special supplication and prayers, asking for wellness, livelihood, and forgiveness.'
  },
  {
    id: 'awal-ramadan',
    name: 'Beginning of Ramadan',
    englishName: 'Fasting Month / 1 Ramadan / Awal Ramadan',
    hijriDate: '1 Ramadan',
    month: 9,
    day: 1,
    category: 'ramadan',
    description: 'The start of the sacred month of fasting, self-purification, devotion, nocturnal Tarawih prayers, and intensive Quran recitation.',
    virtues: 'Prophet Muhammad (PBUH) noted: "When the month of Ramadan starts, the gates of heaven are opened and the gates of Hell are closed."'
  },
  {
    id: 'nuzul-quran',
    name: 'Revelation of the Quran',
    englishName: '17 Ramadan / Nuzul Quran',
    hijriDate: '17 Ramadan',
    month: 9,
    day: 17,
    category: 'ramadan',
    description: 'Commemorates the night when the initial revelation of the Holy Quran was brought down to the Prophet (PBUH) in the cave of Hira.',
    virtues: 'Reinforces the close relationship Muslims maintain with reading and understanding the deep meanings of the Quran.'
  },
  {
    id: 'laylatul-qadr',
    name: 'Laylat al-Qadr',
    englishName: 'Night of Power / Lailatul Qadr',
    hijriDate: '27 Ramadan',
    month: 9,
    day: 27,
    category: 'ramadan',
    description: 'The absolute most virtuous night of the year, falling within the last ten odd nights of Ramadan, hidden yet traditionally observed on the 27th night.',
    virtues: 'The Quran declares: "The Night of Power is better than a thousand months" (equates to over 83 years of continuous worship).'
  },
  {
    id: 'aidilfitri',
    name: 'Eid al-Fitr',
    englishName: 'Festival of Fast-Breaking / Hari Raya Aidilfitri',
    hijriDate: '1 Shawwal',
    month: 10,
    day: 1,
    category: 'eid',
    description: 'The joyous festival of breaking the fast, marking a thankful completion of Ramadan, celebrated globally with prayers and family reuniting.',
    virtues: 'Marked by giving Zakat al-Fitr before prayers, visiting relatives back home, and seeking forgiveness from one another.'
  }
];

export default function IslamicEventsCountdown({ calendarType, hijriOffset, today }: IslamicEventsCountdownProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'eid' | 'ramadan' | 'nights' | 'general'>('all');
  const [sortBy, setSortBy] = useState<'days' | 'chronological'>('days');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic calculations of events based on active calendar rules and today's date
  const calculatedEvents = useMemo(() => {
    // Current Hijri date based on current Gregorian date and offset
    const hToday = getHijriDateFromGregorian(today, calendarType, hijriOffset);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return ISLAMIC_EVENTS.map(event => {
      // 1. Try current year candidate
      const currentYearGreg = hijriToGregorian(hToday.year, event.month, event.day, calendarType, hijriOffset);
      const currentMidnight = new Date(currentYearGreg.getFullYear(), currentYearGreg.getMonth(), currentYearGreg.getDate());

      // 2. Try next year candidate (and even previous year candidate just in case)
      const nextYearGreg = hijriToGregorian(hToday.year + 1, event.month, event.day, calendarType, hijriOffset);
      const nextMidnight = new Date(nextYearGreg.getFullYear(), nextYearGreg.getMonth(), nextYearGreg.getDate());

      let targetGreg = currentMidnight;
      let targetYear = hToday.year;

      if (currentMidnight.getTime() >= todayMidnight.getTime()) {
        targetGreg = currentMidnight;
        targetYear = hToday.year;
      } else {
        targetGreg = nextMidnight;
        targetYear = hToday.year + 1;
      }

      const diffTime = targetGreg.getTime() - todayMidnight.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (24 * 60 * 60 * 1000)));

      return {
        ...event,
        gregorianDate: targetGreg,
        hijriYear: targetYear,
        daysRemaining
      };
    });
  }, [calendarType, hijriOffset, today]);

  // Handle Search and Filter logic
  const filteredEvents = useMemo(() => {
    let result = calculatedEvents.filter(event => {
      // Direct category filtering
      const categoryMatch = selectedCategory === 'all' || event.category === selectedCategory;

      // Text search match
      const searchableText = `${event.name} ${event.englishName} ${event.description} ${event.hijriDate}`.toLowerCase();
      const searchMatch = searchableText.includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });

    // Handle sorting
    if (sortBy === 'days') {
      result.sort((a, b) => a.daysRemaining - b.daysRemaining);
    } else {
      // Sorted chronologically by Hijri internal Month/Day sequence index
      result.sort((a, b) => {
        if (a.month !== b.month) {
          return a.month - b.month;
        }
        return a.day - b.day;
      });
    }

    return result;
  }, [calculatedEvents, searchQuery, selectedCategory, sortBy]);

  // Active details object
  const activeEventDetails = useMemo(() => {
    if (!selectedEventId) return null;
    return calculatedEvents.find(e => e.id === selectedEventId) || null;
  }, [selectedEventId, calculatedEvents]);

  // Handle Share / Save copy to clipboard interaction
  const copyShareText = (event: typeof calculatedEvents[0]) => {
    const monthName = HIJRI_MONTHS[event.month - 1]?.name || '';
    const dateFormatted = event.gregorianDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const text = `🕋 Countdown to ${event.name} (${event.hijriDate} ${event.hijriYear} AH):
⏳ Just ${event.daysRemaining === 0 ? 'TODAY!' : `${event.daysRemaining} days remaining`}!
📅 Expected Gregorian Date: ${dateFormatted}
📖 Description: ${event.description}
✨ Virtues: ${event.virtues || 'No additional details.'}
Calculated using Chronos Dual Calendar Companion.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy to clipboard', err);
    });
  };

  return (
    <section className="bg-white rounded-xs border border-slate-200 shadow-xs p-6 md:p-8 mb-10" id="islamic-events-countdown-section">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 px-1.5 bg-indigo-50 border border-indigo-150 rounded-xs text-indigo-700">
              <MoonStar className="w-4 h-4" />
            </div>
            <span className="text-xs uppercase tracking-[0.15em] font-bold text-indigo-600 font-mono">Sacred Milestones</span>
          </div>
          <h2 id="islamic-events-title" className="text-2xl font-black text-slate-900 tracking-tight">Islamic Events & Holidays Tracker</h2>
          <p className="text-xs text-slate-500 mt-1">
            Astronomical proximity metrics of important dates dynamically tied to your chosen Umm al-Qura or Tabular offset setting.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xs self-start md:self-center">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
          <span>CE {today.getFullYear()} AH {getHijriDateFromGregorian(today, calendarType, hijriOffset).year}</span>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="event-search-input"
            type="text"
            placeholder="Search events, holy nights, festivals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden rounded-xs placeholder-slate-400 text-slate-700 tracking-wide font-medium transition-all"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            id="cat-filter-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            id="cat-filter-eid"
            onClick={() => setSelectedCategory('eid')}
            className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'eid'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Festivals
          </button>
          <button
            id="cat-filter-ramadan"
            onClick={() => setSelectedCategory('ramadan')}
            className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ramadan'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Ramadan
          </button>
          <button
            id="cat-filter-nights"
            onClick={() => setSelectedCategory('nights')}
            className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'nights'
                ? 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Holy Nights
          </button>
        </div>

        <div className="md:col-span-3 flex justify-end items-center gap-1.5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Sort:
          </span>
          <div className="bg-slate-100 p-0.5 rounded-xs border border-slate-200 flex items-center">
            <button
              id="sort-days-btn"
              onClick={() => setSortBy('days')}
              className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer ${
                sortBy === 'days'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Days Left
            </button>
            <button
              id="sort-chrono-btn"
              onClick={() => setSortBy('chronological')}
              className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-widest rounded-xs transition-all cursor-pointer ${
                sortBy === 'chronological'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Hijri Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Events list bento grid */}
        <div className={`col-span-12 ${selectedEventId ? 'lg:col-span-8' : ''} transition-all duration-300`}>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-sm bg-slate-50/50">
              <Compass className="w-8 h-8 text-slate-300 mx-auto mb-3 animate-spin-slow" />
              <p className="text-sm font-semibold text-slate-600">No events match your criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the custom filters or entering a search keyword.</p>
              <button
                id="reset-search-btn"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xs cursor-pointer shadow-xs transition-all"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedEventId ? 'sm:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3'} gap-4`}>
              {filteredEvents.map(event => {
                const isSelected = selectedEventId === event.id;
                const isVeryUpcoming = event.daysRemaining <= 30;
                const isToday = event.daysRemaining === 0;

                // Color schemes depending on Category
                let badgeClass = 'text-slate-500 bg-slate-50 border-slate-200';
                let indicatorColor = 'bg-slate-400';
                let cardHoverBorder = 'hover:border-slate-300';
                
                if (event.category === 'eid') {
                  badgeClass = 'text-indigo-700 bg-indigo-50 border-indigo-150';
                  indicatorColor = 'bg-indigo-500';
                  cardHoverBorder = 'hover:border-indigo-200 hover:bg-slate-50/50';
                } else if (event.category === 'ramadan') {
                  badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-150';
                  indicatorColor = 'bg-emerald-500';
                  cardHoverBorder = 'hover:border-emerald-200 hover:bg-slate-50/50';
                } else if (event.category === 'nights') {
                  badgeClass = 'text-amber-700 bg-amber-50 border-amber-150';
                  indicatorColor = 'bg-amber-500';
                  cardHoverBorder = 'hover:border-amber-200 hover:bg-slate-50/50';
                }

                // Format the expected Gregorian Date
                const gregFormatted = event.gregorianDate.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div
                    key={event.id}
                    id={`event-card-${event.id}`}
                    onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                    className={`border rounded-xs p-4 flex flex-col justify-between cursor-pointer transition-all duration-250 relative ${
                      isSelected 
                        ? 'border-indigo-600 shadow-xs bg-indigo-50/30' 
                        : `border-slate-150 ${cardHoverBorder} bg-white shadow-xs`
                    }`}
                  >
                    {/* Glowing highlight indicator for today or near upcoming events */}
                    {isToday && (
                      <span className="absolute top-0 right-12 translate-y-[-50%] bg-rose-500 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-sm shadow-xs animate-pulse">
                        TODAY!
                      </span>
                    )}
                    {isVeryUpcoming && !isToday && (
                      <span className="absolute top-0 right-12 translate-y-[-50%] bg-indigo-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-sm shadow-xs">
                        Upcoming
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-xs border ${badgeClass}`}>
                          {event.category === 'eid' ? 'Festival' : event.category === 'ramadan' ? 'Ramadan' : event.category === 'nights' ? 'Holy Night' : 'Observance'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 font-bold">
                          {event.hijriDate}
                        </div>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug">
                        {event.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-none">
                        {event.englishName}
                      </p>
                      
                      {/* Linear progress approximation */}
                      <div className="mt-4 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${indicatorColor}`}
                          style={{ width: `${Math.max(5, Math.min(100, ((354 - event.daysRemaining) / 354) * 100))}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {isToday ? (
                          <div className="flex items-center gap-1 text-rose-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                            <span className="font-black text-sm tracking-tight">Today</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-black text-slate-900 leading-none">
                              {event.daysRemaining}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight ml-0.5">
                              days
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] font-mono font-medium text-slate-400 block mt-0.5">
                          {gregFormatted}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`copy-btn-${event.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            copyShareText(event);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xs transition-colors cursor-pointer"
                          title="Copy details to share"
                        >
                          {copiedId === event.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <div className="p-1 px-1.5 bg-slate-50 text-slate-400 rounded-xs hover:text-indigo-600 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Explanation Side Pane */}
        {selectedEventId && activeEventDetails && (
          <div className="col-span-12 lg:col-span-4 border border-indigo-100 bg-[#FAF9FD]/50 rounded-xs p-6 flex flex-col justify-between shadow-xs sticky top-24 self-start">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-indigo-50/85 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 font-mono">Insight Docket</span>
                </div>
                <button
                  id="close-pane-btn"
                  onClick={() => setSelectedEventId(null)}
                  className="px-2 py-1 text-[10px] hover:bg-indigo-100 text-indigo-700 bg-indigo-50 transition-colors uppercase font-black tracking-widest rounded-xs cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="mb-4">
                <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-xs border border-indigo-200">
                  {HIJRI_MONTHS[activeEventDetails.month - 1]?.name} ({activeEventDetails.month})
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2 mb-0.5 tracking-tight">
                  {activeEventDetails.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium font-mono">
                  {activeEventDetails.englishName}
                </span>
              </div>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="bg-white p-3 rounded-xs border border-slate-150">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Target Coordinates</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Hijri Target</span>
                      <span className="font-extrabold text-indigo-950 font-mono">
                        {activeEventDetails.hijriDate} {activeEventDetails.hijriYear} AH
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Gregorian Estimate</span>
                      <span className="font-extrabold text-slate-900 font-mono">
                        {activeEventDetails.gregorianDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Description</span>
                  <p className="leading-relaxed font-light text-slate-600 bg-white p-3 rounded-xs border border-slate-150">
                    {activeEventDetails.description}
                  </p>
                </div>

                {activeEventDetails.virtues && (
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-450 block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3" /> Historical Merit & Customs
                    </span>
                    <blockquote className="italic border-l-2 border-indigo-400 pl-3 py-1 text-[11px] text-slate-500/90 leading-relaxed bg-white/70 rounded-r-xs p-1">
                      {activeEventDetails.virtues}
                    </blockquote>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-150 flex flex-col gap-2.5">
              <button
                id="pane-share-copy-btn"
                onClick={() => copyShareText(activeEventDetails)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedId === activeEventDetails.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Details Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Shareable Summary
                  </>
                )}
              </button>

              <div className="flex items-start gap-1 pb-1">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-none" />
                <p className="text-[10px] text-slate-400 leading-normal font-light">
                  Because lunar calculations depend on regional crescent sightings (Hilal), the physical Gregorian dates may shift by &plusmn;1 day.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
