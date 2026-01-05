import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Users, Copy, Trash2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Staff() {
  const { staff, establecimiento, addStaff, updateStaff, deleteStaff } = useApp();
  const { toast } = useToast();
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');

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
                        <h3 className="font-semibold text-foreground">
                          {member.nombre}
                        </h3>
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

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
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
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
