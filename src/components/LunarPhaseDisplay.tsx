import React from 'react';
import { getLunarPhaseInfo } from '../utils/calendarUtils';
import { AppLanguage } from '../types';
import { getTranslation } from '../utils/langUtils';

interface LunarPhaseDisplayProps {
  hijriDay: number;
  hijriMonthName: string;
  lang: AppLanguage;
}

export default function LunarPhaseDisplay({ hijriDay, hijriMonthName, lang }: LunarPhaseDisplayProps) {
  const { iconType, percentage, phaseName } = getLunarPhaseInfo(hijriDay);

  const getLocalizedPhaseName = () => {
    return getTranslation(`moon.${iconType}`, lang, phaseName);
  };

  // Generate dynamic SVG to represent the exact lunar phase
  // We can draw a beautiful stylized moon using SVG paths depending on the Hijri day.
  const renderMoonGraphics = () => {
    // Standard size 80x80
    // If Day is 15 (Full Moon), it's a full circle of light.
    // If Day is 1 (New Moon), it's a dark circle.
    // For intermediate days, we can draw a composite crescent/gibbous shadow overlapping.
    const isWaning = hijriDay > 15;
    
    // Simple, extremely elegant representation:
    // A background dark circle representing the unilluminated moon.
    // A foreground path of bright light reflecting the phase.
    let rxValue = 40;
    let sweepFlag = 1; // 1 for waxing (light on right), 0 for waning (light on left)
    
    if (hijriDay === 15) {
      // Full
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse-slow">
          <circle cx="50" cy="50" r="40" fill="url(#fullMoonGrad)" />
          <circle cx="50" cy="50" r="40" stroke="#fef08a" strokeWidth="1" fill="none" opacity="0.3" />
        </svg>
      );
    }
    
    if (hijriDay === 1 || hijriDay >= 29) {
      // New Moon / Dark
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20 opacity-90">
          <circle cx="50" cy="50" r="40" fill="url(#newMoonGrad)" />
          {/* Subtle sliver of light for Hilal on day 29/30/1 */}
          <path d="M 50 10 A 40 40 0 0 1 54 90 A 38 40 0 0 0 50 10 Z" fill="#fef08a" opacity="0.4" />
        </svg>
      );
    }

    // Mathematical modeling for waxing/waning crescent and gibbous phases
    // We warp the lighting using 3D elliptical shadow overlay
    const fraction = hijriDay <= 15 ? (hijriDay - 1) / 14 : (29.5 - hijriDay) / 14.5;
    const rX = Math.abs(40 - 80 * fraction);
    const wideArc = fraction > 0.5 ? 1 : 0;
    
    // Left side arc is always the semi-circle on one side, and the middle warped ellipse on the other.
    let dLight = "";
    if (hijriDay < 15) {
      // Waxing: light is on the right.
      // Semi-circle on the right (from top (50,10) to bottom (50,90) on the right side)
      // Ellipse returning from bottom (50,90) to top (50,10)
      if (fraction <= 0.5) {
        // Crescent: ellipse curves to the right (same side as outer edge)
        dLight = `M 50 10 A 40 40 0 0 1 50 90 A ${rX} 40 0 0 0 50 10 Z`;
      } else {
        // Gibbous: ellipse curves to the left (opposite side)
        dLight = `M 50 10 A 40 40 0 0 1 50 90 A ${rX} 40 0 0 1 50 10 Z`;
      }
    } else {
      // Waning: light is on the left.
      // Semi-circle on the left (from top (50,10) to bottom (50,90) on the left side)
      if (fraction <= 0.5) {
        // Crescent: ellipse curves to the left
        dLight = `M 50 10 A 40 40 0 0 0 50 90 A ${rX} 40 0 0 1 50 10 Z`;
      } else {
        // Gibbous: ellipse curves to the right
        dLight = `M 50 10 A 40 40 0 0 0 50 90 A ${rX} 40 0 0 0 50 10 Z`;
      }
    }

    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[0_0_10px_rgba(253,224,71,0.25)]">
        <defs>
          <radialGradient id="fullMoonGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="70%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>
          <radialGradient id="newMoonGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>
        {/* Background dark disk of Moon */}
        <circle cx="50" cy="50" r="40" fill="url(#newMoonGrad)" />
        {/* Glowing illuminated segment */}
        <path d={dLight} fill="url(#fullMoonGrad)" />
        {/* Fine orbital ring outline */}
        <circle cx="50" cy="50" r="40" stroke="#ca8a04" strokeWidth="0.5" fill="none" opacity="0.2" />
      </svg>
    );
  };

  const getDayPrefix = () => {
    if (lang === 'ms') return 'Hari';
    if (lang === 'ar') return 'اليوم';
    return 'Day';
  };

  return (
    <div id="lunar-phase-container" className="bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 rounded-xs p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
      {/* Absolute decorative star accents */}
      <div className="absolute top-4 right-10 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-white rounded-full opacity-20 animate-ping"></div>
      <div className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-white rounded-full opacity-40"></div>

      <div className="flex-shrink-0 relative flex items-center justify-center p-2 bg-slate-900/65 rounded-full border border-slate-800 shadow-inner">
        {renderMoonGraphics()}
        <div className="absolute bottom-1 bg-indigo-600 text-white font-mono font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md leading-none border border-indigo-400">
          {getDayPrefix()} {hijriDay}
        </div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-[0.16em] text-indigo-400 font-black uppercase">
            {getTranslation('moon.title', lang, 'Lunar Alignment')}
          </span>
          <span className="text-[9px] bg-slate-800 text-slate-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded-xs border border-slate-700/50 uppercase">
            {Math.round(percentage)}% {lang === 'ms' ? 'Bercahaya' : lang === 'ar' ? 'مضاء' : 'Illuminated'}
          </span>
        </div>
        
        <h3 className="text-xl font-extrabold font-sans text-white tracking-tight mb-2">
          {getLocalizedPhaseName()}
        </h3>
        
        <p className="text-xs text-slate-400 leading-relaxed max-w-lg font-light">
          {lang === 'ms' ? (
            <>
              Bulan dalam Takwim Islam <strong className="text-indigo-300 font-bold">{hijriMonthName}</strong> dikaitkan secara langsung dengan kitaran fasa bulan. Kitaran bermula dengan kenampakan sabit nipis <strong className="text-amber-300 font-normal">Hilal</strong> (Hari 1-2), mencapai fasa penuh <strong className="text-amber-300 font-normal">Badr</strong> (Hari 14-15), dan menyusut kembali sehingga bermula kitaran baharu.
            </>
          ) : lang === 'ar' ? (
            <>
              يرتبط الشهر الهجري <strong className="text-indigo-300 font-bold">{hijriMonthName}</strong> ارتباطاً وثيقاً ومباشراً بالدورة القمريّة. حيث يستهل الشهر برؤية هلال <strong className="text-amber-300 font-normal">الهلال</strong> الخفيف (اليوم ١-٢)، ويتكامل ضياءً عند فورة <strong className="text-amber-300 font-normal">البدر</strong> (اليوم ١٤-١٥)، ثم يذبل تدريجياً حتى يبدأ دورة تالية.
            </>
          ) : (
            <>
              The Islamic Calendar month of <strong className="text-indigo-300 font-bold">{hijriMonthName}</strong> is directly synchronization-linked to the lunar cycle. The month begins with the sight of the thin crescent <strong className="text-amber-300 font-normal">Hilal</strong> (Day 1-2), reaches full illumination <strong className="text-amber-300 font-normal">Badr</strong> (Day 14-15), and dims until starting anew.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
