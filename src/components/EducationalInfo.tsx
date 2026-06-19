import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, CalendarRange } from 'lucide-react';
import { AppLanguage } from '../types';
import { getTranslation } from '../utils/langUtils';

interface EducationalInfoProps {
  lang: AppLanguage;
}

interface InfoItem {
  title: string;
  body: string;
}

export default function EducationalInfo({ lang }: EducationalInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic localized insights
  const getInsights = (): InfoItem[] => {
    if (lang === 'ms') {
      return [
        {
          title: 'Hanyutan Agung Takwim',
          body: 'Takwim Gregorian ialah kalendar suria yang berasaskan masa bumi melengkapi satu pusingan mengiringi Matahari (~365.2425 hari). Takwim Hijrah pula merupakan kalendar lunar qamari yang bersandarkan kitaran fasa Bulan (~354.367 hari). Disebabkan tahun Hijrah adalah kira-kira 11 hari lebih pendek, bulan-bulannya hanyut ke belakang merentasi musim-musim solar dalam pusingan penuh 33 tahun solar.'
        },
        {
          title: 'Formula Tahun Lompat Kedua-dua Sistem',
          body: 'Dalam Gregorian, hari lompat (29 Februari) ditambah sekali setiap 4 tahun bagi melaraskan lebihan ~0.24 hari. Dalam Takwim Tabular sivil Islam pula, satu pusingan 30 tahun merangkumi tepat 11 tahun lompat (pada tahun ke-2, 5, 7, 10, 13, 16, 18, 21, 24, 26, dan 29) di mana satu hari ditambahkan pada akhir bulan Zulhijjah menjadikannya 30 hari daripada 29 hari.'
        },
        {
          title: 'Enjin Pengiraan & Sistem Hilal',
          body: 'Umpama enjin penyegerakan Umm al-Qura atau JAKIM, kedua-duanya menolak pergantungan melulu pada formula matematik statik. Kriteria JAKIM & MABIMS menggunakan kriteria kenampakan fizikal (Imkanur Rukyah): altitud bulan ≥ 3° dan jarak lengkung elongasi ≥ 6.4° ketika waktu Maghrib hari ke-29. Ini menyelaraskan hitungan saintifik dengan kenampakan Hilal di ufuk.'
        },
        {
          title: 'Bulan-bulan Haram & Tarikh Mulia',
          body: 'Terdapat empat bulan haram di sudut pandang Islam di mana kehormatannya amat dijaga: Muharram (1), Rajab (7), Zulkaedah (11), dan Zulhijjah (12). Ramadan (9) dikhususkan bagi kewajipan berpuasa, diikuti dengan Syawal (10) yang bermula dengan Hari Raya Aidilfitri, serta Zulhijjah (12) bagi kemuncak berpuasa Arafah dan Aidiladha.'
        }
      ];
    } else if (lang === 'ar') {
      return [
        {
          title: 'فارق الجريان والانزلاق السنوي',
          body: 'يعتمد التقويم الميلادي الشمسي على المدة التي تستغرقها الأرض للدوران دورة كاملة حول الشمس (~٣٦٥.٢٤٢٥ يوماً). بينما يعتمد التقويم الهجري القمري على استدارة حركة القمر وأهلتها (~٣٥٤.٣٦٧ يوماً). ولأن السنة الهجرية أقصر بقرابة ١١ يوماً، فإن الشهور الهجرية تنسحب وتتراجع باستمرار عبر رصيف المواسم الشمسية مرة كل ٣٣ سنة شمسية لتدور دورة كاملة.'
        },
        {
          title: 'آلية السنين الكبيسة بالدورتين',
          body: 'في التقويم الميلادي الشمسي، يضاف يوم كبيس (٢٩ فبراير) كل ٤ سنوات من أجل استيعاب فائض الساعات. بينما في التقويم الهجري الاصطلاحي، تتكون دورة حسابية تمتد لـ ٣٠ سنة تشمل ١١ سنة كبيسة (عند السنوات ٢، ٥، ٧، ١٠، ١٣، ١٦، ١٨، ٢١، ٢٤، ٢٦، و ٢٩) حيث يضاف يوم خاتم لشهر ذي الحجة ليصير ٣٠ يوماً بدلاً من ٢٩.'
        },
        {
          title: 'معايير إثبات الأهلة وحساب جاكيم',
          body: 'في ماليزيا طبقاً لتعليمات مجلس جاكيم الإقليمي (مابيمس)، يتم الاعتماد القاطع على معايير الرؤية البصرية الإمكانية الدقيقة (إمكانية الرؤية): بحيث يتطلب ثبوت الهلال ليلة الـ ٢٩ ارتفاعاً أفقياً لا يقل عن ٣ درجات واستطالة لا تقل عن ٦.٤ درجة عند ميل المغيب الشمسي. هذا يضمن انسجام الأرقام الحسابية مع الهيئة الكونية للهلال.'
        },
        {
          title: 'الأشهر الحرم والمحطات السنوية العظمى',
          body: 'تتألف السنة الهجرية من أربعة أشهر حُرُم تضاعف فيها الفضائل: المحرّم (١)، رجب (٧)، ذو القعدة (١١)، وذو الحجة (١٢). في حين اختص شهر رمضان (٩) بفريضة الصيام المبارك، ويليه مباشرة شهر شوال (١٠) المفتتح بعيد الفطر السعيد، تلوه ذريّة نسك الحج الأكبر في ذي الحجة (١٢) مع الأضحى المبارك.'
        }
      ];
    }
    
    // Default English
    return [
      {
        title: 'The Great Calendar Drift',
        body: 'The Gregorian calendar is a solar calendar based on the time it takes Earth to complete one full orbit around the Sun (~365.2425 days). The Hijri calendar is a lunar calendar based on the synodic cycles of the Moon (~354.367 days). Because a Hijri year is roughly 11 days shorter, its months drift continuously backward through the solar seasons over a 33-year cycle.'
      },
      {
        title: 'Leap Year Patterns',
        body: 'In the Gregorian calendar, a leap day (February 29) is added every 4 years to adjust for the extra ~0.24 days in a solar year. In the Tabular Islamic calendar, a cycle of 30 years is defined with exactly 11 leap years (years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, and 29), where an extra day is appended to the final month, Dhu al-Hijjah, making it 30 days instead of 29.'
      },
      {
        title: 'The Umm al-Qura & Sighting Systems',
        body: 'Unlike tabular Hijri calendars which rely purely on fixed alternate-month mathematics, the official Umm al-Qura calendar of Saudi Arabia is calculated astronomically, while Malaysia’s JAKIM uses MABIMS regional sighting criteria (Altitude ≥ 3° and Elongation ≥ 6.4° at dusk on the 29th day). Sighting systems match calculations with physical observations.'
      },
      {
        title: 'Sacred & Dynamic Months',
        body: 'Four of the twelve Hijri months are considered sacred in Islam: Muharram (1), Rajab (7), Dhu al-Qadah (11), and Dhu al-Hijjah (12). Ramadan (9) is the holy month of fasting, followed immediately by Shawwal (10), which starts with Eid al-Fitr. Dhu al-Hijjah (12) is the month of the Hajj pilgrimage and Eid al-Adha.'
      }
    ];
  };

  const insights = getInsights();

  return (
    <div id="educational-info" className="bg-white rounded-xs border border-slate-200 p-6 mt-10 transition-all duration-300">
      <button
        id="toggle-educational-insights-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2 bg-indigo-50 rounded-xs text-indigo-600">
            <BookOpen className="w-5 h-5 font-bold animate-pulse-slow" />
          </div>
          <div className="font-sans">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
              {getTranslation('edu.title', lang, 'Astronomical & Calendar Insights')}
            </h3>
            <p className="text-xs text-slate-500">
              {getTranslation('edu.desc', lang, 'Understand the mathematical science behind solar and lunar coordinate mapping')}
            </p>
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
        <div className="mt-6 pt-5 border-t border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in font-sans" id="educational-details-grid">
          {insights.map((item, idx) => (
            <div key={idx} className="bg-slate-50/55 rounded-xs p-5 border border-slate-205 hover:bg-slate-50 transition-all duration-300">
              <span className="block text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-2 uppercase tracking-wide">
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
