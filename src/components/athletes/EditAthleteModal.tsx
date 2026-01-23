import { useState, useEffect } from 'react';
import { Athlete } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CategoryInput } from '@/components/ui/CategoryInput';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { SPORTS } from '@/data/countries';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SportIconDisplay } from '@/utils/sportIcons';
import { useLanguage } from '@/hooks/useLanguage';
import { UpdateAthleteData } from '@/hooks/useAthletes';

interface EditAthleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: Athlete | null;
  currencySymbol: string;
  onSave: (athleteId: string, data: UpdateAthleteData) => Promise<unknown>;
  isLoading?: boolean;
  customCategories?: string[];
}

export function EditAthleteModal({
  open,
  onOpenChange,
  athlete,
  currencySymbol,
  onSave,
  isLoading = false,
  customCategories = [],
}: EditAthleteModalProps) {
  const { t } = useLanguage();
  const availableSports = SPORTS;

  const [formData, setFormData] = useState({
    nombre: '',
    deporte: '',
    deportePersonalizado: '',
    fechaNacimiento: undefined as Date | undefined,
    categoria: '',
    telefono: '',
    email: '',
    montoMensual: '',
    diaPago: '1',
  });

  // Reset form when athlete changes
  useEffect(() => {
    if (athlete) {
      setFormData({
        nombre: athlete.nombre,
        deporte: athlete.deporte,
        deportePersonalizado: athlete.deportePersonalizado || '',
        fechaNacimiento: athlete.fechaNacimiento,
        categoria: athlete.categoria || '',
        telefono: athlete.telefono || '',
        email: athlete.email || '',
        montoMensual: athlete.montoMensual.toString(),
        diaPago: athlete.diaPago.toString(),
      });
    }
  }, [athlete]);

  const handleSave = async () => {
    if (!athlete) return;

    const deporteFinal = formData.deporte === 'Otros' 
      ? formData.deportePersonalizado || 'Otros'
      : formData.deporte;

    await onSave(athlete.id, {
      nombre: formData.nombre,
      deporte: deporteFinal,
      deportePersonalizado: formData.deporte === 'Otros' ? formData.deportePersonalizado : undefined,
      fechaNacimiento: formData.fechaNacimiento,
      categoria: formData.categoria || undefined,
      telefono: formData.telefono,
      email: formData.email,
      montoMensual: parseFloat(formData.montoMensual) || 0,
      diaPago: parseInt(formData.diaPago),
    });

    onOpenChange(false);
  };

  if (!athlete) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('athletes.editAthlete')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nombre">{t('athletes.name')}</Label>
            <Input
              id="edit-nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-deporte">{t('athletes.sport')}</Label>
            <Select
              value={formData.deporte}
              onValueChange={(value) => setFormData({ ...formData, deporte: value, deportePersonalizado: '' })}
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSports.map((sport) => (
                  <SelectItem key={sport} value={sport} className="min-h-[44px]">
                    <SportIconDisplay sport={sport} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.deporte === 'Otros' && (
            <div className="space-y-2">
              <Label htmlFor="edit-deportePersonalizado">{t('athletes.specifyOtherSport')}</Label>
              <Input
                id="edit-deportePersonalizado"
                placeholder="Ej: Patinaje, Escalada..."
                value={formData.deportePersonalizado}
                onChange={(e) => setFormData({ ...formData, deportePersonalizado: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('athletes.birthDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal min-h-[44px]',
                    !formData.fechaNacimiento && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.fechaNacimiento ? (
                    format(formData.fechaNacimiento, "dd 'de' MMMM 'de' yyyy", { locale: es })
                  ) : (
                    <span>{t('common.selectDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.fechaNacimiento}
                  onSelect={(date) => setFormData({ ...formData, fechaNacimiento: date })}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-categoria">{t('athletes.category')}</Label>
            <CategoryInput
              value={formData.categoria}
              onChange={(value) => setFormData({ ...formData, categoria: value })}
              savedCategories={customCategories}
              placeholder={t('athletes.category')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-telefono">{t('athletes.phone')}</Label>
              <Input
                id="edit-telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t('athletes.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-monto">{t('athletes.monthlyFee')} ({currencySymbol})</Label>
              <Input
                id="edit-monto"
                type="number"
                value={formData.montoMensual}
                onChange={(e) => setFormData({ ...formData, montoMensual: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-diaPago">{t('athletes.paymentDay')}</Label>
              <Select
                value={formData.diaPago}
                onValueChange={(value) => setFormData({ ...formData, diaPago: value })}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()} className="min-h-[44px]">
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 min-h-[44px]"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="flex-1 gradient-primary min-h-[44px]"
            onClick={handleSave}
            disabled={!formData.nombre || !formData.deporte || !formData.montoMensual || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}