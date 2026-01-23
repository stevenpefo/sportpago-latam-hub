import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { Transaction } from '@/types';

// Transform DB transaction to app transaction
const transformTransaction = (dbTx: any): Transaction => ({
  id: dbTx.id,
  athleteId: dbTx.athlete_id,
  fecha: new Date(dbTx.fecha),
  monto: Number(dbTx.monto) || 0,
  montoPersonalizado: dbTx.monto_personalizado ? Number(dbTx.monto_personalizado) : undefined,
  mesesPagados: dbTx.meses_pagados || 1,
  metodoPago: dbTx.metodo_pago,
  registradoPor: dbTx.registrado_por || '',
  registradoPorNombre: dbTx.registrado_por_nombre || '',
  referencia: dbTx.referencia || undefined,
  moneda: dbTx.moneda || 'COP',
  observaciones: dbTx.observaciones || undefined,
  comprobanteUrl: dbTx.comprobante_url || undefined,
});

export function useTransactions() {
  const { establecimientoId, isAuthenticated } = useAuthContext();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', establecimientoId],
    queryFn: async () => {
      if (!establecimientoId) return [];

      // Get transactions for athletes in this establishment
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          athletes!inner(establecimiento_id)
        `)
        .eq('athletes.establecimiento_id', establecimientoId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformTransaction);
    },
    enabled: isAuthenticated && !!establecimientoId,
  });

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
  };
}