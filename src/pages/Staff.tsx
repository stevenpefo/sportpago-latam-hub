import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Users, Copy, Trash2, KeyRound, UserPlus, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StaffAssignmentModal } from '@/components/staff/StaffAssignmentModal';
import { StaffUser } from '@/types';

export default function Staff() {
  const { staff, athletes, establecimiento, staffAssignments, addStaff, updateStaff, deleteStaff, updateStaffAssignments } = useApp();
  const { toast } = useToast();
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;

    addStaff({
      establecimientoId: establecimiento?.id || '',
      adminId: 'admin1',
      nombre: newStaffName,
      permisos: ['ver-deportistas', 'registrar-pagos'],
      activo: true,
    });

    setNewStaffName('');
    setAddModalOpen(false);
    
    toast({
      title: 'Asistente invitado',
      description: 'Se ha generado un código de acceso',
    });
  };

  const handleCopyCode = (code: string, nombre: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Código copiado',
      description: `Código de ${nombre}: ${code}`,
    });
  };

  const handleToggleActive = (id: string, activo: boolean) => {
    updateStaff(id, { activo });
    toast({
      title: activo ? 'Asistente activado' : 'Asistente desactivado',
    });
  };

  const handleDelete = (id: string) => {
    deleteStaff(id);
    toast({
      title: 'Asistente eliminado',
    });
  };

  const handleOpenAssignments = (member: StaffUser) => {
    setSelectedStaff(member);
    setAssignmentModalOpen(true);
  };

  const handleAssignmentsChange = (staffId: string, athleteIds: string[]) => {
    updateStaffAssignments(staffId, athleteIds);
    toast({
      title: 'Asignaciones actualizadas',
      description: `${athleteIds.length} deportista(s) asignado(s)`,
    });
  };

  const getAssignedCount = (staffId: string) => {
    return staffAssignments.filter(a => a.staffId === staffId).length;
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus asistentes
            </p>
          </div>
          
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Invitar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] mx-4">
              <DialogHeader>
                <DialogTitle>Invitar Asistente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="staffName">Nombre del asistente</Label>
                  <Input
                    id="staffName"
                    placeholder="Ej: Pedro García"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Se generará automáticamente:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Código de acceso de 6 dígitos</li>
                    <li>• Permisos para ver deportistas</li>
                    <li>• Permisos para registrar pagos</li>
                  </ul>
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
                  onClick={handleAddStaff}
                  disabled={!newStaffName.trim()}
                >
                  Invitar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff List */}
        <div className="space-y-3">
          {staff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tienes asistentes</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setAddModalOpen(true)}
              >
                Invitar al primero
              </Button>
            </div>
          ) : (
            staff.map((member) => {
              const initials = member.nombre
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              const assignedCount = getAssignedCount(member.id);

              return (
                <Card key={member.id} className="p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {member.nombre}
                          </h3>
                          {assignedCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {assignedCount} deportista{assignedCount !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <Switch
                          checked={member.activo}
                          onCheckedChange={(checked) => handleToggleActive(member.id, checked)}
                        />
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {member.activo ? 'Activo' : 'Desactivado'}
                      </p>

                      {/* Access Code */}
                      <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-lg">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-lg tracking-wider flex-1">
                          {member.codigoAcceso}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(member.codigoAcceso, member.nombre)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Actions - Responsive layout */}
                      <div className="flex items-center gap-2 mt-3">
                        {/* Desktop: Full buttons */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssignments(member)}
                          className="hidden sm:flex"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Asignar deportistas
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hidden sm:flex">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar asistente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. {member.nombre} ya no podrá acceder al sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(member.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Mobile: Compact dropdown menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="sm:hidden min-h-[44px]">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleOpenAssignments(member)} className="min-h-[44px]">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Asignar deportistas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="min-h-[44px] text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar asistente?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. {member.nombre} ya no podrá acceder al sistema.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(member.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Staff Assignment Modal */}
      {selectedStaff && (
        <StaffAssignmentModal
          open={assignmentModalOpen}
          onOpenChange={setAssignmentModalOpen}
          staff={selectedStaff}
          athletes={athletes}
          assignments={staffAssignments}
          onAssignmentsChange={handleAssignmentsChange}
        />
      )}
    </AppLayout>
  );
}
