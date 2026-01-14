import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { PaymentModal } from '@/components/athletes/PaymentModal';
import { BulkPriceModal } from '@/components/athletes/BulkPriceModal';
import { useApp } from '@/context/AppContext';
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
import { Plus, Search, Users, CalendarIcon, DollarSign, Dumbbell } from 'lucide-react';
import { SPORTS } from '@/data/countries';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Athletes() {
  const { 
    athletes, 
    establecimiento, 
    userRole,
    addAthlete,
    updateAthletePrices,
    registerPayment,
    markAsPending,
    markAsInactive,
    customCategories,
    addCustomCategory,
    enabledSports,
  } = useApp();

  // Get available sports: if none enabled, show all (backward compatibility)
  const availableSports = enabledSports.length > 0 ? enabledSports : SPORTS;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkPriceModalOpen, setBulkPriceModalOpen] = useState(false);

  // New athlete form state with new fields
  const [newAthlete, setNewAthlete] = useState({
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

  const filteredAthletes = athletes.filter(a =>
    a.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.deporte.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterPayment = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (
    metodoPago: string, 
    mesesPagados: number,
    montoPersonalizado?: number,
    referencia?: string, 
    observaciones?: string
  ) => {
    if (selectedAthlete) {
      registerPayment(selectedAthlete.id, metodoPago, mesesPagados, montoPersonalizado, referencia, observaciones);
    }
  };

  const handleBulkPriceUpdate = (athleteIds: string[], newPrice: number) => {
    updateAthletePrices(athleteIds, newPrice);
  };

  const handleAddAthlete = () => {
    const proximoPago = new Date();
    proximoPago.setDate(parseInt(newAthlete.diaPago));
    if (proximoPago < new Date()) {
      proximoPago.setMonth(proximoPago.getMonth() + 1);
    }

    // If only one sport available, use it automatically
    const selectedSport = availableSports.length === 1 ? availableSports[0] : newAthlete.deporte;
    
    const deporteFinal = selectedSport === 'Otros' 
      ? newAthlete.deportePersonalizado || 'Otros'
      : selectedSport;

    // Save custom category if it's new
    if (newAthlete.categoria.trim()) {
      addCustomCategory(newAthlete.categoria);
    }

    addAthlete({
      establecimientoId: establecimiento?.id || '',
      nombre: newAthlete.nombre,
      deporte: deporteFinal,
      deportePersonalizado: newAthlete.deporte === 'Otros' ? newAthlete.deportePersonalizado : undefined,
      fechaNacimiento: newAthlete.fechaNacimiento,
      categoria: (newAthlete.categoria || undefined) as any,
      telefono: newAthlete.telefono,
      email: newAthlete.email,
      montoMensual: parseFloat(newAthlete.montoMensual) || 0,
      diaPago: parseInt(newAthlete.diaPago),
      proximoPago,
      estadoManual: 'pendiente',
    });

    setNewAthlete({
      nombre: '',
      deporte: '',
      deportePersonalizado: '',
      fechaNacimiento: undefined,
      categoria: '',
      telefono: '',
      email: '',
      montoMensual: '',
      diaPago: '1',
    });
    setAddModalOpen(false);
  };

  const currencySymbol = establecimiento?.simboloMoneda || '$';
  const isAdmin = userRole === 'admin';
  const canAddAthletes = isAdmin || userRole === 'staff';

  return (
    <AppLayout>
      <div className="p-4 space-y-4 pb-24 sm:pb-4">
        {/* Header with Add Button always visible */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Deportistas</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{athletes.length} registrados</p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Bulk Price Button - Admin Only - Hidden on mobile, shown on desktop */}
            {isAdmin && athletes.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBulkPriceModalOpen(true)}
                className="hidden sm:flex min-h-[44px]"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Modificar Precios
              </Button>
            )}
            
            {/* Add Button - Always visible in header */}
            {canAddAthletes && (
              <Button 
                className="gradient-primary min-h-[44px] min-w-[44px] px-3 sm:px-4"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Agregar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o deporte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>

        {/* Athletes List */}
        <div className="space-y-2 sm:space-y-3">
          {filteredAthletes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron deportistas</p>
              {canAddAthletes && (
                <Button 
                  variant="link" 
                  className="mt-2 min-h-[44px]"
                  onClick={() => setAddModalOpen(true)}
                >
                  Agregar el primero
                </Button>
              )}
            </div>
          ) : (
            filteredAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                currencySymbol={currencySymbol}
                onRegisterPayment={handleRegisterPayment}
                onMarkPending={markAsPending}
                onMarkInactive={markAsInactive}
                isStaffView={userRole === 'staff'}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Athlete Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Deportista</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                placeholder="Juan Pérez"
                value={newAthlete.nombre}
                onChange={(e) => setNewAthlete({ ...newAthlete, nombre: e.target.value })}
                className="min-h-[44px]"
              />
            </div>

            {/* Sport - Auto-select if only one, dropdown if multiple */}
            <div className="space-y-2">
              <Label htmlFor="deporte">Deporte</Label>
              {availableSports.length === 1 ? (
                // Auto-complete: only one sport available
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50 min-h-[44px]">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="font-medium">{availableSports[0]}</span>
                  <input type="hidden" value={availableSports[0]} />
                </div>
              ) : (
                // Dropdown for multiple sports
                <Select
                  value={newAthlete.deporte}
                  onValueChange={(value) => setNewAthlete({ ...newAthlete, deporte: value, deportePersonalizado: '' })}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Seleccionar deporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSports.map((sport) => (
                      <SelectItem key={sport} value={sport} className="min-h-[44px]">
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Custom Sport Input - only shows when "Otros" is selected */}
            {newAthlete.deporte === 'Otros' && (
              <div className="space-y-2">
                <Label htmlFor="deportePersonalizado">Especificar deporte</Label>
                <Input
                  id="deportePersonalizado"
                  placeholder="Ej: Patinaje, Escalada..."
                  value={newAthlete.deportePersonalizado}
                  onChange={(e) => setNewAthlete({ ...newAthlete, deportePersonalizado: e.target.value })}
                  className="min-h-[44px]"
                />
              </div>
            )}

            {/* Date of Birth - Spanish calendar */}
            <div className="space-y-2">
              <Label>Fecha de Nacimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal min-h-[44px]',
                      !newAthlete.fechaNacimiento && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newAthlete.fechaNacimiento ? (
                      format(newAthlete.fechaNacimiento, "dd 'de' MMMM 'de' yyyy", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newAthlete.fechaNacimiento}
                    onSelect={(date) => setNewAthlete({ ...newAthlete, fechaNacimiento: date })}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1940}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category - Text input with autocomplete */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <CategoryInput
                value={newAthlete.categoria}
                onChange={(value) => setNewAthlete({ ...newAthlete, categoria: value })}
                savedCategories={customCategories}
                placeholder="Escribe o selecciona una categoría..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  placeholder="+57 300..."
                  value={newAthlete.telefono}
                  onChange={(e) => setNewAthlete({ ...newAthlete, telefono: e.target.value })}
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@..."
                  value={newAthlete.email}
                  onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })}
                  className="min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto mensual ({currencySymbol})</Label>
                <Input
                  id="monto"
                  type="number"
                  placeholder="150000"
                  value={newAthlete.montoMensual}
                  onChange={(e) => setNewAthlete({ ...newAthlete, montoMensual: e.target.value })}
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diaPago">Día de pago</Label>
                <Select
                  value={newAthlete.diaPago}
                  onValueChange={(value) => setNewAthlete({ ...newAthlete, diaPago: value })}
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
              onClick={() => setAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 gradient-primary min-h-[44px]"
              onClick={handleAddAthlete}
              disabled={!newAthlete.nombre || (availableSports.length > 1 && !newAthlete.deporte) || !newAthlete.montoMensual || (newAthlete.deporte === 'Otros' && !newAthlete.deportePersonalizado)}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        athlete={selectedAthlete}
        paymentMethods={establecimiento?.metodosPago || []}
        currencySymbol={currencySymbol}
        onConfirm={handleConfirmPayment}
      />

      <BulkPriceModal
        open={bulkPriceModalOpen}
        onOpenChange={setBulkPriceModalOpen}
        athletes={athletes}
        currencySymbol={currencySymbol}
        onConfirm={handleBulkPriceUpdate}
      />
    </AppLayout>
  );
}
