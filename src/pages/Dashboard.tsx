import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { PaymentModal } from '@/components/athletes/PaymentModal';
import { useApp } from '@/context/AppContext';
import { Athlete } from '@/types';
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const { 
    athletes, 
    establecimiento, 
    userRole, 
    registerPayment,
    markAsPending,
    markAsInactive,
  } = useApp();

  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const alDia = athletes.filter(a => a.estadoSistema === 'al-dia').length;
    const porVencer = athletes.filter(a => a.estadoSistema === 'por-vencer').length;
    const vencidos = athletes.filter(a => a.estadoSistema === 'vencido').length;
    const inactivos = athletes.filter(a => a.estadoManual === 'inactivo').length;
    const totalMensual = athletes
      .filter(a => a.estadoManual !== 'inactivo')
      .reduce((sum, a) => sum + a.montoMensual, 0);

    return { alDia, porVencer, vencidos, inactivos, totalMensual };
  }, [athletes]);

  const filteredAthletes = useMemo(() => {
    let filtered = [...athletes];
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'inactivo') {
        filtered = filtered.filter(a => a.estadoManual === 'inactivo');
      } else {
        filtered = filtered.filter(a => 
          a.estadoSistema === statusFilter && a.estadoManual !== 'inactivo'
        );
      }
    }

    // Sort: vencidos first, then por-vencer, then al-dia
    return filtered.sort((a, b) => {
      const order = { 'vencido': 0, 'por-vencer': 1, 'al-dia': 2 };
      return order[a.estadoSistema] - order[b.estadoSistema];
    });
  }, [athletes, statusFilter]);

  const handleRegisterPayment = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (metodoPago: string, referencia?: string, observaciones?: string) => {
    if (selectedAthlete) {
      registerPayment(selectedAthlete.id, metodoPago, referencia, observaciones);
    }
  };

  const isStaffView = userRole === 'staff';
  const currencySymbol = establecimiento?.simboloMoneda || '$';

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {isStaffView ? 'Panel de Asistente' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {isStaffView 
              ? 'Gestiona los pagos de los deportistas'
              : `Resumen de ${establecimiento?.nombre || 'tu academia'}`
            }
          </p>
        </div>

        {/* Stats Grid - Only for Admin */}
        {!isStaffView && (
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="Al día"
              value={stats.alDia}
              icon={<CheckCircle className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title="Por vencer"
              value={stats.porVencer}
              icon={<Clock className="h-5 w-5" />}
              variant="warning"
            />
            <StatsCard
              title="Vencidos"
              value={stats.vencidos}
              icon={<AlertTriangle className="h-5 w-5" />}
              variant="danger"
            />
            <StatsCard
              title="Esperado/mes"
              value={formatCurrency(stats.totalMensual)}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>
        )}

        {/* Staff Quick Stats */}
        {isStaffView && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-status-danger-light rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-danger">{stats.vencidos}</p>
              <p className="text-xs text-status-danger">Vencidos</p>
            </div>
            <div className="bg-status-warning-light rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-warning">{stats.porVencer}</p>
              <p className="text-xs text-status-warning">Por vencer</p>
            </div>
            <div className="bg-status-success-light rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-success">{stats.alDia}</p>
              <p className="text-xs text-status-success">Al día</p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Deportistas
          </h2>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="vencido">Vencidos</SelectItem>
              <SelectItem value="por-vencer">Por vencer</SelectItem>
              <SelectItem value="al-dia">Al día</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Athletes List */}
        <div className="space-y-3">
          {filteredAthletes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay deportistas con este filtro</p>
            </div>
          ) : (
            filteredAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                currencySymbol={currencySymbol}
                onRegisterPayment={handleRegisterPayment}
                onMarkPending={markAsPending}
                onMarkInactive={markAsInactive}
                isStaffView={isStaffView}
              />
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        athlete={selectedAthlete}
        paymentMethods={establecimiento?.metodosPago || []}
        currencySymbol={currencySymbol}
        onConfirm={handleConfirmPayment}
      />
    </AppLayout>
  );
}
