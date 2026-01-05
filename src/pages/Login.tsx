import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Mail, Lock, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginStaff } = useApp();
  const { toast } = useToast();
  
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(adminEmail, adminPassword);
      if (success) {
        toast({
          title: '¡Bienvenido!',
          description: 'Has iniciado sesión correctamente',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'Credenciales incorrectas',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await loginStaff(staffCode);
      if (success) {
        toast({
          title: '¡Bienvenido!',
          description: 'Has iniciado sesión como asistente',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'Código de acceso incorrecto',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo and Brand */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elevated">
          <span className="text-primary-foreground font-bold text-2xl">SP</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">SportPago</h1>
        <p className="text-muted-foreground mt-1">Gestión de pagos deportivos</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md animate-slide-up">
        <Tabs defaultValue="admin" className="w-full">
          <CardHeader className="pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin" className="gap-2">
                <User className="h-4 w-4" />
                Administrador
              </TabsTrigger>
              <TabsTrigger value="staff" className="gap-2">
                <KeyRound className="h-4 w-4" />
                Asistente
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="admin" className="mt-0">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Regístrate aquí
                  </Button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="staff" className="mt-0">
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de acceso</Label>
                  <p className="text-sm text-muted-foreground">
                    Ingresa el código de 6 dígitos proporcionado por tu administrador
                  </p>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={staffCode}
                      onChange={(e) => setStaffCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 text-center text-2xl tracking-[0.5em] font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={isLoading || staffCode.length !== 6}
                >
                  {isLoading ? 'Verificando...' : 'Acceder'}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Código de demo: <span className="font-mono font-bold">123456</span>
                </p>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        SportPago © 2025 • Gestión de pagos para academias deportivas
      </p>
    </div>
  );
}
