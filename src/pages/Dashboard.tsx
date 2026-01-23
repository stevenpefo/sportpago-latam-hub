import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { PaymentModal } from '@/components/athletes/PaymentModal';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';
import { useAuthContext } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAthletes } from '@/hooks/useAthletes';
import { useEstablecimiento } from '@/hooks/useEstablecimiento';
import { Athlete } from '@/types';
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Filter, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { userRole, user, completeTutorial, tutorialCompleted } = useAuthContext();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const { 
    athletes, 
    isLoading: isLoadingAthletes, 
    registerPayment,
    markAsPending,
    markAsInactive,
  } = useAthletes();
  
  const { establecimiento, isLoading: isLoadingEstab } = useEstablecimiento();

  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial for new admin users
  useEffect(() => {
    if (userRole === 'admin' && !tutorialCompleted) {
      setShowTutorial(true);
    }
  }, [userRole, tutorialCompleted]);

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    await completeTutorial();
  };

  const handleTutorialSkip = async () => {
    setShowTutorial(false);
    await completeTutorial();
  };

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

  const handleConfirmPayment = async (
    metodoPago: string, 
    mesesPagados: number,
    montoPersonalizado?: number,
    referencia?: string, 
    observaciones?: string
  ) => {
    if (!selectedAthlete) return;
    
    try {
      await registerPayment({
        athleteId: selectedAthlete.id,
        metodoPago,
        mesesPagados,
        montoPersonalizado,
        referencia,
        observaciones,
        registradoPorNombre: user?.user_metadata?.nombre || user?.email || 'Sistema',
      });
      
      toast({
        title: t('payment.success'),
        description: t('payment.paymentRegistered'),
      });
      
      setPaymentModalOpen(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('payment.paymentError'),
        variant: 'destructive',
      });
    }
  };

  const handleMarkPending = async (athleteId: string) => {
    try {
      await markAsPending(athleteId);
      toast({ title: t('athletes.statusUpdated') });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleMarkInactive = async (athleteId: string) => {
    try {
      await markAsInactive(athleteId);
      toast({ title: t('athletes.statusUpdated') });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const isStaffView = userRole === 'staff';
  const currencySymbol = establecimiento?.simboloMoneda || '$';
  const isLoading = isLoadingAthletes || isLoadingEstab;

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground">
            {isStaffView 
              ? t('nav.athletes')
              : `${t('dashboard.welcome')}, ${establecimiento?.nombre || user?.user_metadata?.nombre || ''}`
            }
          </p>
        </div>

        {/* Stats Grid - Only for Admin */}
        {!isStaffView && (
          <div className="grid grid-cols-2 gap-3" data-tutorial="payment-status">
            <StatsCard
              title={t('dashboard.upToDate')}
              value={stats.alDia}
              icon={<CheckCircle className="h-5 w-5" />}
              variant="success"
            />
            <StatsCard
              title={t('dashboard.aboutToExpire')}
              value={stats.porVencer}
              icon={<Clock className="h-5 w-5" />}
              variant="warning"
            />
            <StatsCard
              title={t('dashboard.expired')}
              value={stats.vencidos}
              icon={<AlertTriangle className="h-5 w-5" />}
              variant="danger"
            />
            <StatsCard
              title={t('dashboard.monthlyRevenue')}
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
              <p className="text-xs text-status-danger">{t('dashboard.expired')}</p>
            </div>
            <div className="bg-status-warning-light rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-warning">{stats.porVencer}</p>
              <p className="text-xs text-status-warning">{t('dashboard.aboutToExpire')}</p>
            </div>
            <div className="bg-status-success-light rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-status-success">{stats.alDia}</p>
              <p className="text-xs text-status-success">{t('dashboard.upToDate')}</p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('nav.athletes')}
          </h2>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('common.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="vencido">{t('status.expired')}</SelectItem>
              <SelectItem value="por-vencer">{t('status.aboutToExpire')}</SelectItem>
              <SelectItem value="al-dia">{t('status.upToDate')}</SelectItem>
              <SelectItem value="inactivo">{t('status.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Athletes List */}
        <div className="space-y-3">
          {filteredAthletes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('athletes.noAthletes')}</p>
              {!isStaffView && (
                <p className="text-sm mt-2">{t('athletes.addFirstAthlete')}</p>
              )}
            </div>
          ) : (
            filteredAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                currencySymbol={currencySymbol}
                onRegisterPayment={handleRegisterPayment}
                onMarkPending={handleMarkPending}
                onMarkInactive={handleMarkInactive}
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

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </AppLayout>
  );
}
