import { cn } from '@/lib/utils';
import { SystemStatus, ManualStatus } from '@/types';

interface StatusBadgeProps {
  status: SystemStatus | ManualStatus;
  type?: 'system' | 'manual';
  className?: string;
}

const statusConfig = {
  // System statuses
  'al-dia': {
    label: 'Al día',
    className: 'bg-status-success-light text-status-success border-status-success/20',
    dot: 'bg-status-success',
  },
  'por-vencer': {
    label: 'Por vencer',
    className: 'bg-status-warning-light text-status-warning border-status-warning/20',
    dot: 'bg-status-warning',
  },
  'vencido': {
    label: 'Vencido',
    className: 'bg-status-danger-light text-status-danger border-status-danger/20',
    dot: 'bg-status-danger',
  },
  // Manual statuses
  'pagado': {
    label: 'Pagado',
    className: 'bg-status-success-light text-status-success border-status-success/20',
    dot: 'bg-status-success',
  },
  'pendiente': {
    label: 'Pendiente',
    className: 'bg-status-warning-light text-status-warning border-status-warning/20',
    dot: 'bg-status-warning',
  },
  'inactivo': {
    label: 'Inactivo',
    className: 'bg-status-inactive-light text-status-inactive border-status-inactive/20',
    dot: 'bg-status-inactive',
  },
};

export function StatusBadge({ status, type = 'system', className }: StatusBadgeProps) {
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
      {config.label}
    </span>
  );
}
