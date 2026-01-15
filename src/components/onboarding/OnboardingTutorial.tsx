import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, UserPlus, CircleDot, Users, Settings, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'add-athletes',
    title: 'Agregar deportistas',
    description: 'Usa este botón para añadir nuevos deportistas a tu academia. Podrás registrar su información y monto mensual.',
    targetSelector: '[data-tutorial="add-athlete"]',
    icon: <UserPlus className="h-6 w-6" />,
    position: 'bottom',
  },
  {
    id: 'payment-status',
    title: 'Semáforo de pagos',
    description: 'El sistema de colores te muestra el estado de cada deportista: Verde = Al día, Amarillo = Por vencer, Rojo = Vencido.',
    targetSelector: '[data-tutorial="payment-status"]',
    icon: <CircleDot className="h-6 w-6" />,
    position: 'bottom',
  },
  {
    id: 'staff',
    title: 'Invitar asistentes',
    description: 'Invita a colaboradores para que te ayuden a gestionar los pagos. Cada uno tendrá su propio código de acceso.',
    targetSelector: '[data-tutorial="staff"]',
    icon: <Users className="h-6 w-6" />,
    position: 'top',
  },
  {
    id: 'settings',
    title: 'Configurar club',
    description: 'Personaliza tu academia: métodos de pago, deportes, logo y más opciones de configuración.',
    targetSelector: '[data-tutorial="settings"]',
    icon: <Settings className="h-6 w-6" />,
    position: 'top',
  },
  {
    id: 'reports',
    title: 'Reportes y exportar',
    description: 'Consulta el historial de transacciones y exporta reportes en Excel para tu contabilidad.',
    targetSelector: '[data-tutorial="transactions"]',
    icon: <FileText className="h-6 w-6" />,
    position: 'top',
  },
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTutorial({ isOpen, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const updateTargetPosition = () => {
      const target = document.querySelector(step.targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll target into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(updateTargetPosition, 300);

    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isOpen, isMounted, step.targetSelector, currentStep]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const getTooltipPosition = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipWidth = 300;
    const tooltipHeight = 200;

    switch (step.position) {
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.right + padding}px`,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const getArrowPosition = () => {
    if (!targetRect) return null;

    const arrowSize = 12;
    
    switch (step.position) {
      case 'bottom':
        return {
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%) rotate(180deg)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid hsl(var(--card))`,
        };
      case 'top':
        return {
          bottom: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid hsl(var(--card))`,
        };
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay with cutout */}
      <div className="absolute inset-0 bg-black/75 transition-opacity duration-300" />
      
      {/* Highlighted element cutout */}
      {targetRect && (
        <div
          className="absolute bg-transparent rounded-lg transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            border: '3px solid hsl(var(--primary))',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute bg-card rounded-xl shadow-2xl p-5 w-[300px] transition-all duration-300"
        style={getTooltipPosition()}
      >
        {/* Arrow */}
        {getArrowPosition() && (
          <div
            className="absolute w-0 h-0"
            style={getArrowPosition() || {}}
          />
        )}

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {step.icon}
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Title and description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                    ? 'w-1.5 bg-primary/50'
                    : 'w-1.5 bg-muted'
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground"
            >
              Saltar
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
              {currentStep < TUTORIAL_STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
