import { Check, Clock, XCircle, ChevronRight, Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Athlete } from '@/types';
import { cn } from '@/lib/utils';

interface AthleteCardProps {
  athlete: Athlete;
  currencySymbol: string;
  onRegisterPayment: (athlete: Athlete) => void;
  onMarkPending: (athleteId: string) => void;
  onMarkInactive: (athleteId: string) => void;
  onViewDetails?: (athlete: Athlete) => void;
  isStaffView?: boolean;
}

export function AthleteCard({
  athlete,
  currencySymbol,
  onRegisterPayment,
  onMarkPending,
  onMarkInactive,
  onViewDetails,
  isStaffView = false,
}: AthleteCardProps) {
  const initials = athlete.nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const statusBorderColor = {
    'al-dia': 'border-l-status-success',
    'por-vencer': 'border-l-status-warning',
    'vencido': 'border-l-status-danger',
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all hover:shadow-card-hover border-l-4 animate-fade-in',
        statusBorderColor[athlete.estadoSistema]
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {athlete.nombre}
              </h3>
              {!isStaffView && onViewDetails && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => onViewDetails(athlete)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{athlete.deporte}</p>

            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={athlete.estadoSistema} />
              {athlete.estadoManual !== 'pendiente' && (
                <StatusBadge status={athlete.estadoManual} type="manual" />
              )}
            </div>

            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-muted-foreground">Próximo pago:</span>
              <span className="font-medium text-foreground">
                {formatDate(athlete.proximoPago)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monto:</span>
              <span className="font-semibold text-primary">
                {formatCurrency(athlete.montoMensual)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions - Staff View has prominent buttons */}
        <div className={cn(
          'grid gap-2 mt-4',
          isStaffView ? 'grid-cols-3' : 'grid-cols-3'
        )}>
          <Button
            size="sm"
            className="gradient-success text-status-success-foreground hover:opacity-90"
            onClick={() => onRegisterPayment(athlete)}
          >
            <Check className="h-4 w-4 mr-1" />
            <span className="text-xs">Pagó</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-status-warning text-status-warning hover:bg-status-warning-light"
            onClick={() => onMarkPending(athlete.id)}
          >
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">Pendiente</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-status-inactive text-status-inactive hover:bg-status-inactive-light"
            onClick={() => onMarkInactive(athlete.id)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Inactivo</span>
          </Button>
        </div>

        {/* Contact info - only for admin */}
        {!isStaffView && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
            <a 
              href={`tel:${athlete.telefono}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {athlete.telefono}
            </a>
            <a 
              href={`mailto:${athlete.email}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              {athlete.email}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
