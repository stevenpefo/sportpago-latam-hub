import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CreditCard, LayoutDashboard, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/i18n';

type Message = {
  eyebrow: string;
  title: string;
  subtitle: string;
  features: { title: string; description: string }[];
  note: string;
  signup: string;
  login: string;
  back: string;
};

const messages: Record<Language, Message> = {
  es: {
    eyebrow: 'Conoce SportPago',
    title: 'Menos tiempo administrando. Más tiempo entrenando.',
    subtitle: 'Una vista rápida de las herramientas para organizar deportistas, pagos y el trabajo de tu academia.',
    features: [
      { title: 'Deportistas organizados', description: 'Mantén la información de tus atletas en un solo lugar.' },
      { title: 'Seguimiento de pagos', description: 'Consulta estados y movimientos desde la plataforma.' },
      { title: 'Panel de control', description: 'Revisa información clave de tu academia.' },
      { title: 'Acceso para asistentes', description: 'Trabaja con colaboradores mediante permisos por rol.' },
    ],
    note: 'Esta es una presentación de funciones, no una cuenta de demostración ni datos reales.',
    signup: 'Crear mi cuenta',
    login: 'Ya tengo una cuenta',
    back: 'Volver',
  },
  en: {
    eyebrow: 'Explore SportPago',
    title: 'Less admin. More coaching.',
    subtitle: 'A quick look at the tools that help you organize athletes, payments and your sports academy.',
    features: [
      { title: 'Organized athlete records', description: 'Keep athlete information in one place.' },
      { title: 'Payment tracking', description: 'Review payment statuses and transactions.' },
      { title: 'Management dashboard', description: 'See key information about your academy.' },
      { title: 'Assistant access', description: 'Collaborate with role-based permissions.' },
    ],
    note: 'This is a feature overview, not a live demo account or real customer data.',
    signup: 'Create my account',
    login: 'I already have an account',
    back: 'Back',
  },
  fr: {
    eyebrow: 'Découvrir SportPago',
    title: 'Moins d’administration. Plus de coaching.',
    subtitle: 'Découvrez les outils pour organiser vos sportifs, vos paiements et votre club.',
    features: [
      { title: 'Sportifs organisés', description: 'Centralisez les informations de vos sportifs.' },
      { title: 'Suivi des paiements', description: 'Consultez les statuts et les transactions.' },
      { title: 'Tableau de bord', description: 'Retrouvez les informations clés de votre club.' },
      { title: 'Accès des assistants', description: 'Collaborez avec des autorisations adaptées aux rôles.' },
    ],
    note: 'Ceci est une présentation des fonctions, et non un compte de démonstration ni des données réelles.',
    signup: 'Créer mon compte',
    login: 'J’ai déjà un compte',
    back: 'Retour',
  },
  pt: {
    eyebrow: 'Conheça o SportPago',
    title: 'Menos administração. Mais tempo para treinar.',
    subtitle: 'Conheça as ferramentas para organizar atletas, pagamentos e sua academia esportiva.',
    features: [
      { title: 'Atletas organizados', description: 'Mantenha os dados dos atletas em um só lugar.' },
      { title: 'Controle de pagamentos', description: 'Acompanhe situações de pagamento e transações.' },
      { title: 'Painel de gestão', description: 'Consulte informações importantes da academia.' },
      { title: 'Acesso de assistentes', description: 'Colabore com permissões por função.' },
    ],
    note: 'Esta é uma apresentação dos recursos, não uma conta de demonstração ou dados reais.',
    signup: 'Criar minha conta',
    login: 'Já tenho uma conta',
    back: 'Voltar',
  },
};

const icons = [Users, CreditCard, LayoutDashboard, ShieldCheck];

export default function Explore() {
  const { language } = useLanguage();
  const m = messages[language];

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> {m.back}
        </Link>
        <div className="mt-10 max-w-2xl">
          <p className="text-sm font-semibold text-primary">{m.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{m.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{m.subtitle}</p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {m.features.map((feature, index) => {
            const Icon = icons[index];
            return (
              <Card key={feature.title}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Icon className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{feature.description}</CardContent>
              </Card>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">{m.note}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/auth?tab=signup">{m.signup}<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">{m.login}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
