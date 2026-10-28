import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link2, Copy, RefreshCw, UserCheck, UserX, ClipboardList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Language } from '@/i18n';

export const CLUB_JOIN_ENABLED = import.meta.env.VITE_ENABLE_CLUB_INVITES === 'true';

type Enrollment = {
  id: string;
  nombre: string;
  deporte: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  es_acudiente: boolean;
  created_at: string;
};

type Texts = {
  title: string; description: string; create: string; copy: string; copied: string;
  rotate: string; rotateConfirm: string; pending: string; empty: string;
  guardian: string; approve: string; reject: string; rejectConfirm: string;
  success: string; error: string; note: string; share: string;
};

const textByLanguage: Record<Language, Texts> = {
  es: {
    title: 'Autoinscripción por enlace', description: 'Comparte un enlace con tu club para que los deportistas o sus acudientes envíen sus datos.',
    create: 'Generar / ver enlace', copy: 'Copiar enlace', copied: 'Enlace copiado', rotate: 'Renovar enlace',
    rotateConfirm: '¿Renovar el enlace? El anterior dejará de funcionar, pero las solicitudes existentes se conservarán.',
    pending: 'Solicitudes por revisar', empty: 'No tienes solicitudes pendientes.',
    guardian: 'Acudiente', approve: 'Aprobar', reject: 'Rechazar',
    rejectConfirm: '¿Rechazar esta solicitud?', success: 'Solicitud revisada',
    error: 'No se pudo completar la operación.', note: 'Los aprobados se guardan con cuota $0 y pago pendiente hasta que configures su tarifa.',
    share: 'Envía el enlace por WhatsApp o cualquier otro canal.',
  },
  en: {
    title: 'Self-registration link', description: 'Share your club link so athletes or guardians can send their information.',
    create: 'Create / view link', copy: 'Copy link', copied: 'Link copied', rotate: 'Reset link',
    rotateConfirm: 'Reset the link? The old link will stop working, but existing requests will remain.',
    pending: 'Pending requests', empty: 'No pending registrations.',
    guardian: 'Guardian', approve: 'Approve', reject: 'Decline', rejectConfirm: 'Decline this request?',
    success: 'Request reviewed', error: 'Unable to complete the action.',
    note: 'Approved athletes start with a $0 fee and pending status until you set their monthly fee.',
    share: 'Share this link via WhatsApp or another channel.',
  },
  fr: {
    title: 'Inscription par lien', description: 'Partagez le lien du club pour permettre aux sportifs ou responsables de transmettre leurs informations.',
    create: 'Créer / afficher le lien', copy: 'Copier le lien', copied: 'Lien copié', rotate: 'Renouveler le lien',
    rotateConfirm: 'Renouveler le lien ? L’ancien lien cessera de fonctionner, mais les demandes resteront.',
    pending: 'Demandes en attente', empty: 'Aucune demande en attente.', guardian: 'Responsable légal',
    approve: 'Accepter', reject: 'Refuser', rejectConfirm: 'Refuser cette demande ?', success: 'Demande traitée',
    error: 'Impossible de terminer cette opération.',
    note: 'Les sportifs acceptés ont une cotisation initiale de 0 et un paiement en attente jusqu’à sa configuration.',
    share: 'Partagez le lien par WhatsApp ou un autre canal.',
  },
  pt: {
    title: 'Inscrição por link', description: 'Compartilhe o link do clube para atletas ou responsáveis enviarem os dados.',
    create: 'Criar / ver link', copy: 'Copiar link', copied: 'Link copiado', rotate: 'Renovar link',
    rotateConfirm: 'Renovar o link? O antigo deixará de funcionar, mas as solicitações continuarão salvas.',
    pending: 'Solicitações pendentes', empty: 'Não há solicitações pendentes.', guardian: 'Responsável',
    approve: 'Aprovar', reject: 'Rejeitar', rejectConfirm: 'Rejeitar esta solicitação?', success: 'Solicitação analisada',
    error: 'Não foi possível concluir a operação.',
    note: 'Atletas aprovados começam com mensalidade 0 e pagamento pendente até a configuração da tarifa.',
    share: 'Compartilhe o link pelo WhatsApp ou outro canal.',
  },
};

