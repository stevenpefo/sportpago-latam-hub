// SportPago Types

export type UserRole = 'admin' | 'staff';

export type SystemStatus = 'al-dia' | 'por-vencer' | 'vencido';
export type ManualStatus = 'pagado' | 'pendiente' | 'inactivo';

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
}

export interface PaymentMethod {
  id: string;
  nombre: string;
  icono: string;
  activo: boolean;
  esPersonalizado: boolean;
}

export interface Establecimiento {
  id: string;
  nombre: string;
  pais: string;
  moneda: string;
  simboloMoneda: string;
  zonaHoraria: string;
  metodosPago: PaymentMethod[];
  configuracionCompleta: boolean;
  logoUrl?: string;
  codigoClub?: string;
}

export interface AdminUser {
  id: string;
  establecimientoId: string;
  email: string;
  nombre: string;
  telefono: string;
  rol: 'admin';
  fechaRegistro: Date;
}

export interface StaffUser {
  id: string;
  establecimientoId: string;
  adminId: string;
  nombre: string;
  codigoAcceso: string;
  permisos: string[];
  activo: boolean;
  fechaInvitacion: Date;
}

export type AthleteCategory = 'principiante' | 'intermedio' | 'avanzado' | 'profesional' | 'infantil' | 'juvenil' | 'adulto';

export interface Athlete {
  id: string;
  establecimientoId: string;
  nombre: string;
  identificacion?: string;
  deporte: string;
  deportePersonalizado?: string;
  fechaNacimiento?: Date;
  categoria?: AthleteCategory;
  telefono: string;
  email: string;
  montoMensual: number;
  diaPago: number;
  ultimoPago?: Date;
  proximoPago: Date;
  estadoSistema: SystemStatus;
  estadoManual: ManualStatus;
  avatarUrl?: string;
  referidoPor?: string;
  validado?: boolean;
  agregadoPor?: string;
}

export interface Transaction {
  id: string;
  athleteId: string;
  fecha: Date;
  monto: number;
  montoPersonalizado?: number;
  mesesPagados: number;
  metodoPago: string;
  registradoPor: string;
  registradoPorNombre?: string;
  referencia?: string;
  moneda: string;
  observaciones?: string;
  comprobanteUrl?: string;
}

export interface StaffAthleteAssignment {
  staffId: string;
  athleteId: string;
}

export interface AppState {
  currentUser: AdminUser | StaffUser | null;
  establecimiento: Establecimiento | null;
  athletes: Athlete[];
  staff: StaffUser[];
  transactions: Transaction[];
  staffAssignments: StaffAthleteAssignment[];
  isAuthenticated: boolean;
  userRole: UserRole | null;
}
