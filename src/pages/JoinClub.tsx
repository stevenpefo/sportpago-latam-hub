import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ShieldCheck, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { Language } from '@/i18n';
import { CLUB_JOIN_ENABLED } from '@/components/athletes/ClubSelfRegistration';

type Copy = {
  eyebrow: string; title: string; intro: string; athleteName: string; sport: string;
  guardian: string; contactName: string; contactEmail: string; phone: string;
  privacy: string; submit: string; success: string; successMessage: string;
  unavailable: string; unavailableDesc: string; error: string; home: string;
  note: string; placeholderAthlete: string; placeholderSport: string; placeholderContact: string;
};

const copies: Record<Language, Copy> = {
  es: {
    eyebrow: 'SportPago · Inscripción de deportistas', title: 'Inscripción al club', intro: 'Completa los datos para solicitar el registro del deportista. El entrenador revisará tu solicitud.',
    athleteName: 'Nombre del deportista', sport: 'Deporte o disciplina', guardian: 'Soy su padre, madre o acudiente',
    contactName: 'Nombre de quien completa el formulario', contactEmail: 'Correo de contacto',
    phone: 'Teléfono de contacto (opcional)', privacy: 'Confirmo que soy mayor de edad, que tengo autorización para proporcionar estos datos y que he leído la política de privacidad.',
    submit: 'Enviar solicitud', success: 'Solicitud enviada', successMessage: 'El club recibió la solicitud y podrá revisarla. Todavía no estás inscrito oficialmente.',
    unavailable: 'Enlace no disponible', unavailableDesc: 'Comprueba que el enlace esté completo o solicita uno nuevo a tu entrenador.',
    error: 'No pudimos enviar la solicitud. Verifica los datos o consulta con tu entrenador.',
    home: 'Ir a SportPago', note: 'No necesitas crear una cuenta. No compartas contraseñas ni documentos de identidad.',
    placeholderAthlete: 'Nombre y apellido', placeholderSport: 'Ej. Fútbol, natación...', placeholderContact: 'Nombre y apellido',
  },
  en: {
    eyebrow: 'SportPago · Athlete enrollment', title: 'Join your sports club',
    intro: 'Fill out this form to request enrollment. Your coach will review the information.',
    athleteName: "Athlete's name", sport: 'Sport or activity', guardian: "I'm the parent or legal guardian",
    contactName: "Contact person's name", contactEmail: 'Contact email', phone: 'Contact phone (optional)',
    privacy: "I confirm that I'm an adult, authorized to provide this information, and have read the privacy policy.",
    submit: 'Submit request', success: 'Request received',
    successMessage: 'Your club received your request and will review it. Enrollment is not confirmed yet.',
    unavailable: 'Link unavailable', unavailableDesc: 'Check the link or ask your coach for a new one.',
    error: 'We could not submit your request. Check the information or contact your coach.',
    home: 'Open SportPago', note: "No account is required. Never share passwords or identity documents.",
    placeholderAthlete: 'First and last name', placeholderSport: 'e.g. Soccer, swimming...', placeholderContact: 'First and last name',
  },
  fr: {
    eyebrow: 'SportPago · Inscription sportive', title: 'Rejoindre votre club',
    intro: 'Remplissez ce formulaire pour demander l’inscription. Votre entraîneur examinera la demande.',
    athleteName: 'Nom du sportif', sport: 'Sport ou discipline', guardian: 'Je suis le parent ou responsable légal',
    contactName: 'Nom de la personne à contacter', contactEmail: 'Adresse e-mail de contact', phone: 'Téléphone (facultatif)',
    privacy: "Je confirme être majeur, être autorisé à transmettre ces données et avoir lu la politique de confidentialité.",
    submit: 'Envoyer la demande', success: 'Demande envoyée',
    successMessage: "Votre club a reçu la demande. L'inscription n'est pas encore confirmée.",
    unavailable: 'Lien indisponible', unavailableDesc: "Vérifiez le lien ou demandez-en un nouveau à votre entraîneur.",
    error: "Impossible d'envoyer la demande. Vérifiez vos données ou contactez votre entraîneur.",
    home: 'Ouvrir SportPago', note: "Aucun compte nécessaire. Ne transmettez ni mot de passe ni document d'identité.",
    placeholderAthlete: 'Prénom et nom', placeholderSport: 'Ex. football, natation...', placeholderContact: 'Prénom et nom',
  },
  pt: {
    eyebrow: 'SportPago · Inscrição de atletas', title: 'Entre no seu clube',
    intro: 'Preencha os dados para solicitar a inscrição. O treinador analisará sua solicitação.',
    athleteName: 'Nome do atleta', sport: 'Esporte ou modalidade', guardian: 'Sou pai, mãe ou responsável legal',
    contactName: 'Nome do contato', contactEmail: 'E-mail de contato', phone: 'Telefone (opcional)',
    privacy: 'Confirmo que sou maior de idade, autorizado a fornecer estes dados e que li a política de privacidade.',
    submit: 'Enviar solicitação', success: 'Solicitação enviada',
    successMessage: 'O clube recebeu sua solicitação e irá analisá-la. A inscrição ainda não está confirmada.',
    unavailable: 'Link indisponível', unavailableDesc: 'Confira o link ou solicite outro ao treinador.',
    error: 'Não foi possível enviar a solicitação. Confira os dados ou fale com o treinador.',
    home: 'Abrir SportPago', note: 'Não é necessário criar uma conta. Não compartilhe senhas ou documentos de identidade.',
    placeholderAthlete: 'Nome e sobrenome', placeholderSport: 'Ex. futebol, natação...', placeholderContact: 'Nome e sobrenome',
  },
};

