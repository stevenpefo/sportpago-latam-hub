import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Athlete } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2 } from 'lucide-react';

interface DeleteAthleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: Athlete | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteAthleteDialog({
  open,
  onOpenChange,
  athlete,
  onConfirm,
  isLoading = false,
}: DeleteAthleteDialogProps) {
  const { t } = useLanguage();

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  if (!athlete) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('athletes.deleteAthlete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('athletes.deleteConfirmation', { name: athlete.nombre })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}