import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { Athlete, SystemStatus, ManualStatus, AthleteCategory } from '@/types';
import { addDays } from 'date-fns';
import { toast } from 'sonner';

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

export interface CreateAthleteData {
  nombre: string;
  deporte: string;
  deportePersonalizado?: string;
  fechaNacimiento?: Date;
  categoria?: string;
  telefono?: string;
  email?: string;
  montoMensual: number;
  diaPago: number;
}

export interface UpdateAthleteData {
  nombre?: string;
  deporte?: string;
  deportePersonalizado?: string;
  fechaNacimiento?: Date;
  categoria?: string;
  telefono?: string;
  email?: string;
  montoMensual?: number;
  diaPago?: number;
}

export function useAthletes() {
  const { establecimientoId, isAuthenticated, user } = useAuthContext();
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

  // Create athlete mutation
  const createAthleteMutation = useMutation({
    mutationFn: async (data: CreateAthleteData) => {
      if (!establecimientoId) throw new Error('No establecimiento');

      // Calculate next payment date
      const proximoPago = new Date();
      proximoPago.setDate(data.diaPago);
      if (proximoPago < new Date()) {
        proximoPago.setMonth(proximoPago.getMonth() + 1);
      }

      const insertData = {
        establecimiento_id: establecimientoId,
        nombre: data.nombre,
        deporte: data.deporte,
        deporte_personalizado: data.deportePersonalizado || null,
        fecha_nacimiento: data.fechaNacimiento?.toISOString().split('T')[0] || null,
        categoria: (data.categoria || null) as 'adulto' | 'avanzado' | 'infantil' | 'intermedio' | 'juvenil' | 'principiante' | 'profesional' | null,
        telefono: data.telefono || '',
        email: data.email || '',
        monto_mensual: data.montoMensual,
        dia_pago: data.diaPago,
        proximo_pago: proximoPago.toISOString(),
        estado_sistema: 'al_dia' as const,
        estado_manual: 'pendiente' as const,
        agregado_por: user?.id || null,
      };

      const { data: newAthlete, error } = await supabase
        .from('athletes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return transformAthlete(newAthlete);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      toast.success('Deportista agregado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating athlete:', error);
      toast.error('Error al agregar deportista');
    },
  });

  // Update athlete mutation
  const updateAthleteMutation = useMutation({
    mutationFn: async ({ athleteId, data }: { athleteId: string; data: UpdateAthleteData }) => {
      const updateData: Record<string, any> = {};
      
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.deporte !== undefined) updateData.deporte = data.deporte;
      if (data.deportePersonalizado !== undefined) updateData.deporte_personalizado = data.deportePersonalizado;
      if (data.fechaNacimiento !== undefined) updateData.fecha_nacimiento = data.fechaNacimiento?.toISOString().split('T')[0] || null;
      if (data.categoria !== undefined) updateData.categoria = data.categoria || null;
      if (data.telefono !== undefined) updateData.telefono = data.telefono;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.montoMensual !== undefined) updateData.monto_mensual = data.montoMensual;
      if (data.diaPago !== undefined) updateData.dia_pago = data.diaPago;

      const { data: updatedAthlete, error } = await supabase
        .from('athletes')
        .update(updateData)
        .eq('id', athleteId)
        .select()
        .single();

      if (error) throw error;
      return transformAthlete(updatedAthlete);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      toast.success('Deportista actualizado');
    },
    onError: (error) => {
      console.error('Error updating athlete:', error);
      toast.error('Error al actualizar deportista');
    },
  });

  // Delete athlete mutation
  const deleteAthleteMutation = useMutation({
    mutationFn: async (athleteId: string) => {
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', athleteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Deportista eliminado');
    },
    onError: (error) => {
      console.error('Error deleting athlete:', error);
      toast.error('Error al eliminar deportista');
    },
  });

  // Update bulk prices mutation
  const updateBulkPricesMutation = useMutation({
    mutationFn: async ({ athleteIds, newPrice }: { athleteIds: string[]; newPrice: number }) => {
      const { error } = await supabase
        .from('athletes')
        .update({ monto_mensual: newPrice })
        .in('id', athleteIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      toast.success('Precios actualizados');
    },
    onError: (error) => {
      console.error('Error updating prices:', error);
      toast.error('Error al actualizar precios');
    },
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
        registrado_por: user?.id || null,
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
      toast.success('Pago registrado exitosamente');
    },
    onError: (error) => {
      console.error('Error registering payment:', error);
      toast.error('Error al registrar pago');
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
    // CRUD operations
    createAthlete: createAthleteMutation.mutateAsync,
    isCreating: createAthleteMutation.isPending,
    updateAthlete: (athleteId: string, data: UpdateAthleteData) => 
      updateAthleteMutation.mutateAsync({ athleteId, data }),
    isUpdating: updateAthleteMutation.isPending,
    deleteAthlete: deleteAthleteMutation.mutateAsync,
    isDeleting: deleteAthleteMutation.isPending,
    updateBulkPrices: (athleteIds: string[], newPrice: number) =>
      updateBulkPricesMutation.mutateAsync({ athleteIds, newPrice }),
    // Payment and status
    registerPayment: registerPaymentMutation.mutateAsync,
    isRegisteringPayment: registerPaymentMutation.isPending,
    markAsPending: (athleteId: string) => 
      updateStatusMutation.mutateAsync({ athleteId, estadoManual: 'pendiente' }),
    markAsInactive: (athleteId: string) => 
      updateStatusMutation.mutateAsync({ athleteId, estadoManual: 'inactivo' }),
  };
}
