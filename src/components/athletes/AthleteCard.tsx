import { Check, Clock, XCircle, Phone, Mail, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Athlete } from '@/types';
import { cn } from '@/lib/utils';
import { SportIconDisplay } from '@/utils/sportIcons';
import { useLanguage } from '@/hooks/useLanguage';

interface AthleteCardProps {
  athlete: Athlete;
  currencySymbol: string;
  onRegisterPayment: (athlete: Athlete) => void;
  onMarkPending: (athleteId: string) => void;
  onMarkInactive: (athleteId: string) => void;
  onEdit?: (athlete: Athlete) => void;
  onDelete?: (athlete: Athlete) => void;
  onViewDetails?: (athlete: Athlete) => void;
  isStaffView?: boolean;
}

export function AthleteCard({
  athlete,
  currencySymbol,
  onRegisterPayment,
  onMarkPending,
  onMarkInactive,
  onEdit,
  onDelete,
  onViewDetails,
  isStaffView = false,
}: AthleteCardProps) {
  const { t, language } = useLanguage();
  
  const initials = athlete.nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const localeMap: Record<string, string> = {
    es: 'es-ES',
    en: 'en-US',
    fr: 'fr-FR',
    pt: 'pt-BR',
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(localeMap[language], {
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
                <button
                  onClick={() => onViewDetails?.(athlete)}
                  className="font-semibold text-foreground truncate text-sm sm:text-base hover:text-primary hover:underline text-left block max-w-full"
                >
                  {athlete.nombre}
                </button>
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
                      {t('athletes.registerPayment')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onMarkPending(athlete.id)}
                      className="min-h-[44px] text-status-warning"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {t('athletes.markPending')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onMarkInactive(athlete.id)}
                      className="min-h-[44px] text-status-inactive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('athletes.markInactive')}
                    </DropdownMenuItem>
                    
                    {onViewDetails && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onViewDetails(athlete)}
                          className="min-h-[44px]"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('athletes.viewDetails')}
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {!isStaffView && (
                      <>
                        <DropdownMenuSeparator />
                        {onEdit && (
                          <DropdownMenuItem 
                            onClick={() => onEdit(athlete)}
                            className="min-h-[44px]"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(athlete)}
                            className="min-h-[44px] text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    
                    {!isStaffView && athlete.telefono && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="min-h-[44px]">
                          <a href={`tel:${athlete.telefono}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            {t('athletes.call')}
                          </a>
                        </DropdownMenuItem>
                      </>
                    )}
                    {!isStaffView && athlete.email && (
                      <DropdownMenuItem asChild className="min-h-[44px]">
                        <a href={`mailto:${athlete.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          {t('athletes.sendEmail')}
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
              <span className="text-muted-foreground">{t('athletes.nextPayment')}:</span>
              <span className="font-medium text-foreground">
                {formatDate(athlete.proximoPago)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">{t('athletes.monthlyFee')}:</span>
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
            <span className="text-xs">{t('status.paid')}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-status-warning text-status-warning hover:bg-status-warning-light min-h-[44px]"
            onClick={() => onMarkPending(athlete.id)}
          >
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">{t('status.pending')}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-status-inactive text-status-inactive hover:bg-status-inactive-light min-h-[44px]"
            onClick={() => onMarkInactive(athlete.id)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">{t('status.inactive')}</span>
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
