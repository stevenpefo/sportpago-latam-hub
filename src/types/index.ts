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

export interface Athlete {
  id: string;
  establecimientoId: string;
  nombre: string;
  identificacion?: string;
  deporte: string;
  telefono: string;
  email: string;
  montoMensual: number;
  diaPago: number;
  ultimoPago?: Date;
  proximoPago: Date;
  estadoSistema: SystemStatus;
  estadoManual: ManualStatus;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  athleteId: string;
  fecha: Date;
  monto: number;
  metodoPago: string;
  registradoPor: string;
  referencia?: string;
  moneda: string;
  observaciones?: string;
}

export interface AppState {
  currentUser: AdminUser | StaffUser | null;
  establecimiento: Establecimiento | null;
  athletes: Athlete[];
  staff: StaffUser[];
  transactions: Transaction[];
  isAuthenticated: boolean;
  userRole: UserRole | null;
}
