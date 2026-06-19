import { HijriDate, GregorianDate, CalendarType, AgeResult } from '../types';

export const HIJRI_MONTHS = [
  { index: 1, name: 'Muharram', arabicName: 'المحرّم' },
  { index: 2, name: 'Safar', arabicName: 'صفر' },
  { index: 3, name: 'Rabi\' al-Awwal', arabicName: 'ربيع الأول' },
  { index: 4, name: 'Rabi\' ath-Thani', arabicName: 'ربيع الثاني' },
  { index: 5, name: 'Jumada al-Ula', arabicName: 'جمادى الأولى' },
  { index: 6, name: 'Jumada al-Akhirah', arabicName: 'جمادى الآخرة' },
  { index: 7, name: 'Rajab', arabicName: 'رجب' },
  { index: 8, name: 'Sha\'ban', arabicName: 'شعبان' },
  { index: 9, name: 'Ramadan', arabicName: 'رمضان' },
  { index: 10, name: 'Shawwal', arabicName: 'شوال' },
  { index: 11, name: 'Dhu al-Qadah', arabicName: 'ذو القعدة' },
  { index: 12, name: 'Dhu al-Hijjah', arabicName: 'ذو الحجة' },
];

export const GREGORIAN_MONTHS = [
  { index: 1, name: 'January', arabicName: 'يناير' },
  { index: 2, name: 'February', arabicName: 'فبراير' },
  { index: 3, name: 'March', arabicName: 'مارس' },
  { index: 4, name: 'April', arabicName: 'أبريل' },
  { index: 5, name: 'May', arabicName: 'مايو' },
  { index: 6, name: 'June', arabicName: 'يونيو' },
  { index: 7, name: 'July', arabicName: 'يوليو' },
  { index: 8, name: 'August', arabicName: 'أغسطس' },
  { index: 9, name: 'September', arabicName: 'سبتمبر' },
  { index: 10, name: 'October', arabicName: 'أكتوبر' },
  { index: 11, name: 'November', arabicName: 'نوفمبر' },
  { index: 12, name: 'December', arabicName: 'ديسمبر' },
];

// Helper to check if a Gregorian year is leap
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Get days in a Gregorian month
export function getDaysInGregorianMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// High-fidelity converter using browser Intl API
export function getHijriDateFromGregorian(date: Date, calendarType: CalendarType = 'islamic-umalqura', hijriOffset: number = 0): HijriDate {
  let targetCalendar = calendarType;
  let appliedOffset = hijriOffset;

  if (calendarType === 'islamic-jakim') {
    targetCalendar = 'islamic-umalqura';
    appliedOffset = hijriOffset - 1; // JAKIM/MABIMS typically runs 1 day behind Saudi astronomical Umm al-Qura
  }

  try {
    const formatter = new Intl.DateTimeFormat(`en-US-u-ca-${targetCalendar}`, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC'
    });

    // Create Date strictly offset by appliedOffset days using local date parts to avoid timezone shift
    const shiftedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + appliedOffset);
    const utcDate = new Date(Date.UTC(shiftedDate.getFullYear(), shiftedDate.getMonth(), shiftedDate.getDate()));
    const parts = formatter.formatToParts(utcDate);

    let year = NaN;
    let month = NaN;
    let day = NaN;

    for (const part of parts) {
      if (part.type === 'year') {
        year = parseInt(part.value.replace(/\D/g, ''), 10);
      } else if (part.type === 'month') {
        month = parseInt(part.value.replace(/\D/g, ''), 10);
      } else if (part.type === 'day') {
        day = parseInt(part.value.replace(/\D/g, ''), 10);
      }
    }

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return { year, month, day };
    }
  } catch (e) {
    console.warn("Intl call failed, falling back to tabular algorithm", e);
  }

  // Fallback to Tabular civil algorithm if Intl is unavailable or fails
  const shiftedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + appliedOffset);
  const jd = dateToJulian(shiftedDate.getFullYear(), shiftedDate.getMonth() + 1, shiftedDate.getDate());
  return julianToHijri(jd);
}

