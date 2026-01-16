import { format, parseISO } from 'date-fns';
import { es, enUS, fr, ptBR } from 'date-fns/locale';
import { DateFormat, COUNTRIES } from '@/data/countries';
import { Language } from '@/i18n';

const localeMap = {
  es: es,
  en: enUS,
  fr: fr,
  pt: ptBR,
};

export function getDateLocale(language: Language) {
  return localeMap[language] || es;
}

export function formatDateByCountry(
  date: Date | string,
  countryCode: string,
  language: Language = 'es'
): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const country = COUNTRIES.find(c => c.code === countryCode);
  const dateFormat = country?.dateFormat || 'DD/MM/YYYY';
  const locale = getDateLocale(language);

  // Convert our format to date-fns format
  const formatMap: Record<DateFormat, string> = {
    'DD/MM/YYYY': 'dd/MM/yyyy',
    'MM/DD/YYYY': 'MM/dd/yyyy',
    'YYYY-MM-DD': 'yyyy-MM-dd',
  };

  return format(parsedDate, formatMap[dateFormat], { locale });
}

export function formatDateShort(
  date: Date | string,
  language: Language = 'es'
): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const locale = getDateLocale(language);
  return format(parsedDate, 'dd MMM', { locale });
}

export function formatDateLong(
  date: Date | string,
  language: Language = 'es'
): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const locale = getDateLocale(language);
  return format(parsedDate, 'dd MMMM yyyy', { locale });
}

export function formatCurrency(
  amount: number,
  currencySymbol: string,
  countryCode: string
): string {
  // For US and Canada, format with commas for thousands
  if (countryCode === 'US' || countryCode === 'CA') {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // For most Latin American countries, use period for thousands and comma for decimals
  return `${currencySymbol}${amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
