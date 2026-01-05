import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { PaymentModal } from '@/components/athletes/PaymentModal';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Users } from 'lucide-react';
import { SPORTS } from '@/data/countries';

export default function Athletes() {
  const { 
    athletes, 
    establecimiento, 
    userRole,
    addAthlete,
    registerPayment,
    markAsPending,
    markAsInactive,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New athlete form state
  const [newAthlete, setNewAthlete] = useState({
    nombre: '',
    deporte: '',
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

  const handleConfirmPayment = (metodoPago: string, referencia?: string, observaciones?: string) => {
    if (selectedAthlete) {
      registerPayment(selectedAthlete.id, metodoPago, referencia, observaciones);
    }
  };

  const handleAddAthlete = () => {
    const proximoPago = new Date();
    proximoPago.setDate(parseInt(newAthlete.diaPago));
    if (proximoPago < new Date()) {
      proximoPago.setMonth(proximoPago.getMonth() + 1);
    }

    addAthlete({
      establecimientoId: establecimiento?.id || '',
      nombre: newAthlete.nombre,
      deporte: newAthlete.deporte,
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
      telefono: '',
      email: '',
      montoMensual: '',
      diaPago: '1',
    });
    setAddModalOpen(false);
  };

  const currencySymbol = establecimiento?.simboloMoneda || '$';
  const isAdmin = userRole === 'admin';

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deportistas</h1>
            <p className="text-sm text-muted-foreground">{athletes.length} registrados</p>
          </div>
          
          {isAdmin && (
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] mx-4">
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deporte">Deporte</Label>
                    <Select
                      value={newAthlete.deporte}
                      onValueChange={(value) => setNewAthlete({ ...newAthlete, deporte: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar deporte" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPORTS.map((sport) => (
                          <SelectItem key={sport} value={sport}>
                            {sport}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        placeholder="+57 300..."
                        value={newAthlete.telefono}
                        onChange={(e) => setNewAthlete({ ...newAthlete, telefono: e.target.value })}
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
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monto">Monto mensual ({currencySymbol})</Label>
                      <Input
                        id="monto"
                        type="number"
                        placeholder="150000"
                        value={newAthlete.montoMensual}
                        onChange={(e) => setNewAthlete({ ...newAthlete, montoMensual: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diaPago">Día de pago</Label>
                      <Select
                        value={newAthlete.diaPago}
                        onValueChange={(value) => setNewAthlete({ ...newAthlete, diaPago: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
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
                    className="flex-1"
                    onClick={() => setAddModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 gradient-primary"
                    onClick={handleAddAthlete}
                    disabled={!newAthlete.nombre || !newAthlete.deporte || !newAthlete.montoMensual}
                  >
                    Guardar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o deporte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Athletes List */}
        <div className="space-y-3">
          {filteredAthletes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron deportistas</p>
              {isAdmin && (
                <Button 
                  variant="link" 
                  className="mt-2"
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

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        athlete={selectedAthlete}
        paymentMethods={establecimiento?.metodosPago || []}
        currencySymbol={currencySymbol}
        onConfirm={handleConfirmPayment}
      />
    </AppLayout>
  );
}
