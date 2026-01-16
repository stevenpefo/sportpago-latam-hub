import { Country } from '@/types';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface ExtendedCountry extends Country {
  dateFormat: DateFormat;
  region: 'latam' | 'north-america';
}

export const COUNTRIES: ExtendedCountry[] = [
  // North America
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', flag: '🇺🇸', dateFormat: 'MM/DD/YYYY', region: 'north-america' },
  { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$', flag: '🇨🇦', dateFormat: 'YYYY-MM-DD', region: 'north-america' },
  
  // Latin America
  { code: 'AR', name: 'Argentina', currency: 'ARS', currencySymbol: '$', flag: '🇦🇷', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', currencySymbol: 'Bs', flag: '🇧🇴', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$', flag: '🇧🇷', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'CL', name: 'Chile', currency: 'CLP', currencySymbol: '$', flag: '🇨🇱', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'CO', name: 'Colombia', currency: 'COP', currencySymbol: '$', flag: '🇨🇴', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'CR', name: 'Costa Rica', currency: 'CRC', currencySymbol: '₡', flag: '🇨🇷', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'CU', name: 'Cuba', currency: 'CUP', currencySymbol: '$', flag: '🇨🇺', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'DO', name: 'República Dominicana', currency: 'DOP', currencySymbol: 'RD$', flag: '🇩🇴', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'EC', name: 'Ecuador', currency: 'USD', currencySymbol: '$', flag: '🇪🇨', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'SV', name: 'El Salvador', currency: 'USD', currencySymbol: '$', flag: '🇸🇻', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', currencySymbol: 'Q', flag: '🇬🇹', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'HN', name: 'Honduras', currency: 'HNL', currencySymbol: 'L', flag: '🇭🇳', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'MX', name: 'México', currency: 'MXN', currencySymbol: '$', flag: '🇲🇽', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'NI', name: 'Nicaragua', currency: 'NIO', currencySymbol: 'C$', flag: '🇳🇮', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'PA', name: 'Panamá', currency: 'PAB', currencySymbol: 'B/.', flag: '🇵🇦', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'PY', name: 'Paraguay', currency: 'PYG', currencySymbol: '₲', flag: '🇵🇾', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'PE', name: 'Perú', currency: 'PEN', currencySymbol: 'S/', flag: '🇵🇪', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'PR', name: 'Puerto Rico', currency: 'USD', currencySymbol: '$', flag: '🇵🇷', dateFormat: 'MM/DD/YYYY', region: 'latam' },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', currencySymbol: '$U', flag: '🇺🇾', dateFormat: 'DD/MM/YYYY', region: 'latam' },
  { code: 'VE', name: 'Venezuela', currency: 'VES', currencySymbol: 'Bs', flag: '🇻🇪', dateFormat: 'DD/MM/YYYY', region: 'latam' },
];

// Payment methods by region
export const PAYMENT_METHODS_BY_COUNTRY: Record<string, { id: string; nombre: string; icono: string }[]> = {
  US: [
    { id: 'cash', nombre: 'Cash', icono: 'banknote' },
    { id: 'zelle', nombre: 'Zelle', icono: 'smartphone' },
    { id: 'venmo', nombre: 'Venmo', icono: 'wallet' },
    { id: 'credit-card', nombre: 'Credit Card', icono: 'credit-card' },
    { id: 'bank-transfer', nombre: 'Bank Transfer', icono: 'building-2' },
  ],
  CA: [
    { id: 'cash', nombre: 'Cash', icono: 'banknote' },
    { id: 'interac', nombre: 'Interac e-Transfer', icono: 'smartphone' },
    { id: 'credit-card', nombre: 'Credit Card', icono: 'credit-card' },
    { id: 'bank-transfer', nombre: 'Bank Transfer', icono: 'building-2' },
  ],
};

export const DEFAULT_PAYMENT_METHODS = [
  { id: 'efectivo', nombre: 'Efectivo', icono: 'banknote', activo: true, esPersonalizado: false },
  { id: 'transferencia', nombre: 'Transferencia Bancaria', icono: 'building-2', activo: true, esPersonalizado: false },
  { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito', icono: 'credit-card', activo: false, esPersonalizado: false },
  { id: 'billetera', nombre: 'Billetera Digital', icono: 'wallet', activo: false, esPersonalizado: false },
];

export const SPORTS = [
  'Fútbol',
  'Fútbol de Salón',
  'Baloncesto',
  'Tenis',
  'Natación',
  'Boxeo',
  'Artes Marciales',
  'GYM / Fitness',
  'Ciclismo',
  'Atletismo',
  'Voleibol',
  'Gimnasia',
  'CrossFit',
  'Yoga',
  'Pilates',
  'Danza',
  'Otros',
];

export const ATHLETE_CATEGORIES = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'infantil', label: 'Infantil' },
  { value: 'juvenil', label: 'Juvenil' },
  { value: 'adulto', label: 'Adulto' },
];
