import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PaymentMethod } from '@/types';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentMethodFilterProps {
  paymentMethods: PaymentMethod[];
  selectedMethods: string[];
  onFilterChange: (selectedMethods: string[]) => void;
}

export function PaymentMethodFilter({
  paymentMethods,
  selectedMethods,
  onFilterChange,
}: PaymentMethodFilterProps) {
  const [open, setOpen] = useState(false);

  const handleToggleMethod = (methodId: string) => {
    if (selectedMethods.includes(methodId)) {
      onFilterChange(selectedMethods.filter(id => id !== methodId));
    } else {
      onFilterChange([...selectedMethods, methodId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMethods.length === paymentMethods.length) {
      onFilterChange([]);
    } else {
      onFilterChange(paymentMethods.map(m => m.id));
    }
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  const activeMethodsCount = selectedMethods.length;
  const allSelected = selectedMethods.length === paymentMethods.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Método de pago
          {activeMethodsCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeMethodsCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Filtrar por método</span>
            {activeMethodsCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1 text-xs text-muted-foreground"
                onClick={handleClearAll}
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-2">
          {/* Select All */}
          <div
            onClick={handleSelectAll}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
          >
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-foreground">
              Todos los métodos
            </span>
          </div>

          <div className="my-2 border-t" />

          {/* Individual Methods */}
          <div className="space-y-1">
            {paymentMethods.filter(m => m.activo).map((method) => (
              <div
                key={method.id}
                onClick={() => handleToggleMethod(method.id)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={selectedMethods.includes(method.id)}
                  onCheckedChange={() => handleToggleMethod(method.id)}
                />
                <span className="text-sm text-foreground">{method.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
