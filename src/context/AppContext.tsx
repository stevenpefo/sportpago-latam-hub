import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppState, AdminUser, StaffUser, Establecimiento, Athlete, Transaction, UserRole, PaymentMethod, StaffAthleteAssignment } from '@/types';
import { DEFAULT_PAYMENT_METHODS } from '@/data/countries';
import { addDays } from 'date-fns';

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  loginStaff: (codigo: string) => Promise<boolean>;
  logout: () => void;
  setupEstablecimiento: (data: Partial<Establecimiento>) => void;
  updateEstablecimientoLogo: (logoUrl: string | null) => void;
  addAthlete: (athlete: Omit<Athlete, 'id' | 'estadoSistema'>) => void;
  updateAthlete: (id: string, data: Partial<Athlete>) => void;
  updateAthletePrices: (athleteIds: string[], newPrice: number) => void;
  deleteAthlete: (id: string) => void;
  addStaff: (staff: Omit<StaffUser, 'id' | 'codigoAcceso' | 'fechaInvitacion'>) => void;
  updateStaff: (id: string, data: Partial<StaffUser>) => void;
  deleteStaff: (id: string) => void;
  registerPayment: (
    athleteId: string, 
    metodoPago: string, 
    mesesPagados: number,
    montoPersonalizado?: number,
    referencia?: string, 
    observaciones?: string
  ) => void;
  updatePaymentMethods: (methods: PaymentMethod[]) => void;
  markAsPending: (athleteId: string) => void;
  markAsInactive: (athleteId: string) => void;
  updateStaffAssignments: (staffId: string, athleteIds: string[]) => void;
  getStaffAssignments: (staffId: string) => string[];
  customCategories: string[];
  addCustomCategory: (category: string) => void;
  enabledSports: string[];
  updateEnabledSports: (sports: string[]) => void;
  customSports: string[];
  addCustomSport: (sport: string) => void;
  deleteCustomSport: (sport: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const calculateSystemStatus = (proximoPago: Date): 'al-dia' | 'por-vencer' | 'vencido' => {
  const today = new Date();
  const diffDays = Math.ceil((proximoPago.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'vencido';
  if (diffDays <= 3) return 'por-vencer';
  return 'al-dia';
};

// Mock data for demo
const mockAthletes: Athlete[] = [
  {
    id: '1',
    establecimientoId: 'est1',
    nombre: 'Carlos Rodríguez',
    deporte: 'Fútbol',
    telefono: '+57 300 123 4567',
    email: 'carlos@email.com',
    montoMensual: 150000,
    diaPago: 5,
    ultimoPago: new Date(2025, 11, 5),
    proximoPago: new Date(2026, 0, 5),
    estadoSistema: 'al-dia',
    estadoManual: 'pagado',
  },
  {
    id: '2',
    establecimientoId: 'est1',
    nombre: 'María González',
    deporte: 'Natación',
    telefono: '+57 301 234 5678',
    email: 'maria@email.com',
    montoMensual: 180000,
    diaPago: 10,
    ultimoPago: new Date(2025, 10, 10),
    proximoPago: new Date(2026, 0, 7),
    estadoSistema: 'por-vencer',
    estadoManual: 'pendiente',
  },
  {
    id: '3',
    establecimientoId: 'est1',
    nombre: 'Andrés López',
    deporte: 'Fútbol',
    telefono: '+57 302 345 6789',
    email: 'andres@email.com',
    montoMensual: 150000,
    diaPago: 1,
    ultimoPago: new Date(2025, 10, 1),
    proximoPago: new Date(2025, 11, 28),
    estadoSistema: 'vencido',
    estadoManual: 'pendiente',
  },
  {
    id: '4',
    establecimientoId: 'est1',
    nombre: 'Laura Martínez',
    deporte: 'Gimnasia',
    telefono: '+57 303 456 7890',
    email: 'laura@email.com',
    montoMensual: 200000,
    diaPago: 15,
    ultimoPago: new Date(2025, 11, 15),
    proximoPago: new Date(2026, 0, 15),
    estadoSistema: 'al-dia',
    estadoManual: 'pagado',
  },
];

const mockStaff: StaffUser[] = [
  {
    id: 's1',
    establecimientoId: 'est1',
    adminId: 'admin1',
    nombre: 'Pedro Asistente',
    codigoAcceso: '123456',
    permisos: ['ver-deportistas', 'registrar-pagos'],
    activo: true,
    fechaInvitacion: new Date(2025, 10, 1),
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    establecimiento: null,
    athletes: [],
    staff: [],
    transactions: [],
    staffAssignments: [],
    isAuthenticated: false,
    userRole: null,
  });

  // Custom categories for the establishment
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Principiante',
    'Intermedio', 
    'Avanzado',
    'Profesional',
    'Infantil',
    'Juvenil',
    'Adulto',
  ]);

  // Enabled sports for the establishment (empty = all sports available for backward compatibility)
  const [enabledSports, setEnabledSports] = useState<string[]>([]);

  // Custom sports created by the establishment
  const [customSports, setCustomSports] = useState<string[]>([]);

  const addCustomCategory = useCallback((category: string) => {
    const trimmed = category.trim();
    if (trimmed && !customCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCustomCategories(prev => [...prev, trimmed]);
    }
  }, [customCategories]);

  const updateEnabledSports = useCallback((sports: string[]) => {
    setEnabledSports(sports);
  }, []);

  const addCustomSport = useCallback((sport: string) => {
    const trimmed = sport.trim();
    if (trimmed && !customSports.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setCustomSports(prev => [...prev, trimmed]);
      // Auto-enable the new custom sport
      setEnabledSports(prev => [...prev, trimmed]);
    }
  }, [customSports]);

  const deleteCustomSport = useCallback((sport: string) => {
    setCustomSports(prev => prev.filter(s => s !== sport));
    setEnabledSports(prev => prev.filter(s => s !== sport));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Demo login - in production, this would call Supabase auth
    if (email && password) {
      const adminUser: AdminUser = {
        id: 'admin1',
        establecimientoId: 'est1',
        email,
        nombre: 'Administrador Demo',
        telefono: '+57 300 000 0000',
        rol: 'admin',
        fechaRegistro: new Date(),
      };

      const establecimiento: Establecimiento = {
        id: 'est1',
        nombre: 'Academia Deportiva Demo',
        pais: 'CO',
        moneda: 'COP',
        simboloMoneda: '$',
        zonaHoraria: 'America/Bogota',
        metodosPago: DEFAULT_PAYMENT_METHODS,
        configuracionCompleta: true,
        diasAvisoVencimiento: 1,
      };

      setState(prev => ({
        ...prev,
        currentUser: adminUser,
        establecimiento,
        athletes: mockAthletes,
        staff: mockStaff,
        isAuthenticated: true,
        userRole: 'admin',
      }));
      return true;
    }
    return false;
  }, []);

  const loginStaff = useCallback(async (codigo: string): Promise<boolean> => {
    const staffMember = mockStaff.find(s => s.codigoAcceso === codigo && s.activo);
    if (staffMember) {
      const establecimiento: Establecimiento = {
        id: 'est1',
        nombre: 'Academia Deportiva Demo',
        pais: 'CO',
        moneda: 'COP',
        simboloMoneda: '$',
        zonaHoraria: 'America/Bogota',
        metodosPago: DEFAULT_PAYMENT_METHODS,
        configuracionCompleta: true,
        diasAvisoVencimiento: 1,
      };

      setState(prev => {
        // Get assigned athlete IDs for this staff member
        const assignedAthleteIds = prev.staffAssignments
          .filter(a => a.staffId === staffMember.id)
          .map(a => a.athleteId);
        
        // Filter athletes to only show assigned ones (if there are assignments)
        const filteredAthletes = assignedAthleteIds.length > 0
          ? mockAthletes.filter(a => assignedAthleteIds.includes(a.id))
          : []; // If no assignments, staff sees no athletes

        return {
          ...prev,
          currentUser: staffMember,
          establecimiento,
          athletes: filteredAthletes,
          isAuthenticated: true,
          userRole: 'staff',
        };
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setState({
      currentUser: null,
      establecimiento: null,
      athletes: [],
      staff: [],
      transactions: [],
      staffAssignments: [],
      isAuthenticated: false,
      userRole: null,
    });
  }, []);

  const setupEstablecimiento = useCallback((data: Partial<Establecimiento>) => {
    setState(prev => ({
      ...prev,
      establecimiento: prev.establecimiento 
        ? { ...prev.establecimiento, ...data }
        : null,
    }));
  }, []);

  const updateEstablecimientoLogo = useCallback((logoUrl: string | null) => {
    setState(prev => ({
      ...prev,
      establecimiento: prev.establecimiento 
        ? { ...prev.establecimiento, logoUrl: logoUrl || undefined }
        : null,
    }));
  }, []);

  const addAthlete = useCallback((athlete: Omit<Athlete, 'id' | 'estadoSistema'>) => {
    const newAthlete: Athlete = {
      ...athlete,
      id: generateId(),
      estadoSistema: calculateSystemStatus(athlete.proximoPago),
    };
    setState(prev => ({
      ...prev,
      athletes: [...prev.athletes, newAthlete],
    }));
  }, []);

  const updateAthlete = useCallback((id: string, data: Partial<Athlete>) => {
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.map(a => 
        a.id === id 
          ? { 
              ...a, 
              ...data,
              estadoSistema: data.proximoPago 
                ? calculateSystemStatus(data.proximoPago) 
                : a.estadoSistema
            } 
          : a
      ),
    }));
  }, []);

  const updateAthletePrices = useCallback((athleteIds: string[], newPrice: number) => {
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.map(a => 
        athleteIds.includes(a.id) 
          ? { ...a, montoMensual: newPrice } 
          : a
      ),
    }));
  }, []);

  const deleteAthlete = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.filter(a => a.id !== id),
    }));
  }, []);

  const addStaff = useCallback((staff: Omit<StaffUser, 'id' | 'codigoAcceso' | 'fechaInvitacion'>) => {
    const newStaff: StaffUser = {
      ...staff,
      id: generateId(),
      codigoAcceso: generateCode(),
      fechaInvitacion: new Date(),
    };
    setState(prev => ({
      ...prev,
      staff: [...prev.staff, newStaff],
    }));
  }, []);

  const updateStaff = useCallback((id: string, data: Partial<StaffUser>) => {
    setState(prev => ({
      ...prev,
      staff: prev.staff.map(s => s.id === id ? { ...s, ...data } : s),
    }));
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== id),
    }));
  }, []);

  const registerPayment = useCallback((
    athleteId: string, 
    metodoPago: string, 
    mesesPagados: number = 1,
    montoPersonalizado?: number,
    referencia?: string, 
    observaciones?: string
  ) => {
    const athlete = state.athletes.find(a => a.id === athleteId);
    if (!athlete || !state.establecimiento) return;

    const montoBase = athlete.montoMensual * mesesPagados;
    const montoFinal = montoPersonalizado ?? montoBase;

    const transaction: Transaction = {
      id: generateId(),
      athleteId,
      fecha: new Date(),
      monto: montoFinal,
      montoPersonalizado: montoPersonalizado,
      mesesPagados,
      metodoPago,
      registradoPor: state.currentUser 
        ? `${state.userRole}:${state.currentUser.id}` 
        : 'sistema',
      registradoPorNombre: state.currentUser?.nombre || 'Sistema',
      referencia,
      moneda: state.establecimiento.moneda,
      observaciones,
    };

    // Calculate next payment date based on months paid (30 days per month)
    const nextPayment = addDays(new Date(), 30 * mesesPagados);

    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, transaction],
      athletes: prev.athletes.map(a => 
        a.id === athleteId 
          ? { 
              ...a, 
              ultimoPago: new Date(),
              proximoPago: nextPayment,
              estadoSistema: calculateSystemStatus(nextPayment),
              estadoManual: 'pagado' as const,
            } 
          : a
      ),
    }));
  }, [state.athletes, state.establecimiento, state.currentUser, state.userRole]);

  const updatePaymentMethods = useCallback((methods: PaymentMethod[]) => {
    setState(prev => ({
      ...prev,
      establecimiento: prev.establecimiento 
        ? { ...prev.establecimiento, metodosPago: methods }
        : null,
    }));
  }, []);

  const markAsPending = useCallback((athleteId: string) => {
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.map(a => 
        a.id === athleteId ? { ...a, estadoManual: 'pendiente' as const } : a
      ),
    }));
  }, []);

  const markAsInactive = useCallback((athleteId: string) => {
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.map(a => 
        a.id === athleteId ? { ...a, estadoManual: 'inactivo' as const } : a
      ),
    }));
  }, []);

  const updateStaffAssignments = useCallback((staffId: string, athleteIds: string[]) => {
    setState(prev => {
      // Remove old assignments for this staff
      const otherAssignments = prev.staffAssignments.filter(a => a.staffId !== staffId);
      // Add new assignments
      const newAssignments = athleteIds.map(athleteId => ({ staffId, athleteId }));
      return {
        ...prev,
        staffAssignments: [...otherAssignments, ...newAssignments],
      };
    });
  }, []);

  const getStaffAssignments = useCallback((staffId: string): string[] => {
    return state.staffAssignments
      .filter(a => a.staffId === staffId)
      .map(a => a.athleteId);
  }, [state.staffAssignments]);

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      loginStaff,
      logout,
      setupEstablecimiento,
      updateEstablecimientoLogo,
      addAthlete,
      updateAthlete,
      updateAthletePrices,
      deleteAthlete,
      addStaff,
      updateStaff,
      deleteStaff,
      registerPayment,
      updatePaymentMethods,
      markAsPending,
      markAsInactive,
      updateStaffAssignments,
      getStaffAssignments,
      customCategories,
      addCustomCategory,
      enabledSports,
      updateEnabledSports,
      customSports,
      addCustomSport,
      deleteCustomSport,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
