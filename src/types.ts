export interface HijriDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-30
}

export interface GregorianDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export type CalendarType = 'islamic-umalqura' | 'islamic-civil' | 'islamic-tbla' | 'islamic-jakim';

export interface CalendarOption {
  id: CalendarType;
  name: string;
  description: string;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export interface MonthInfo {
  index: number;
  name: string;
  arabicName: string;
}
