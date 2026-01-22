import { useState } from 'react';
import logoSportPago from '@/assets/logo-sportpago.png';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Mail, Lock, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginStaff } = useApp();
  const { t } = useLanguage();
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
          title: t('login.welcomeBack'),
          description: t('login.loginSuccess'),
        });
        navigate('/dashboard');
      } else {
        toast({
          title: t('common.error'),
          description: t('login.invalidCredentials'),
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
          title: t('login.welcomeBack'),
          description: t('login.staffLoginSuccess'),
        });
        navigate('/dashboard');
      } else {
        toast({
          title: t('common.error'),
          description: t('login.invalidCode'),
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
        <img 
          src={logoSportPago} 
          alt="SportPago Logo" 
          className="h-20 w-20 mx-auto mb-4 drop-shadow-lg"
        />
        <h1 className="text-3xl font-bold text-foreground">SportPago</h1>
        <p className="text-muted-foreground mt-1">{t('login.tagline')}</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md animate-slide-up">
        <Tabs defaultValue="admin" className="w-full">
          <CardHeader className="pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin" className="gap-2">
                <User className="h-4 w-4" />
                {t('login.admin')}
              </TabsTrigger>
              <TabsTrigger value="staff" className="gap-2">
                <KeyRound className="h-4 w-4" />
                {t('login.assistant')}
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="admin" className="mt-0">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
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
                  {isLoading ? t('login.loggingIn') : t('auth.login')}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {t('auth.noAccount')}{' '}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    {t('login.signUpHere')}
                  </Button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="staff" className="mt-0">
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t('login.accessCode')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('login.accessCodeDesc')}
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
                  {isLoading ? t('login.verifying') : t('login.access')}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {t('login.demoCode')}: <span className="font-mono font-bold">123456</span>
                </p>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        SportPago © 2025 • {t('login.footerTagline')}
      </p>
    </div>
  );
}