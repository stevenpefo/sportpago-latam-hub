import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle2, Share, MoreVertical, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡SportPago Instalado!</CardTitle>
            <CardDescription>
              Ya tienes SportPago instalado en tu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
            <img 
              src="/logo-sportpago.png" 
              alt="SportPago" 
              className="w-14 h-14 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Instalar SportPago</CardTitle>
          <CardDescription>
            Instala la app en tu dispositivo para acceso rápido y experiencia mejorada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <span>Acceso directo desde tu pantalla de inicio</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <span>Funciona sin conexión a internet</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <span>Experiencia de app nativa</span>
            </div>
          </div>

          {/* Install Button or Instructions */}
          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-center">Para instalar en iPhone/iPad:</p>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>Toca el botón <Share className="w-4 h-4 inline mx-1" /> Compartir</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Selecciona <Plus className="w-4 h-4 inline mx-1" /> "Añadir a pantalla de inicio"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Confirma tocando "Añadir"</span>
                  </li>
                </ol>
              </div>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstallClick} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Instalar SportPago
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-center">Para instalar en Android:</p>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>Toca el menú <MoreVertical className="w-4 h-4 inline mx-1" /> del navegador</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Selecciona "Instalar app" o "Añadir a pantalla de inicio"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Confirma la instalación</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={() => navigate("/auth")} 
            className="w-full"
          >
            Continuar en el navegador
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