// Converts Hijri to Gregorian using rapid Bisection / Binary search
export function hijriToGregorian(hYear: number, hMonth: number, hDay: number, calendarType: CalendarType = 'islamic-umalqura', hijriOffset: number = 0): Date {
  let targetCalendar = calendarType;
  let appliedOffset = hijriOffset;

  if (calendarType === 'islamic-jakim') {
    targetCalendar = 'islamic-umalqura';
    appliedOffset = hijriOffset - 1;
  }

  const estimatedGregorianFraction = (hYear - 1) * 0.970225 + (hMonth - 1) * 0.08085 + 622.54;
  const estimatedYear = Math.floor(estimatedGregorianFraction);
  const estimatedMonthFraction = estimatedGregorianFraction - estimatedYear;
  const estimatedMonth = Math.max(0, Math.min(11, Math.floor(estimatedMonthFraction * 12)));
  const estimatedDay = Math.max(1, Math.min(28, hDay));
  
  // Create search boundaries centered on highly precise estimate using local Date
  const centerDate = new Date(estimatedYear, estimatedMonth, estimatedDay, 12, 0, 0);
  
  let lowDays = -100;
  let highDays = 100;
  
  let bestCandidate = 0;
  let minDiff = Infinity;

  // Binary search to find the Gregorian day that formats exactly to the target Hijri Date
  while (lowDays <= highDays) {
    const midDays = Math.floor((lowDays + highDays) / 2);
    const testDate = new Date(estimatedYear, estimatedMonth, estimatedDay + midDays, 12, 0, 0);
    const h = getHijriDateFromGregorian(testDate, targetCalendar, 0); // Must use 0 offset inside the raw lookup
    
    if (h.year === hYear && h.month === hMonth && h.day === hDay) {
      // Return a local Date representation at 12:00:00 (midday) and apply offset
      return new Date(estimatedYear, estimatedMonth, estimatedDay + midDays - appliedOffset, 12, 0, 0);
    }
    
    // Calculate difference metrics for approximation in case date is physically impossible (e.g. 30th day on a 29-day month)
    const currentDiff = Math.abs((h.year - hYear) * 354 + (h.month - hMonth) * 29.5 + (h.day - hDay));
    if (currentDiff < minDiff) {
      minDiff = currentDiff;
      bestCandidate = midDays;
    }
    
    // Hierarchy compare to adjust binary range
    let isTargetLater = false;
    if (h.year < hYear) {
      isTargetLater = true;
    } else if (h.year > hYear) {
      isTargetLater = false;
    } else if (h.month < hMonth) {
      isTargetLater = true;
    } else if (h.month > hMonth) {
      isTargetLater = false;
    } else if (h.day < hDay) {
      isTargetLater = true;
    } else {
      isTargetLater = false;
    }
    
    if (isTargetLater) {
      lowDays = midDays + 1;
    } else {
      highDays = midDays - 1;
    }
  }
  
  // Return the closest matching physical date if exact target is impossible, applying offset
  return new Date(estimatedYear, estimatedMonth, estimatedDay + bestCandidate - appliedOffset, 12, 0, 0);
}

// Check how many days are in a given Hijri Month dynamics
export function getDaysInHijriMonth(year: number, month: number, calendarType: CalendarType = 'islamic-umalqura', hijriOffset: number = 0): number {
  if (month < 1 || month > 12) return 29;
  
  const gCurrent = hijriToGregorian(year, month, 1, calendarType, hijriOffset);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const gNext = hijriToGregorian(nextYear, nextMonth, 1, calendarType, hijriOffset);
  
  const days = Math.round((gNext.getTime() - gCurrent.getTime()) / (24 * 60 * 60 * 1000));
  // Standard bounds are [29, 30]
  if (days >= 29 && days <= 30) {
    return days;
  }
  
  // Fallback to alternating months if result is out of physical bounds
  return month % 2 === 1 ? 30 : 29;
}

// Convert Gregorian to Julian Day Number (JDN)
export function dateToJulian(y: number, m: number, d: number): number {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = Math.floor(A / 4);
  const C = 2 - A + B;
  const E = Math.floor(365.25 * (y + 4716));
  const F = Math.floor(30.6001 * (m + 1));
  return C + d + E + F - 1524.5;
}

// Convert Hijri to JDN (Tabular Calendar)
export function hijriToJulian(year: number, month: number, day: number): number {
  return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((30 * year + 3) / 30) + 1948439 - 1;
}

// Convert JDN to Hijri (Tabular Calendar)
export function julianToHijri(jd: number): HijriDate {
  jd = Math.floor(jd) + 0.5;
  const epoch = 1948439.5;
  const days = jd - epoch;
  const year = Math.floor((days * 30 + 10646) / 10631) + 1;
  const daysInYear = Math.floor(days - Math.floor((year - 1) * 354 + Math.floor((30 * year + 3) / 30)));
  const month = Math.min(12, Math.floor((daysInYear * 30 + 583) / 885) + 1);
  const day = daysInYear - Math.ceil(29.5 * (month - 1)) + 1;
  return { year, month, day };
}

// Calculate age in Gregorian
export function calculateGregorianAge(birth: Date, end: Date): AgeResult {
  // Reset timestamps to midnight to avoid hours differences causing drift
  const birthMidnight = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  let years = endMidnight.getFullYear() - birthMidnight.getFullYear();
  let months = endMidnight.getMonth() - birthMidnight.getMonth();
  let days = endMidnight.getDate() - birthMidnight.getDate();
  
  if (days < 0) {
    months -= 1;
    // Get days in previous month
    const prevMonthEnd = new Date(endMidnight.getFullYear(), endMidnight.getMonth(), 0);
    days += prevMonthEnd.getDate();
  }
  
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  const totalDays = Math.floor((endMidnight.getTime() - birthMidnight.getTime()) / (24 * 60 * 60 * 1000));
  
  return { years, months, days, totalDays: Math.max(0, totalDays) };
}

