import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Athlete, PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Banknote, 
  Building2, 
  CreditCard, 
  Wallet, 
  Smartphone,
  Check,
  Calendar,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';

const dateLocales = { es, en: enUS, fr, pt };

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: Athlete | null;
  paymentMethods: PaymentMethod[];
  currencySymbol: string;
  onConfirm: (
    metodoPago: string, 
    mesesPagados: number,
    montoPersonalizado?: number,
    referencia?: string, 
    observaciones?: string
  ) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'banknote': Banknote,
  'building-2': Building2,
  'credit-card': CreditCard,
  'wallet': Wallet,
  'smartphone': Smartphone,
};

export function PaymentModal({
  open,
  onOpenChange,
  athlete,
  paymentMethods,
  currencySymbol,
  onConfirm,
}: PaymentModalProps) {
  const { t, language } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [referencia, setReferencia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isMultipleMonths, setIsMultipleMonths] = useState(false);
  const [monthsCount, setMonthsCount] = useState([1]);
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const activePaymentMethods = paymentMethods.filter(m => m.activo);

  // Calculate amounts
  const calculatedAmount = useMemo(() => {
    if (!athlete) return 0;
    return athlete.montoMensual * monthsCount[0];
  }, [athlete, monthsCount]);

  const finalAmount = useMemo(() => {
    if (useCustomAmount && customAmount) {
      return parseFloat(customAmount);
    }
    return calculatedAmount;
  }, [useCustomAmount, customAmount, calculatedAmount]);

  // Calculate next payment date
  const nextPaymentDate = useMemo(() => {
    const today = new Date();
    const daysToAdd = 30 * monthsCount[0];
    return addDays(today, daysToAdd);
  }, [monthsCount]);

  const handleConfirm = () => {
    if (selectedMethod && athlete) {
      const montoPersonalizado = useCustomAmount && customAmount ? parseFloat(customAmount) : undefined;
      onConfirm(
        selectedMethod, 
        monthsCount[0],
        montoPersonalizado,
        referencia || undefined, 
        observaciones || undefined
      );
      // Reset state
      setSelectedMethod(null);
      setReferencia('');
      setObservaciones('');
      setIsMultipleMonths(false);
      setMonthsCount([1]);
      setUseCustomAmount(false);
      setCustomAmount('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setReferencia('');
    setObservaciones('');
    setIsMultipleMonths(false);
    setMonthsCount([1]);
    setUseCustomAmount(false);
    setCustomAmount('');
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  if (!athlete) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('payment.registerPayment')}</DialogTitle>
          <DialogDescription>
            {athlete.nombre} • {t('payment.monthlyFee')}: {formatCurrency(athlete.montoMensual)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Type Selection */}
          <div className="space-y-3">
            <Label>{t('payment.paymentType')}</Label>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('payment.multipleMonths')}</span>
              </div>
              <Switch
                checked={isMultipleMonths}
                onCheckedChange={(checked) => {
                  setIsMultipleMonths(checked);
                  if (!checked) {
                    setMonthsCount([1]);
                    setUseCustomAmount(false);
                    setCustomAmount('');
                  }
                }}
              />
            </div>
          </div>

          {/* Months Slider - only show when multiple months is enabled */}
          {isMultipleMonths && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between items-center">
                <Label>{t('payment.monthCount')}</Label>
                <span className="text-2xl font-bold text-primary">{monthsCount[0]}</span>
              </div>
              <Slider
                value={monthsCount}
                onValueChange={setMonthsCount}
                min={1}
                max={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 {t('payment.month')}</span>
                <span>12 {t('payment.months')}</span>
              </div>
              
              {/* Calculated Amount */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('payment.calculatedAmount')}:</span>
                  <span className="text-lg font-semibold">{formatCurrency(calculatedAmount)}</span>
                </div>
              </div>

              {/* Custom Amount Option */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customAmount" className="text-sm">
                    {t('payment.customAmount')}
                  </Label>
                  <Switch
                    checked={useCustomAmount}
                    onCheckedChange={setUseCustomAmount}
                  />
                </div>
                {useCustomAmount && (
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder={`${t('common.example')}: ${Math.round(calculatedAmount * 0.9)}`}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Next Payment Date Preview */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">{t('payment.nextPaymentDate')}:</span>
                <span className="text-sm font-medium">
                  {format(nextPaymentDate, "PPP", { locale: dateLocales[language] })}
                </span>
              </div>
            </div>
          )}

          {/* Final Amount Display */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('payment.total')}:</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(finalAmount)}</span>
            </div>
            {isMultipleMonths && (
              <p className="text-xs text-muted-foreground mt-1">
                {monthsCount[0]} {monthsCount[0] === 1 ? t('payment.month') : t('payment.months')} {t('payment.ofMonthlyFee')}
              </p>
            )}
          </div>

          {/* Payment Methods Grid */}
          <div className="space-y-3">
            <Label>{t('payment.selectMethod')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {activePaymentMethods.map((method) => {
                const Icon = iconMap[method.icono] || Wallet;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </span>
                    )}
                    <Icon className={cn(
                      'h-6 w-6',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className={cn(
                      'text-sm font-medium text-center',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}>
                      {method.nombre}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Field */}
          <div className="space-y-2">
            <Label htmlFor="referencia">
              {t('payment.reference')} <span className="text-muted-foreground">({t('common.optional')})</span>
            </Label>
            <Input
              id="referencia"
              placeholder={t('payment.referencePlaceholder')}
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </div>

          {/* Observations Field */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">
              {t('payment.observations')} <span className="text-muted-foreground">({t('common.optional')})</span>
            </Label>
            <Textarea
              id="observaciones"
              placeholder={t('payment.observationsPlaceholder')}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="flex-1 gradient-primary"
            disabled={!selectedMethod}
            onClick={handleConfirm}
          >
            {t('payment.confirmPayment')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}