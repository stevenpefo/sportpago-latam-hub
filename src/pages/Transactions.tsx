import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Receipt, TrendingUp, Calendar, Banknote } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';

export default function Transactions() {
  const { transactions, athletes, establecimiento } = useApp();
  const currencySymbol = establecimiento?.simboloMoneda || '$';

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = useMemo(() => {
    const thisMonth = new Date().getMonth();
    const thisMonthTransactions = transactions.filter(
      t => new Date(t.fecha).getMonth() === thisMonth
    );
    const totalThisMonth = thisMonthTransactions.reduce((sum, t) => sum + t.monto, 0);
    
    return {
      total: transactions.length,
      thisMonth: thisMonthTransactions.length,
      amountThisMonth: totalThisMonth,
    };
  }, [transactions]);

  const getAthleteName = (athleteId: string) => {
    return athletes.find(a => a.id === athleteId)?.nombre || 'Deportista';
  };

  const getPaymentMethodName = (methodId: string) => {
    return establecimiento?.metodosPago.find(m => m.id === methodId)?.nombre || methodId;
  };

  // Sort transactions by date, newest first
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagos</h1>
          <p className="text-sm text-muted-foreground">
            Historial de transacciones
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title="Este mes"
            value={formatCurrency(stats.amountThisMonth)}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="success"
          />
          <StatsCard
            title="Transacciones"
            value={stats.thisMonth}
            icon={<Receipt className="h-5 w-5" />}
          />
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Últimas transacciones
          </h2>

          {sortedTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay transacciones registradas</p>
            </div>
          ) : (
            sortedTransactions.map((transaction) => (
              <Card key={transaction.id} className="p-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-status-success-light flex items-center justify-center">
                      <Banknote className="h-5 w-5 text-status-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {getAthleteName(transaction.athleteId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getPaymentMethodName(transaction.metodoPago)}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.fecha)}
                      </div>
                      {transaction.referencia && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ref: {transaction.referencia}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-status-success">
                      +{formatCurrency(transaction.monto)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.registradoPor.split(':')[1]}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