// Calculate age in Hijri
export function calculateHijriAge(birth: Date, end: Date, calendarType: CalendarType = 'islamic-umalqura', hijriOffset: number = 0): AgeResult {
  const hBirth = getHijriDateFromGregorian(birth, calendarType, hijriOffset);
  const hEnd = getHijriDateFromGregorian(end, calendarType, hijriOffset);
  
  let years = hEnd.year - hBirth.year;
  let months = hEnd.month - hBirth.month;
  let days = hEnd.day - hBirth.day;
  
  if (days < 0) {
    months -= 1;
    let prevMonth = hEnd.month - 1;
    let prevYear = hEnd.year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const daysInPrev = getDaysInHijriMonth(prevYear, prevMonth, calendarType, hijriOffset);
    days += daysInPrev;
  }
  
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  const totalDays = Math.floor((end.getTime() - birth.getTime()) / (24 * 60 * 60 * 1000));
  
  return { years, months, days, totalDays: Math.max(0, totalDays) };
}

// Countdown to the next standard card birthday
export function getNextGregorianBirthday(birth: Date, today: Date): { date: Date, daysRemaining: number } {
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) {
    next.setFullYear(today.getFullYear() + 1);
  }
  const diffTime = next.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (24 * 60 * 60 * 1000));
  return { date: next, daysRemaining };
}

// Countdown to the next Hijri anniversary birthdate
export function getNextHijriBirthday(birth: Date, today: Date, calendarType: CalendarType = 'islamic-umalqura', hijriOffset: number = 0): { date: Date, daysRemaining: number, hijriDate: HijriDate } {
  const hBirth = getHijriDateFromGregorian(birth, calendarType, hijriOffset);
  const hToday = getHijriDateFromGregorian(today, calendarType, hijriOffset);
  
  let targetHijriYear = hToday.year;
  let targetGregorian = hijriToGregorian(targetHijriYear, hBirth.month, hBirth.day, calendarType, hijriOffset);
  
  // If the birthday is in past in terms of physical solar time, step up year
  // Create midnight timestamps for solid comparisons
  const targetMidnight = new Date(targetGregorian.getFullYear(), targetGregorian.getMonth(), targetGregorian.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  if (targetMidnight < todayMidnight) {
    targetHijriYear += 1;
    targetGregorian = hijriToGregorian(targetHijriYear, hBirth.month, hBirth.day, calendarType, hijriOffset);
  }
  
  const targetMidnightFinal = new Date(targetGregorian.getFullYear(), targetGregorian.getMonth(), targetGregorian.getDate());
  const diffTime = targetMidnightFinal.getTime() - todayMidnight.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (24 * 60 * 60 * 1000)));
  
  return {
    date: targetGregorian,
    daysRemaining,
    hijriDate: { year: targetHijriYear, month: hBirth.month, day: hBirth.day }
  };
}

// Determine lunar phase illumination rating from Hijri day
// Since Hijri months are perfectly bound to the lunar cycle:
// - Day 1 is New Moon (minimal visibility)
// - Day 14/15 is Full Moon (maximum illumination)
// - Day 29/30 is near astronomical dark
export function getLunarPhaseInfo(hijriDay: number): { phaseName: string, iconType: string, percentage: number } {
  // Normalizing to a 29.53 day cycle
  const day = Math.max(1, Math.min(30, hijriDay));
  
  if (day === 1) {
    return { phaseName: 'New Moon (Hilal / Crescent)', iconType: 'new', percentage: 1 };
  } else if (day > 1 && day <= 6) {
    return { phaseName: 'Waxing Crescent (Hilal)', iconType: 'wax_crescent', percentage: Math.round((day / 7.4) * 50) };
  } else if (day >= 7 && day <= 9) {
    return { phaseName: 'First Quarter (Tarbî\')', iconType: 'first_quarter', percentage: 50 };
  } else if (day > 9 && day <= 13) {
    return { phaseName: 'Waxing Gibbous', iconType: 'wax_gibbous', percentage: 50 + Math.round(((day - 8) / 6) * 45) };
  } else if (day >= 14 && day <= 16) {
    return { phaseName: 'Full Moon (Badr)', iconType: 'full', percentage: 100 };
  } else if (day > 16 && day <= 21) {
    return { phaseName: 'Waning Gibbous', iconType: 'wan_gibbous', percentage: 100 - Math.round(((day - 15) / 6) * 45) };
  } else if (day >= 22 && day <= 24) {
    return { phaseName: 'Third Quarter (Tarbî\' Thânî)', iconType: 'third_quarter', percentage: 50 };
  } else {
    return { phaseName: 'Waning Crescent (Hilal Akhir)', iconType: 'wan_crescent', percentage: Math.max(2, Math.round(((30 - day) / 6) * 50)) };
  }
}
