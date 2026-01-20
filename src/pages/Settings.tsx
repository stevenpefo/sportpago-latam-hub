import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
  Dumbbell,
  Languages,
} from 'lucide-react';
import { COUNTRIES, DEFAULT_PAYMENT_METHODS, SPORTS } from '@/data/countries';
import { LANGUAGES, Language } from '@/i18n';
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
  const { 
    establecimiento, 
    setupEstablecimiento, 
    updatePaymentMethods, 
    updateEstablecimientoLogo,
    enabledSports,
    updateEnabledSports,
    customSports,
    addCustomSport,
    deleteCustomSport,
  } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodIcon, setNewMethodIcon] = useState('wallet');
  const [addSportOpen, setAddSportOpen] = useState(false);
  const [newSportName, setNewSportName] = useState('');

  // All available sports (predefined + custom)
  const allSports = [...SPORTS.filter(s => s !== 'Otros'), ...customSports];

  const handleToggleSport = (sport: string, checked: boolean) => {
    if (checked) {
      updateEnabledSports([...enabledSports, sport]);
    } else {
      updateEnabledSports(enabledSports.filter(s => s !== sport));
    }
    toast({
      title: checked ? t('settings.sportActivated') : t('settings.sportDeactivated'),
      description: sport,
    });
  };

  const handleSelectAllSports = () => {
    if (enabledSports.length === allSports.length) {
      updateEnabledSports([]);
    } else {
      updateEnabledSports([...allSports]);
    }
  };

  const handleAddCustomSport = () => {
    if (!newSportName.trim()) return;
    
    // Check if sport already exists
    if (allSports.some(s => s.toLowerCase() === newSportName.trim().toLowerCase())) {
      toast({
        title: t('settings.sportExists'),
        description: t('settings.sportExistsDesc'),
        variant: 'destructive',
      });
      return;
    }

    addCustomSport(newSportName.trim());
    toast({
      title: t('settings.sportAdded'),
      description: `${newSportName}`,
    });
    setNewSportName('');
    setAddSportOpen(false);
  };

  const handleDeleteCustomSport = (sport: string) => {
    deleteCustomSport(sport);
    toast({
      title: t('settings.sportDeleted'),
      description: sport,
    });
  };

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
        title: t('settings.countryUpdated'),
        description: `${country.currencySymbol} (${country.currency})`,
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
      title: t('settings.methodAdded'),
      description: newMethodName,
    });
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    if (!establecimiento?.metodosPago) return;
    
    updatePaymentMethods(
      establecimiento.metodosPago.filter(m => m.id !== methodId)
    );
    
    toast({
      title: t('settings.methodDeleted'),
    });
  };

  const currentCountry = COUNTRIES.find(c => c.code === establecimiento?.pais);

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Establishment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              {t('settings.establishment')}
            </CardTitle>
            <CardDescription>
              {t('settings.establishmentDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">{t('settings.name')}</Label>
              <Input
                id="nombre"
                value={establecimiento?.nombre || ''}
                onChange={(e) => setupEstablecimiento({ nombre: e.target.value })}
                placeholder={t('settings.namePlaceholder')}
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
              {t('settings.countryAndCurrency')}
            </CardTitle>
            <CardDescription>
              {t('settings.countryAndCurrencyDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.country')}</Label>
              <Select
                value={establecimiento?.pais || ''}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.selectCountry')} />
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
                <p className="text-sm text-muted-foreground">{t('settings.configuredCurrency')}:</p>
                <p className="text-lg font-semibold">
                  {currentCountry.currencySymbol} ({currentCountry.currency})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academy Sports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  {t('settings.sports')}
                </CardTitle>
                <CardDescription>
                  {t('settings.sportsDesc')}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Dialog open={addSportOpen} onOpenChange={setAddSportOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="min-h-[44px]">
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{t('settings.createSport')}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] mx-4">
                    <DialogHeader>
                      <DialogTitle>{t('settings.newSport')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{t('settings.sportName')}</Label>
                        <Input
                          placeholder={t('settings.sportNamePlaceholder')}
                          value={newSportName}
                          onChange={(e) => setNewSportName(e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px]"
                        onClick={() => setAddSportOpen(false)}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        className="flex-1 gradient-primary min-h-[44px]"
                        onClick={handleAddCustomSport}
                        disabled={!newSportName.trim()}
                      >
                        {t('common.add')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllSports}
                  className="min-h-[44px] hidden sm:flex"
                >
                  {enabledSports.length === allSports.length ? t('settings.removeAll') : t('common.all')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Custom Sports Section */}
            {customSports.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('settings.customSports')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {customSports.map((sport) => {
                    const isEnabled = enabledSports.includes(sport);
                    return (
                      <div
                        key={sport}
                        className={cn(
                          'flex items-center justify-between gap-2 p-3 rounded-lg border transition-all min-h-[44px]',
                          isEnabled 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        )}
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <Checkbox
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleToggleSport(sport, checked as boolean)}
                          />
                          <span className={cn(
                            'text-sm truncate',
                            isEnabled ? 'font-medium text-foreground' : 'text-muted-foreground'
                          )}>
                            {sport}
                          </span>
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive shrink-0"
                          onClick={() => handleDeleteCustomSport(sport)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Predefined Sports */}
            <div>
              {customSports.length > 0 && (
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('settings.predefinedSports')}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SPORTS.filter(s => s !== 'Otros').map((sport) => {
                  const isEnabled = enabledSports.includes(sport);
                  return (
                    <label
                      key={sport}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[44px]',
                        isEnabled 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleToggleSport(sport, checked as boolean)}
                      />
                      <span className={cn(
                        'text-sm',
                        isEnabled ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}>
                        {sport}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            
            {enabledSports.length === 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                💡 {t('settings.noSportsHint')}
              </p>
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
                  {t('settings.paymentMethods')}
                </CardTitle>
                <CardDescription>
                  {t('settings.paymentMethodsDesc')}
                </CardDescription>
              </div>
              
              <Dialog open={addMethodOpen} onOpenChange={setAddMethodOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('common.add')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] mx-4">
                  <DialogHeader>
                    <DialogTitle>{t('settings.newPaymentMethod')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('settings.name')}</Label>
                      <Input
                        placeholder={t('settings.paymentMethodPlaceholder')}
                        value={newMethodName}
                        onChange={(e) => setNewMethodName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('settings.icon')}</Label>
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
                      {t('common.cancel')}
                    </Button>
                    <Button
                      className="flex-1 gradient-primary"
                      onClick={handleAddPaymentMethod}
                      disabled={!newMethodName.trim()}
                    >
                      {t('common.add')}
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
                          <p className="text-xs text-muted-foreground">{t('common.custom')}</p>
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

        {/* Language Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-5 w-5 text-primary" />
              {t('settings.language')}
            </CardTitle>
            <CardDescription>
              {t('settings.languageDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    toast({
                      title: lang.nativeName,
                      description: lang.name,
                    });
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all min-h-[80px]',
                    language === lang.code
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={cn(
                    'text-sm font-medium',
                    language === lang.code ? 'text-primary' : 'text-foreground'
                  )}>
                    {lang.nativeName}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}