type FormValues = {
  athleteName: string; sport: string; contactName: string; email: string;
  phone: string; guardian: boolean; accepted: boolean;
};

const initialForm: FormValues = {
  athleteName: '', sport: '', contactName: '', email: '',
  phone: '', guardian: false, accepted: false,
};

export default function JoinClub() {
  const { token } = useParams<{ token: string }>();
  const { language } = useLanguage();
  const t = copies[language];
  const [clubName, setClubName] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable' | 'success'>('loading');
  const [values, setValues] = useState<FormValues>(initialForm);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!CLUB_JOIN_ENABLED || !token || !/^[0-9a-f]{64}$/.test(token)) {
      setStatus('unavailable');
      return;
    }
    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase.rpc('get_club_join_info' as never, { p_token: token } as never);
        if (error) throw error;
        const info = data as unknown as { club_name?: string } | null;
        if (!active) return;
        if (info?.club_name) {
          setClubName(info.club_name);
          setStatus('ready');
        } else setStatus('unavailable');
      } catch (error) {
        console.error('Club invitation unavailable', error);
        if (active) setStatus('unavailable');
      }
    })();
    return () => { active = false; };
  }, [token]);

  const update = (key: keyof FormValues, value: string | boolean) => {
    setValues((old) => ({ ...old, [key]: value }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!token || !values.accepted || sending || status !== 'ready') return;
    setSending(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.rpc('submit_club_join_request' as never, {
        p_token: token,
        p_nombre: values.athleteName.trim(),
        p_deporte: values.sport.trim(),
        p_contacto_nombre: (values.contactName || values.athleteName).trim(),
        p_contacto_email: values.email.trim(),
        p_contacto_telefono: values.phone.trim(),
        p_es_acudiente: values.guardian,
        p_acepta_privacidad: values.accepted,
      } as never);
      if (error) throw error;
      setStatus('success');
      setValues(initialForm);
    } catch (error) {
      console.error('Club enrollment request failed', error);
      setErrorMessage(t.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary font-semibold">
          <Users className="h-5 w-5" /> SportPago
        </div>
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold text-primary">{t.eyebrow}</p>
            <CardTitle className="text-2xl">{status === 'success' ? t.success : status === 'unavailable' ? t.unavailable : t.title}</CardTitle>
            <CardDescription>
              {status === 'unavailable' ? t.unavailableDesc : status === 'success' ? t.successMessage : t.intro}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {status === 'loading' ? (
              <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : status === 'unavailable' ? (
              <Button asChild variant="outline"><Link to="/auth">{t.home}</Link></Button>
            ) : status === 'success' ? (
              <div className="text-center py-7 space-y-2">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
                <p className="font-semibold">{clubName}</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-center font-semibold">
                  {clubName}
                </div>
                <form onSubmit={(event) => void submit(event)} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="join-athlete">{t.athleteName} *</Label>
                    <Input id="join-athlete" required minLength={2} maxLength={120}
                      value={values.athleteName} onChange={(e) => update('athleteName', e.target.value)}
                      placeholder={t.placeholderAthlete} autoComplete="name" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="join-sport">{t.sport} *</Label>
                    <Input id="join-sport" required minLength={2} maxLength={80}
                      value={values.sport} onChange={(e) => update('sport', e.target.value)}
                      placeholder={t.placeholderSport} />
                  </div>
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <Checkbox checked={values.guardian} onCheckedChange={(v) => update('guardian', v === true)} />
                    {t.guardian}
                  </label>
                  <div className="space-y-1">
                    <Label htmlFor="join-contact">{t.contactName} *</Label>
                    <Input id="join-contact" required minLength={2} maxLength={120}
                      value={values.contactName} onChange={(e) => update('contactName', e.target.value)}
                      placeholder={t.placeholderContact} autoComplete="name" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="join-email">{t.contactEmail} *</Label>
                    <Input id="join-email" required type="email" maxLength={254}
                      value={values.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="join-phone">{t.phone}</Label>
                    <Input id="join-phone" type="tel" maxLength={32}
                      value={values.phone} onChange={(e) => update('phone', e.target.value)} autoComplete="tel" />
                  </div>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <Checkbox checked={values.accepted} onCheckedChange={(v) => update('accepted', v === true)} />
                    <span>{t.privacy} <Link className="underline text-primary" to="/privacy">Privacy Policy</Link></span>
                  </label>
                  <Button type="submit" className="w-full" disabled={sending || !values.accepted}>
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    {t.submit}
                  </Button>
                  {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
                </form>
                <p className="text-xs text-muted-foreground">{t.note}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
