import { useState } from 'react';
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
import { Athlete, PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Banknote, 
  Building2, 
  CreditCard, 
  Wallet, 
  Smartphone,
  Check,
} from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: Athlete | null;
  paymentMethods: PaymentMethod[];
  currencySymbol: string;
  onConfirm: (metodoPago: string, referencia?: string, observaciones?: string) => void;
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
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [referencia, setReferencia] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const activePaymentMethods = paymentMethods.filter(m => m.activo);

  const handleConfirm = () => {
    if (selectedMethod) {
      onConfirm(selectedMethod, referencia || undefined, observaciones || undefined);
      // Reset state
      setSelectedMethod(null);
      setReferencia('');
      setObservaciones('');
      onOpenChange(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  if (!athlete) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            {athlete.nombre} • {formatCurrency(athlete.montoMensual)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Methods Grid */}
          <div className="space-y-3">
            <Label>Método de pago</Label>
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
              Referencia / Comprobante <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="referencia"
              placeholder="Ej: #12345 o número de transacción"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </div>

          {/* Observations Field */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">
              Observaciones <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales sobre el pago"
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
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 gradient-primary"
            disabled={!selectedMethod}
            onClick={handleConfirm}
          >
            Confirmar Pago
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
