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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Athlete } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Users, CheckSquare, Square } from 'lucide-react';

interface BulkPriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athletes: Athlete[];
  currencySymbol: string;
  onConfirm: (athleteIds: string[], newPrice: number) => void;
}

export function BulkPriceModal({
  open,
  onOpenChange,
  athletes,
  currencySymbol,
  onConfirm,
}: BulkPriceModalProps) {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newPrice, setNewPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAthletes = useMemo(() => {
    if (!searchQuery.trim()) return athletes;
    const query = searchQuery.toLowerCase();
    return athletes.filter(
      a => a.nombre.toLowerCase().includes(query) || a.deporte.toLowerCase().includes(query)
    );
  }, [athletes, searchQuery]);

  const handleToggleAthlete = (athleteId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(athleteId)) {
      newSelected.delete(athleteId);
    } else {
      newSelected.add(athleteId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAthletes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAthletes.map(a => a.id)));
    }
  };

  const handleConfirm = () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Precio inválido',
        description: 'Por favor ingresa un precio válido',
        variant: 'destructive',
      });
      return;
    }

    if (selectedIds.size === 0) {
      toast({
        title: 'Sin selección',
        description: 'Selecciona al menos un deportista',
        variant: 'destructive',
      });
      return;
    }

    onConfirm(Array.from(selectedIds), price);
    toast({
      title: 'Precios actualizados',
      description: `Se actualizó el precio de ${selectedIds.size} deportista(s) a ${currencySymbol}${price.toLocaleString()}`,
    });
    handleClose();
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setNewPrice('');
    setSearchQuery('');
    onOpenChange(false);
  };

  const allSelected = filteredAthletes.length > 0 && selectedIds.size === filteredAthletes.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredAthletes.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Modificar Precios
          </DialogTitle>
          <DialogDescription>
            Selecciona los deportistas y establece el nuevo precio mensual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* New Price Input */}
          <div className="space-y-2">
            <Label htmlFor="newPrice">Nuevo precio mensual ({currencySymbol})</Label>
            <Input
              id="newPrice"
              type="number"
              placeholder="Ej: 150000"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
          </div>

          {/* Search */}
          <Input
            placeholder="Buscar deportista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Select All */}
          <div className="flex items-center justify-between py-2 border-b">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="h-5 w-5 text-primary" />
              ) : someSelected ? (
                <div className="h-5 w-5 border-2 border-primary rounded bg-primary/20" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground" />
              )}
              Seleccionar todos
            </button>
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} de {athletes.length} seleccionados
            </span>
          </div>

          {/* Athletes List */}
          <ScrollArea className="flex-1 min-h-0 max-h-[300px]">
            <div className="space-y-1 pr-4">
              {filteredAthletes.map((athlete) => (
                <div
                  key={athlete.id}
                  onClick={() => handleToggleAthlete(athlete.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedIds.has(athlete.id)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/50 border border-transparent hover:bg-muted'
                  }`}
                >
                  <Checkbox
                    checked={selectedIds.has(athlete.id)}
                    onCheckedChange={() => handleToggleAthlete(athlete.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {athlete.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {athlete.deporte} • Actual: {currencySymbol}{athlete.montoMensual.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Confirmation Summary */}
          {selectedIds.size > 0 && newPrice && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  Aplicar {currencySymbol}{parseFloat(newPrice).toLocaleString()} a {selectedIds.size} deportista(s)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1 gradient-primary"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0 || !newPrice}
          >
            Confirmar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
