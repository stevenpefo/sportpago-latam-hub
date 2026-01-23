import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { Athlete, SystemStatus, ManualStatus, AthleteCategory } from '@/types';
import { addDays } from 'date-fns';

// Map database status to app status
const mapSystemStatus = (status: string): SystemStatus => {
  const mapping: Record<string, SystemStatus> = {
    'al_dia': 'al-dia',
    'por_vencer': 'por-vencer',
    'vencido': 'vencido',
  };
  return mapping[status] || 'al-dia';
};

const mapManualStatus = (status: string): ManualStatus => {
  const mapping: Record<string, ManualStatus> = {
    'pagado': 'pagado',
    'pendiente': 'pendiente',
    'inactivo': 'inactivo',
  };
  return mapping[status] || 'pendiente';
};

// Map app status back to database status
const mapSystemStatusToDb = (status: SystemStatus): string => {
  const mapping: Record<SystemStatus, string> = {
    'al-dia': 'al_dia',
    'por-vencer': 'por_vencer',
    'vencido': 'vencido',
  };
  return mapping[status];
};

const mapManualStatusToDb = (status: ManualStatus): string => {
  return status; // Same values
};

// Transform DB athlete to app athlete
const transformAthlete = (dbAthlete: any): Athlete => ({
  id: dbAthlete.id,
  establecimientoId: dbAthlete.establecimiento_id,
  nombre: dbAthlete.nombre,
  identificacion: dbAthlete.identificacion || undefined,
  deporte: dbAthlete.deporte,
  deportePersonalizado: dbAthlete.deporte_personalizado || undefined,
  fechaNacimiento: dbAthlete.fecha_nacimiento ? new Date(dbAthlete.fecha_nacimiento) : undefined,
  categoria: dbAthlete.categoria as AthleteCategory | undefined,
  telefono: dbAthlete.telefono || '',
  email: dbAthlete.email || '',
  montoMensual: Number(dbAthlete.monto_mensual) || 0,
  diaPago: dbAthlete.dia_pago || 1,
  ultimoPago: dbAthlete.ultimo_pago ? new Date(dbAthlete.ultimo_pago) : undefined,
  proximoPago: new Date(dbAthlete.proximo_pago),
  estadoSistema: mapSystemStatus(dbAthlete.estado_sistema),
  estadoManual: mapManualStatus(dbAthlete.estado_manual),
  avatarUrl: dbAthlete.avatar_url || undefined,
  referidoPor: dbAthlete.referido_por || undefined,
  validado: dbAthlete.validado ?? true,
  agregadoPor: dbAthlete.agregado_por || undefined,
});

export function useAthletes() {
  const { establecimientoId, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();

  const athletesQuery = useQuery({
    queryKey: ['athletes', establecimientoId],
    queryFn: async () => {
      if (!establecimientoId) return [];

      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('establecimiento_id', establecimientoId)
        .order('nombre');

      if (error) throw error;
      return (data || []).map(transformAthlete);
    },
    enabled: isAuthenticated && !!establecimientoId,
  });

  const registerPaymentMutation = useMutation({
    mutationFn: async ({
      athleteId,
      metodoPago,
      mesesPagados,
      montoPersonalizado,
      referencia,
      observaciones,
      registradoPorNombre,
    }: {
      athleteId: string;
      metodoPago: string;
      mesesPagados: number;
      montoPersonalizado?: number;
      referencia?: string;
      observaciones?: string;
      registradoPorNombre: string;
    }) => {
      const athlete = athletesQuery.data?.find(a => a.id === athleteId);
      if (!athlete) throw new Error('Athlete not found');

      const montoBase = athlete.montoMensual * mesesPagados;
      const montoFinal = montoPersonalizado ?? montoBase;

      // Create transaction
      const { error: txError } = await supabase.from('transactions').insert({
        athlete_id: athleteId,
        monto: montoFinal,
        monto_personalizado: montoPersonalizado,
        meses_pagados: mesesPagados,
        metodo_pago: metodoPago,
        referencia,
        observaciones,
        registrado_por_nombre: registradoPorNombre,
      });

      if (txError) throw txError;

      // Update athlete
      const nextPayment = addDays(new Date(), 30 * mesesPagados);
      const { error: updateError } = await supabase
        .from('athletes')
        .update({
          ultimo_pago: new Date().toISOString(),
          proximo_pago: nextPayment.toISOString(),
          estado_sistema: 'al_dia',
          estado_manual: 'pagado',
        })
        .eq('id', athleteId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      athleteId,
      estadoManual,
    }: {
      athleteId: string;
      estadoManual: ManualStatus;
    }) => {
      const dbStatus = estadoManual as 'pagado' | 'pendiente' | 'inactivo';
      const { error } = await supabase
        .from('athletes')
        .update({ estado_manual: dbStatus })
        .eq('id', athleteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });

  return {
    athletes: athletesQuery.data || [],
    isLoading: athletesQuery.isLoading,
    error: athletesQuery.error,
    refetch: athletesQuery.refetch,
    registerPayment: registerPaymentMutation.mutateAsync,
    isRegisteringPayment: registerPaymentMutation.isPending,
    markAsPending: (athleteId: string) => 
      updateStatusMutation.mutateAsync({ athleteId, estadoManual: 'pendiente' }),
    markAsInactive: (athleteId: string) => 
      updateStatusMutation.mutateAsync({ athleteId, estadoManual: 'inactivo' }),
  };
}
