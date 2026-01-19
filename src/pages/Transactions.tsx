import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, TrendingUp, Calendar, Banknote, FileText, Download } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PaymentMethodFilter } from '@/components/transactions/PaymentMethodFilter';
import { DateRangeFilter } from '@/components/transactions/DateRangeFilter';
import { AthleteDetailModal } from '@/components/athletes/AthleteDetailModal';
import { exportTransactionsToExcel } from '@/utils/exportToExcel';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { es, enUS, fr, ptBR } from 'date-fns/locale';
import { Athlete } from '@/types';

const dateLocales = {
  es: es,
  en: enUS,
  fr: fr,
  pt: ptBR,
};

export default function Transactions() {
  const { transactions, athletes, establecimiento } = useApp();
  const { t, language } = useLanguage();
  const currencySymbol = establecimiento?.simboloMoneda || '$';
  const currentLocale = dateLocales[language as keyof typeof dateLocales] || es;

  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: currentLocale });
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply date range filter
    if (dateRange?.from) {
      result = result.filter(t => {
        const txDate = new Date(t.fecha);
        if (dateRange.to) {
          return isWithinInterval(txDate, { start: dateRange.from!, end: dateRange.to });
        }
        return txDate >= dateRange.from!;
      });
    }

    // Apply payment method filter
    if (selectedMethods.length > 0) {
      result = result.filter(t => selectedMethods.includes(t.metodoPago));
    }

    // Sort by date, newest first
    return result.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [transactions, selectedMethods, dateRange]);

  const stats = useMemo(() => {
    const totalFiltered = filteredTransactions.reduce((sum, t) => sum + t.monto, 0);
    
    return {
      total: filteredTransactions.length,
      amount: totalFiltered,
    };
  }, [filteredTransactions]);

  const getAthlete = (athleteId: string) => {
    return athletes.find(a => a.id === athleteId);
  };

  const getAthleteName = (athleteId: string) => {
    return getAthlete(athleteId)?.nombre || t('athletes.title');
  };

  const getPaymentMethodName = (methodId: string) => {
    return establecimiento?.metodosPago.find(m => m.id === methodId)?.nombre || methodId;
  };

  const handleAthleteClick = (athleteId: string) => {
    const athlete = getAthlete(athleteId);
    if (athlete) {
      setSelectedAthlete(athlete);
      setDetailModalOpen(true);
    }
  };

  const handleExport = () => {
    if (!establecimiento) return;
    exportTransactionsToExcel({
      transactions: filteredTransactions,
      athletes,
      currencySymbol,
      establishmentName: establecimiento.nombre,
    });
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('transactions.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('transactions.subtitle')}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={filteredTransactions.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t('transactions.export')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title={t('transactions.totalAmount')}
            value={formatCurrency(stats.amount)}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="success"
          />
          <StatsCard
            title={t('transactions.transactionCount')}
            value={stats.total}
            icon={<Receipt className="h-5 w-5" />}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <PaymentMethodFilter
            paymentMethods={establecimiento?.metodosPago || []}
            selectedMethods={selectedMethods}
            onFilterChange={setSelectedMethods}
          />
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {t('transactions.history')}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredTransactions.length}
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('transactions.noTransactions')}</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="p-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-status-success-light flex items-center justify-center">
                      <Banknote className="h-5 w-5 text-status-success" />
                    </div>
                    <div>
                      <button
                        onClick={() => handleAthleteClick(transaction.athleteId)}
                        className="font-semibold text-foreground hover:text-primary hover:underline text-left"
                      >
                        {getAthleteName(transaction.athleteId)}
                      </button>
                      <p className="text-sm text-muted-foreground">
                        {getPaymentMethodName(transaction.metodoPago)}
                        {transaction.mesesPagados > 1 && (
                          <span className="ml-1">• {transaction.mesesPagados} {t('payment.months')}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.fecha)}
                      </div>
                      {transaction.referencia && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('transactions.reference')}: {transaction.referencia}
                        </p>
                      )}
                      {transaction.observaciones && (
                        <div className="flex items-start gap-1 mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                          <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{transaction.observaciones}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-status-success">
                      +{formatCurrency(transaction.monto)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.registradoPorNombre || transaction.registradoPor?.split(':')[1]}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Athlete Detail Modal */}
      <AthleteDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        athlete={selectedAthlete}
        transactions={transactions}
        currencySymbol={currencySymbol}
      />
    </AppLayout>
  );
}
