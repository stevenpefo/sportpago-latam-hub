import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Athlete, StaffUser } from '@/types';
import { Search, User, Users } from 'lucide-react';

interface StaffAthleteAssignment {
  staffId: string;
  athleteId: string;
}

interface StaffAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffUser;
  athletes: Athlete[];
  assignments: StaffAthleteAssignment[];
  onAssignmentsChange: (staffId: string, athleteIds: string[]) => void;
}

export function StaffAssignmentModal({
  open,
  onOpenChange,
  staff,
  athletes,
  assignments,
  onAssignmentsChange,
}: StaffAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get currently assigned athlete IDs for this staff member
  const assignedAthleteIds = useMemo(() => {
    return assignments
      .filter(a => a.staffId === staff.id)
      .map(a => a.athleteId);
  }, [assignments, staff.id]);

  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>(assignedAthleteIds);

  // Update selected when modal opens with new data
  useState(() => {
    setSelectedAthleteIds(assignedAthleteIds);
  });

  const filteredAthletes = useMemo(() => {
    if (!searchTerm.trim()) return athletes;
    const term = searchTerm.toLowerCase();
    return athletes.filter(a => 
      a.nombre.toLowerCase().includes(term) ||
      a.deporte.toLowerCase().includes(term)
    );
  }, [athletes, searchTerm]);

  const handleToggleAthlete = (athleteId: string) => {
    setSelectedAthleteIds(prev => {
      if (prev.includes(athleteId)) {
        return prev.filter(id => id !== athleteId);
      } else {
        return [...prev, athleteId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAthleteIds.length === filteredAthletes.length) {
      setSelectedAthleteIds([]);
    } else {
      setSelectedAthleteIds(filteredAthletes.map(a => a.id));
    }
  };

  const handleSave = () => {
    onAssignmentsChange(staff.id, selectedAthleteIds);
    onOpenChange(false);
  };

  const allSelected = selectedAthleteIds.length === filteredAthletes.length && filteredAthletes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignar deportistas a {staff.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar deportista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedAthleteIds.length} de {athletes.length} seleccionados
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </Button>
          </div>

          {/* Athletes List */}
          <ScrollArea className="h-[300px] border rounded-lg">
            <div className="p-2 space-y-1">
              {filteredAthletes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron deportistas</p>
                </div>
              ) : (
                filteredAthletes.map((athlete) => {
                  const isSelected = selectedAthleteIds.includes(athlete.id);
                  return (
                    <div
                      key={athlete.id}
                      onClick={() => handleToggleAthlete(athlete.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleAthlete(athlete.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {athlete.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {athlete.deporte}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          athlete.estadoSistema === 'al-dia' 
                            ? 'border-status-success text-status-success' 
                            : athlete.estadoSistema === 'por-vencer'
                            ? 'border-status-warning text-status-warning'
                            : 'border-status-danger text-status-danger'
                        }
                      >
                        {athlete.estadoSistema === 'al-dia' ? 'Al día' : 
                         athlete.estadoSistema === 'por-vencer' ? 'Por vencer' : 'Vencido'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 gradient-primary"
              onClick={handleSave}
            >
              Guardar asignaciones
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
