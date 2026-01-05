import { Country } from '@/types';

export const COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina', currency: 'ARS', currencySymbol: '$', flag: '🇦🇷' },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', currencySymbol: 'Bs', flag: '🇧🇴' },
  { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', currency: 'CLP', currencySymbol: '$', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', currency: 'COP', currencySymbol: '$', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', currency: 'CRC', currencySymbol: '₡', flag: '🇨🇷' },
  { code: 'CU', name: 'Cuba', currency: 'CUP', currencySymbol: '$', flag: '🇨🇺' },
  { code: 'DO', name: 'República Dominicana', currency: 'DOP', currencySymbol: 'RD$', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', currency: 'USD', currencySymbol: '$', flag: '🇪🇨' },
  { code: 'SV', name: 'El Salvador', currency: 'USD', currencySymbol: '$', flag: '🇸🇻' },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', currencySymbol: 'Q', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', currency: 'HNL', currencySymbol: 'L', flag: '🇭🇳' },
  { code: 'MX', name: 'México', currency: 'MXN', currencySymbol: '$', flag: '🇲🇽' },
  { code: 'NI', name: 'Nicaragua', currency: 'NIO', currencySymbol: 'C$', flag: '🇳🇮' },
  { code: 'PA', name: 'Panamá', currency: 'PAB', currencySymbol: 'B/.', flag: '🇵🇦' },
  { code: 'PY', name: 'Paraguay', currency: 'PYG', currencySymbol: '₲', flag: '🇵🇾' },
  { code: 'PE', name: 'Perú', currency: 'PEN', currencySymbol: 'S/', flag: '🇵🇪' },
  { code: 'PR', name: 'Puerto Rico', currency: 'USD', currencySymbol: '$', flag: '🇵🇷' },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', currencySymbol: '$U', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', currency: 'VES', currencySymbol: 'Bs', flag: '🇻🇪' },
];

export const DEFAULT_PAYMENT_METHODS = [
  { id: 'efectivo', nombre: 'Efectivo', icono: 'banknote', activo: true, esPersonalizado: false },
  { id: 'transferencia', nombre: 'Transferencia Bancaria', icono: 'building-2', activo: true, esPersonalizado: false },
  { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito', icono: 'credit-card', activo: false, esPersonalizado: false },
  { id: 'billetera', nombre: 'Billetera Digital', icono: 'wallet', activo: false, esPersonalizado: false },
];

export const SPORTS = [
  'Fútbol',
  'Baloncesto',
  'Voleibol',
  'Natación',
  'Tenis',
  'Atletismo',
  'Gimnasia',
  'Artes Marciales',
  'Boxeo',
  'Ciclismo',
  'CrossFit',
  'Yoga',
  'Pilates',
  'Danza',
  'Otro',
];
