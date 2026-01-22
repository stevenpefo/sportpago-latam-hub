import { cn } from '@/lib/utils';
import { SystemStatus, ManualStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface StatusBadgeProps {
  status: SystemStatus | ManualStatus;
  type?: 'system' | 'manual';
  className?: string;
}

const statusConfig = {
  // System statuses
  'al-dia': {
    labelKey: 'status.upToDate',
    className: 'bg-status-success-light text-status-success border-status-success/20',
    dot: 'bg-status-success',
  },
  'por-vencer': {
    labelKey: 'status.aboutToExpire',
    className: 'bg-status-warning-light text-status-warning border-status-warning/20',
    dot: 'bg-status-warning',
  },
  'vencido': {
    labelKey: 'status.expired',
    className: 'bg-status-danger-light text-status-danger border-status-danger/20',
    dot: 'bg-status-danger',
  },
  // Manual statuses
  'pagado': {
    labelKey: 'status.paid',
    className: 'bg-status-success-light text-status-success border-status-success/20',
    dot: 'bg-status-success',
  },
  'pendiente': {
    labelKey: 'status.pending',
    className: 'bg-status-warning-light text-status-warning border-status-warning/20',
    dot: 'bg-status-warning',
  },
  'inactivo': {
    labelKey: 'status.inactive',
    className: 'bg-status-inactive-light text-status-inactive border-status-inactive/20',
    dot: 'bg-status-inactive',
  },
};

export function StatusBadge({ status, type = 'system', className }: StatusBadgeProps) {
  const { t } = useLanguage();
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {t(config.labelKey)}
    </span>
  );
}