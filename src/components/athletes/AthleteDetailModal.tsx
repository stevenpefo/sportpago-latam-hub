import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Athlete, Transaction } from '@/types';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Banknote, 
  FileText,
  Receipt,
  Clock,
  ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';

const dateLocales = { es, en: enUS, fr, pt };

interface AthleteDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: Athlete | null;
  transactions: Transaction[];
  currencySymbol: string;
}

export function AthleteDetailModal({
  open,
  onOpenChange,
  athlete,
  transactions,
  currencySymbol,
}: AthleteDetailModalProps) {
  const { t, language } = useLanguage();
  
  if (!athlete) return null;

  const athleteTransactions = transactions
    .filter(t => t.athleteId === athlete.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd MMM yyyy", { locale: dateLocales[language] });
  };

  const formatDateTime = (date: Date) => {
    return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: dateLocales[language] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'al-dia':
        return 'bg-status-success text-white';
      case 'por-vencer':
        return 'bg-status-warning text-white';
      case 'vencido':
        return 'bg-status-danger text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'al-dia':
        return t('status.upToDate');
      case 'por-vencer':
        return t('status.aboutToExpire');
      case 'vencido':
        return t('status.expired');
      default:
        return status;
    }
  };

  const totalPaid = athleteTransactions.reduce((sum, t) => sum + t.monto, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{t('athleteDetail.title')}</DialogTitle>
        </DialogHeader>

        {/* Athlete Header */}
        <div className="flex items-start gap-4 pb-4 border-b">
          <Avatar className="h-16 w-16">
            <AvatarImage src={athlete.avatarUrl} alt={athlete.nombre} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {athlete.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{athlete.nombre}</h2>
                <p className="text-sm text-muted-foreground">{athlete.deporte}</p>
              </div>
              <Badge className={getStatusColor(athlete.estadoSistema)}>
                {getStatusLabel(athlete.estadoSistema)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatCurrency(athlete.montoMensual)}/{t('athleteDetail.perMonth')}
              </span>
              <span>•</span>
              <span>{t('athletes.paymentDay')}: {athlete.diaPago}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">{t('athleteDetail.information')}</TabsTrigger>
            <TabsTrigger value="payments">
              {t('athleteDetail.payments')} ({athleteTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Contact Info */}
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('athleteDetail.contactInfo')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{athlete.telefono}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{athlete.email}</span>
                </div>
                {athlete.fechaNacimiento && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{t('athletes.birthDate')}: {formatDate(athlete.fechaNacimiento)}</span>
                  </div>
                )}
                {athlete.categoria && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{t('athletes.category')}: {athlete.categoria}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                {t('athleteDetail.paymentInfo')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('athletes.monthlyFee')}</span>
                  <span className="font-medium">{formatCurrency(athlete.montoMensual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('athletes.paymentDay')}</span>
                  <span className="font-medium">{athlete.diaPago}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('athletes.lastPayment')}</span>
                  <span className="font-medium">
                    {athlete.ultimoPago ? formatDate(athlete.ultimoPago) : t('athleteDetail.noPayments')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('athletes.nextPayment')}</span>
                  <span className="font-medium">{formatDate(athlete.proximoPago)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">{t('athleteDetail.totalPaid')}</span>
                  <span className="font-bold text-status-success">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {athleteTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t('athleteDetail.noPaymentsRegistered')}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {athleteTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-status-success">
                            +{formatCurrency(transaction.monto)}
                          </span>
                          {transaction.mesesPagados > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {transaction.mesesPagados} {t('payment.months')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(transaction.fecha)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {transaction.metodoPago} • {t('transactions.registeredBy')}: {transaction.registradoPorNombre}
                        </p>
                      </div>
                    </div>

                    {/* Observations */}
                    {transaction.observaciones && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <div className="flex items-start gap-2">
                          <FileText className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span>{transaction.observaciones}</span>
                        </div>
                      </div>
                    )}

                    {/* Receipt/Reference */}
                    {transaction.referencia && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t('transactions.reference')}: {transaction.referencia}
                      </p>
                    )}

                    {/* Receipt Image Placeholder */}
                    {transaction.comprobanteUrl && (
                      <div className="mt-2 p-2 bg-muted/30 rounded border border-dashed flex items-center gap-2 text-xs text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <a 
                          href={transaction.comprobanteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {t('athleteDetail.viewReceipt')}
                        </a>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
