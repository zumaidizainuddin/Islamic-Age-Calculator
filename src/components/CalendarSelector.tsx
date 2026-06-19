import React from 'react';
import { CalendarType, CalendarOption, AppLanguage } from '../types';
import { Sparkles, Calendar } from 'lucide-react';
import { getTranslation } from '../utils/langUtils';

interface CalendarSelectorProps {
  selectedType: CalendarType;
  onChange: (type: CalendarType) => void;
  hijriOffset: number;
  onHijriOffsetChange: (offset: number) => void;
  lang: AppLanguage;
}

export default function CalendarSelector({ selectedType, onChange, hijriOffset, onHijriOffsetChange, lang }: CalendarSelectorProps) {
  const variationOptions = [
    {
      id: 'islamic-umalqura' as CalendarType,
      name: getTranslation('selector.umalqura.name', lang, 'Umm al-Qura'),
      description: getTranslation('selector.umalqura.desc', lang, 'Umm al-Qura standard')
    },
    {
      id: 'islamic-jakim' as CalendarType,
      name: getTranslation('selector.jakim.name', lang, 'JAKIM Malaysia (MABIMS)'),
      description: getTranslation('selector.jakim.desc', lang, 'JAKIM standard')
    },
    {
      id: 'islamic-civil' as CalendarType,
      name: getTranslation('selector.civil.name', lang, 'Islamic Civil (Tabular)'),
      description: getTranslation('selector.civil.desc', lang, 'Islamic Civil tabular')
    },
    {
      id: 'islamic-tbla' as CalendarType,
      name: getTranslation('selector.tbla.name', lang, 'Tabular Classical (Tbla)'),
      description: getTranslation('selector.tbla.desc', lang, 'Classical tabular')
    }
  ];

  return (
    <div id="calendar-selector-container" className="bg-white rounded-xs border border-slate-200 shadow-xs p-6 transition-all duration-300">
      <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100">
        <div className="p-2 bg-indigo-550/10 rounded-xs text-indigo-600">
          <Calendar className="w-5 h-5 font-bold" id="calendar-selector-icon" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
            {getTranslation('selector.title', lang, 'Calendar Engine Configuration')}
          </h2>
          <p className="text-xs text-slate-500">
            {getTranslation('selector.subtitle', lang, 'Select computation ruleset for Islamic dates')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {variationOptions.map((option) => {
          const isSelected = selectedType === option.id;
          return (
            <button
              key={option.id}
              id={`calendar-sub-engine-btn-${option.id}`}
              onClick={() => onChange(option.id)}
              className={`flex flex-col text-left p-4 rounded-xs border transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50/45 border-indigo-550 shadow-xs ring-1 ring-indigo-600/20'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-350'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {option.name}
                </span>
                {isSelected && (
                  <span className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-xs">
                    <Sparkles className="w-2.5 h-2.5" /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-550 leading-relaxed font-light">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Moon Sighting Hilal Correction Tool */}
      <div className="mt-6 pt-5 border-t border-slate-150">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 font-bold" />
              {getTranslation('selector.offsetLabel', lang, 'Manual Adjustment (Days)')}
            </h3>
            <p className="text-[11px] text-slate-500 max-w-xl font-light mt-1">
              {getTranslation('selector.offsetHelp', lang, 'Local atmospheric visualization or direct crescent observation often shifts the 1st of the Hijri month.')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xs border border-slate-200">
            {[-2, -1, 0, 1, 2].map((val) => {
              const isOffsetActive = hijriOffset === val;
              return (
                <button
                  key={val}
                  id={`sighting-offset-btn-${val}`}
                  type="button"
                  onClick={() => onHijriOffsetChange(val)}
                  className={`px-3 py-1.5 font-mono text-[10px] font-bold rounded-xs transition-all cursor-pointer ${
                    isOffsetActive
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {val === 0 ? '0 (STD)' : val > 0 ? `+${val}d` : `${val}d`}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
