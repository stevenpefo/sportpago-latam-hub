import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { Establecimiento, PaymentMethod } from '@/types';

// Transform DB payment method to app payment method
const transformPaymentMethod = (dbMethod: any): PaymentMethod => ({
  id: dbMethod.id,
  nombre: dbMethod.nombre,
  icono: dbMethod.icono,
  activo: dbMethod.activo,
  esPersonalizado: dbMethod.es_personalizado,
});

// Transform DB establecimiento to app establecimiento
const transformEstablecimiento = (dbEstab: any, paymentMethods: PaymentMethod[]): Establecimiento => ({
  id: dbEstab.id,
  nombre: dbEstab.nombre,
  pais: dbEstab.pais,
  moneda: dbEstab.moneda,
  simboloMoneda: dbEstab.simbolo_moneda,
  zonaHoraria: dbEstab.zona_horaria,
  metodosPago: paymentMethods,
  configuracionCompleta: dbEstab.configuracion_completa,
  logoUrl: dbEstab.logo_url || undefined,
  codigoClub: dbEstab.codigo_club || undefined,
  diasAvisoVencimiento: dbEstab.dias_aviso_vencimiento ?? 1,
});

export function useEstablecimiento() {
  const { establecimientoId, isAuthenticated } = useAuthContext();

  const establecimientoQuery = useQuery({
    queryKey: ['establecimiento', establecimientoId],
    queryFn: async () => {
      if (!establecimientoId) return null;

      // Fetch establecimiento
      const { data: estabData, error: estabError } = await supabase
        .from('establecimientos')
        .select('*')
        .eq('id', establecimientoId)
        .maybeSingle();

      if (estabError) throw estabError;
      if (!estabData) return null;

      // Fetch payment methods
      const { data: methodsData, error: methodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('establecimiento_id', establecimientoId)
        .eq('activo', true)
        .order('nombre');

      if (methodsError) throw methodsError;

      const paymentMethods = (methodsData || []).map(transformPaymentMethod);
      return transformEstablecimiento(estabData, paymentMethods);
    },
    enabled: isAuthenticated && !!establecimientoId,
  });

  return {
    establecimiento: establecimientoQuery.data || null,
    paymentMethods: establecimientoQuery.data?.metodosPago || [],
    isLoading: establecimientoQuery.isLoading,
    error: establecimientoQuery.error,
    refetch: establecimientoQuery.refetch,
  };
}
