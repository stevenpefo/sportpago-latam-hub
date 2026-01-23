import { useState } from 'react';
import logoSportPago from '@/assets/logo-sportpago.png';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Mail, Lock, User, UserPlus, Globe, Building2 } from 'lucide-react';
import { z } from 'zod';
import { LANGUAGES, Language } from '@/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Validation schemas
const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');
const nameSchema = z.string().min(2, 'El nombre debe tener al menos 2 caracteres');

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithAccessCode } = useAuthContext();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  
  // Staff state
  const [clubCode, setClubCode] = useState('');
  const [staffPin, setStaffPin] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate inputs
      const emailResult = emailSchema.safeParse(loginEmail);
      if (!emailResult.success) {
        toast({
          title: t('common.error'),
          description: emailResult.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const passwordResult = passwordSchema.safeParse(loginPassword);
      if (!passwordResult.success) {
        toast({
          title: t('common.error'),
          description: passwordResult.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        let errorMessage = error;
        if (error.includes('Invalid login credentials')) {
          errorMessage = t('login.invalidCredentials');
        } else if (error.includes('Email not confirmed')) {
          errorMessage = t('login.emailNotConfirmed');
        }
        
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('login.welcomeBack'),
          description: t('login.loginSuccess'),
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate inputs
      const nameResult = nameSchema.safeParse(signupName);
      if (!nameResult.success) {
        toast({
          title: t('common.error'),
          description: nameResult.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const emailResult = emailSchema.safeParse(signupEmail);
      if (!emailResult.success) {
        toast({
          title: t('common.error'),
          description: emailResult.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const passwordResult = passwordSchema.safeParse(signupPassword);
      if (!passwordResult.success) {
        toast({
          title: t('common.error'),
          description: passwordResult.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      if (signupPassword !== signupConfirmPassword) {
        toast({
          title: t('common.error'),
          description: t('login.passwordsDoNotMatch'),
          variant: 'destructive',
        });
        return;
      }

      const { error } = await signUp(signupEmail, signupPassword, signupName);
      
      if (error) {
        let errorMessage = error;
        if (error.includes('User already registered')) {
          errorMessage = t('login.userAlreadyExists');
        }
        
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('login.signupSuccess'),
          description: t('login.signupSuccessDesc'),
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate club code format (4-6 alphanumeric)
      if (!/^[A-Z0-9]{4,6}$/i.test(clubCode)) {
        toast({
          title: t('common.error'),
          description: t('login.invalidClubCodeFormat'),
          variant: 'destructive',
        });
        return;
      }

      const { error, needsLinking } = await signInWithAccessCode(clubCode, staffPin);
      
      if (error) {
        const errorMessages: Record<string, string> = {
          'invalidClubCode': t('login.invalidClubCode'),
          'invalidPin': t('login.invalidPin'),
          'codeAlreadyLinked': t('login.codeAlreadyLinked'),
        };
        
        toast({
          title: t('common.error'),
          description: errorMessages[error] || error,
          variant: 'destructive',
        });
      } else if (needsLinking) {
        toast({
          title: t('login.staffCodeValid'),
          description: t('login.staffNeedsAccount'),
        });
        // For now, we'll show a message that they need to register
        setActiveTab('signup');
      } else {
        toast({
          title: t('login.welcomeBack'),
          description: t('login.staffLoginSuccess'),
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-lg">{LANGUAGES.find(l => l.code === language)?.flag}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={language === lang.code ? 'bg-accent' : ''}
              >
                <span className="mr-2 text-lg">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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

      {/* Auth Card */}
      <Card className="w-full max-w-md animate-slide-up">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="pb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login" className="gap-1 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t('auth.login')}</span>
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-1 text-xs sm:text-sm">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('auth.signup')}</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="gap-1 text-xs sm:text-sm">
                <KeyRound className="h-4 w-4" />
                <span className="hidden sm:inline">{t('login.assistant')}</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* Login Tab */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => setActiveTab('signup')}
                    type="button"
                  >
                    {t('login.signUpHere')}
                  </Button>
                </p>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('auth.name')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={t('login.namePlaceholder')}
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">{t('auth.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
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
                  {isLoading ? t('common.loading') : t('auth.signup')}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {t('auth.hasAccount')}{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => setActiveTab('login')}
                    type="button"
                  >
                    {t('auth.loginHere')}
                  </Button>
                </p>
              </form>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="mt-0">
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="club-code">{t('login.clubCode')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('login.clubCodeDesc')}
                  </p>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="club-code"
                      type="text"
                      placeholder={t('login.clubCodePlaceholder')}
                      value={clubCode}
                      onChange={(e) => setClubCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                      className="pl-10 text-center text-xl tracking-widest font-mono uppercase"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-pin">{t('login.personalPin')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('login.personalPinDesc')}
                  </p>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="staff-pin"
                      type="text"
                      placeholder="123456"
                      value={staffPin}
                      onChange={(e) => setStaffPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 text-center text-2xl tracking-[0.5em] font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={isLoading || clubCode.length < 4 || staffPin.length !== 6}
                >
                  {isLoading ? t('login.verifying') : t('login.access')}
                </Button>
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
