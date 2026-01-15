import { useState } from 'react';
import { Check, Clock, XCircle, Phone, Mail, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Athlete } from '@/types';
import { cn } from '@/lib/utils';
import { SportIconDisplay } from '@/utils/sportIcons';

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
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-border shrink-0">
            <AvatarFallback className="bg-secondary text-secondary-foreground font-medium text-sm sm:text-base">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                  {athlete.nombre}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  <SportIconDisplay sport={athlete.deporte} iconClassName="h-3 w-3" />
                </p>
              </div>
              
              {/* Mobile: Dropdown Menu | Desktop: View Details Button */}
              <div className="shrink-0">
                {/* Mobile dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-10 w-10 sm:hidden"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => onRegisterPayment(athlete)}
                      className="min-h-[44px] text-status-success"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Registrar Pago
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onMarkPending(athlete.id)}
                      className="min-h-[44px] text-status-warning"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Marcar Pendiente
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onMarkInactive(athlete.id)}
                      className="min-h-[44px] text-status-inactive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Marcar Inactivo
                    </DropdownMenuItem>
                    {!isStaffView && athlete.telefono && (
                      <DropdownMenuItem asChild className="min-h-[44px]">
                        <a href={`tel:${athlete.telefono}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Llamar
                        </a>
                      </DropdownMenuItem>
                    )}
                    {!isStaffView && athlete.email && (
                      <DropdownMenuItem asChild className="min-h-[44px]">
                        <a href={`mailto:${athlete.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Email
                        </a>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
              <StatusBadge status={athlete.estadoSistema} />
              {athlete.estadoManual !== 'pendiente' && (
                <StatusBadge status={athlete.estadoManual} type="manual" />
              )}
            </div>

            <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
              <span className="text-muted-foreground">Próximo:</span>
              <span className="font-medium text-foreground">
                {formatDate(athlete.proximoPago)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Monto:</span>
              <span className="font-semibold text-primary">
                {formatCurrency(athlete.montoMensual)}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Quick Actions - Hidden on mobile */}
        <div className="hidden sm:grid grid-cols-3 gap-2 mt-4">
          <Button
            size="sm"
            className="gradient-success text-status-success-foreground hover:opacity-90 min-h-[44px]"
            onClick={() => onRegisterPayment(athlete)}
          >
            <Check className="h-4 w-4 mr-1" />
            <span className="text-xs">Pagó</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-status-warning text-status-warning hover:bg-status-warning-light min-h-[44px]"
            onClick={() => onMarkPending(athlete.id)}
          >
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">Pendiente</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-status-inactive text-status-inactive hover:bg-status-inactive-light min-h-[44px]"
            onClick={() => onMarkInactive(athlete.id)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Inactivo</span>
          </Button>
        </div>

        {/* Contact info - only for admin on desktop */}
        {!isStaffView && (
          <div className="hidden sm:flex items-center gap-4 mt-3 pt-3 border-t">
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