export function ClubSelfRegistration({ establecimientoId }: { establecimientoId: string }) {
  const { language } = useLanguage();
  const t = textByLanguage[language];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const { data: pending = [], isLoading, refetch } = useQuery({
    queryKey: ['club-join-pending', establecimientoId],
    queryFn: async () => {
      const { data, error } = await supabase.from('athlete_join_requests' as never)
        .select('id,nombre,deporte,contacto_nombre,contacto_email,contacto_telefono,es_acudiente,created_at')
        .eq('establecimiento_id', establecimientoId).eq('estado', 'pending')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Enrollment[];
    },
    enabled: CLUB_JOIN_ENABLED && !!establecimientoId,
    staleTime: 30_000,
  });

  if (!CLUB_JOIN_ENABLED) return null;

  const makeLink = (value: string) => `${window.location.origin}/join/${encodeURIComponent(value)}`;

  async function getLink(rotate = false) {
    if (rotate && !window.confirm(t.rotateConfirm)) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc(
        (rotate ? 'rotate_club_join_link' : 'ensure_club_join_link') as never,
        { p_club_id: establecimientoId } as never,
      );
      if (error) throw error;
      setToken(data as unknown as string);
    } catch (error) {
      console.error('Could not create or read club invitation link', error);
      toast({ title: t.error, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(makeLink(token));
      toast({ title: t.copied });
    } catch (error) {
      console.error('Clipboard denied', error);
      toast({ title: t.error, variant: 'destructive' });
    }
  }

  async function review(id: string, approve: boolean) {
    if (!approve && !window.confirm(t.rejectConfirm)) return;
    setReviewingId(id);
    try {
      const { error } = await supabase.rpc('review_club_join_request' as never, {
        p_request_id: id, p_approve: approve, p_amount: 0, p_payment_day: 1,
      } as never);
      if (error) throw error;
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ['athletes', establecimientoId] }),
      ]);
      toast({ title: t.success });
    } catch (error) {
      console.error('Unable to review club signup', error);
      toast({ title: t.error, variant: 'destructive' });
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-primary" /> {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!token ? (
          <Button type="button" onClick={() => void getLink()} disabled={busy}>
            <Link2 className="mr-2 h-4 w-4" /> {t.create}
          </Button>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={makeLink(token)} readOnly aria-label={t.title} />
              <Button type="button" onClick={() => void copyLink()} variant="default">
                <Copy className="mr-2 h-4 w-4" />{t.copy}
              </Button>
              <Button type="button" onClick={() => void getLink(true)} variant="outline" disabled={busy}>
                <RefreshCw className="mr-2 h-4 w-4" />{t.rotate}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t.share}</p>
          </>
        )}
        <div className="border-t pt-4 space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <ClipboardList className="h-4 w-4" /> {t.pending} ({pending.length})
          </h3>
          {isLoading ? <p className="text-sm text-muted-foreground">...</p> : pending.length === 0
            ? <p className="text-sm text-muted-foreground">{t.empty}</p>
            : pending.map((person) => (
              <div key={person.id} className="rounded-lg border p-3 space-y-2">
                <p className="font-medium">{person.nombre}</p>
                <p className="text-sm text-muted-foreground">{person.deporte} · {person.contacto_nombre}
                  {person.es_acudiente ? ` (${t.guardian})` : ''}</p>
                <p className="text-xs text-muted-foreground break-all">{person.contacto_email} · {person.contacto_telefono}</p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" disabled={!!reviewingId}
                    onClick={() => void review(person.id, true)}>
                    <UserCheck className="mr-1 h-4 w-4" />{t.approve}
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={!!reviewingId}
                    onClick={() => void review(person.id, false)}>
                    <UserX className="mr-1 h-4 w-4" />{t.reject}
                  </Button>
                </div>
              </div>
            ))}
          <p className="text-xs text-muted-foreground">{t.note}</p>
        </div>
      </CardContent>
    </Card>
  );
}
