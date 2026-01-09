import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Building2, 
  Globe, 
  CreditCard, 
  Plus, 
  Trash2,
  Banknote,
  Wallet,
  Smartphone,
} from 'lucide-react';
import { COUNTRIES, DEFAULT_PAYMENT_METHODS } from '@/data/countries';
import { PaymentMethod } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LogoUpload } from '@/components/settings/LogoUpload';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'banknote': Banknote,
  'building-2': Building2,
  'credit-card': CreditCard,
  'wallet': Wallet,
  'smartphone': Smartphone,
};

export default function Settings() {
  const { establecimiento, setupEstablecimiento, updatePaymentMethods, updateEstablecimientoLogo } = useApp();
  const { toast } = useToast();
  
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodIcon, setNewMethodIcon] = useState('wallet');

  const handleLogoChange = (logoUrl: string | null) => {
    if (updateEstablecimientoLogo) {
      updateEstablecimientoLogo(logoUrl);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setupEstablecimiento({
        pais: country.code,
        moneda: country.currency,
        simboloMoneda: country.currencySymbol,
      });
      toast({
        title: 'País actualizado',
        description: `Moneda configurada: ${country.currencySymbol} (${country.currency})`,
      });
    }
  };

  const handleTogglePaymentMethod = (methodId: string, activo: boolean) => {
    if (!establecimiento?.metodosPago) return;
    
    const updatedMethods = establecimiento.metodosPago.map(m =>
      m.id === methodId ? { ...m, activo } : m
    );
    updatePaymentMethods(updatedMethods);
  };

  const handleAddPaymentMethod = () => {
    if (!newMethodName.trim() || !establecimiento?.metodosPago) return;

    const newMethod: PaymentMethod = {
      id: `custom-${Date.now()}`,
      nombre: newMethodName,
      icono: newMethodIcon,
      activo: true,
      esPersonalizado: true,
    };

    updatePaymentMethods([...establecimiento.metodosPago, newMethod]);
    setNewMethodName('');
    setNewMethodIcon('wallet');
    setAddMethodOpen(false);
    
    toast({
      title: 'Método agregado',
      description: `${newMethodName} ahora está disponible`,
    });
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    if (!establecimiento?.metodosPago) return;
    
    updatePaymentMethods(
      establecimiento.metodosPago.filter(m => m.id !== methodId)
    );
    
    toast({
      title: 'Método eliminado',
    });
  };

  const currentCountry = COUNTRIES.find(c => c.code === establecimiento?.pais);

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Configura tu establecimiento
          </p>
        </div>

        {/* Establishment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Establecimiento
            </CardTitle>
            <CardDescription>
              Información general de tu academia o club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={establecimiento?.nombre || ''}
                onChange={(e) => setupEstablecimiento({ nombre: e.target.value })}
                placeholder="Mi Academia Deportiva"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <LogoUpload
          currentLogoUrl={establecimiento?.logoUrl}
          onLogoChange={handleLogoChange}
          establecimientoId={establecimiento?.id}
        />

        {/* Country & Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              País y Moneda
            </CardTitle>
            <CardDescription>
              Configura tu ubicación y moneda local
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Select
                value={establecimiento?.pais || ''}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentCountry && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Moneda configurada:</p>
                <p className="text-lg font-semibold">
                  {currentCountry.currencySymbol} ({currentCountry.currency})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Métodos de Pago
                </CardTitle>
                <CardDescription>
                  Activa los métodos de pago disponibles
                </CardDescription>
              </div>
              
              <Dialog open={addMethodOpen} onOpenChange={setAddMethodOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] mx-4">
                  <DialogHeader>
                    <DialogTitle>Nuevo Método de Pago</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        placeholder="Ej: Nequi, Mercado Pago, Yape..."
                        value={newMethodName}
                        onChange={(e) => setNewMethodName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Ícono</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(iconMap).map(([key, Icon]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setNewMethodIcon(key)}
                            className={cn(
                              'p-3 rounded-lg border-2 transition-all',
                              newMethodIcon === key
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <Icon className={cn(
                              'h-5 w-5 mx-auto',
                              newMethodIcon === key ? 'text-primary' : 'text-muted-foreground'
                            )} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setAddMethodOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 gradient-primary"
                      onClick={handleAddPaymentMethod}
                      disabled={!newMethodName.trim()}
                    >
                      Agregar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {establecimiento?.metodosPago.map((method) => {
                const Icon = iconMap[method.icono] || Wallet;
                
                return (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{method.nombre}</p>
                        {method.esPersonalizado && (
                          <p className="text-xs text-muted-foreground">Personalizado</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {method.esPersonalizado && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Switch
                        checked={method.activo}
                        onCheckedChange={(checked) => handleTogglePaymentMethod(method.id, checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
