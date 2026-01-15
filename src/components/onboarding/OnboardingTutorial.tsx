import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
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
  const [direction, setDirection] = useState(1);
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
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
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
          top: `${targetRect.bottom + padding + 20}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - padding - 20}px`,
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
    
    switch (step.position) {
      case 'bottom':
        return {
          top: `${targetRect.bottom + 4}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%) rotate(180deg)',
        };
      case 'top':
        return {
          top: `${targetRect.top - 24}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      default:
        return null;
    }
  };

  const arrowPos = getArrowPosition();

  // Spring transition for smooth animations
  const springTransition: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dark overlay with cutout */}
          <motion.div 
            className="absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Highlighted element cutout */}
          <AnimatePresence mode="wait">
            {targetRect && (
              <motion.div
                key={currentStep}
                className="absolute bg-transparent rounded-lg"
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  top: targetRect.top - 8,
                  left: targetRect.left - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                }}
                transition={springTransition}
                style={{
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.80)',
                  border: '3px solid hsl(var(--primary))',
                }}
              />
            )}
          </AnimatePresence>

          {/* Bouncing Arrow */}
          <AnimatePresence mode="wait">
            {arrowPos && (
              <motion.div
                key={`arrow-${currentStep}`}
                className="absolute z-10 pointer-events-none"
                style={{
                  top: arrowPos.top,
                  left: arrowPos.left,
                  transform: arrowPos.transform,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    ease: 'easeInOut' 
                  }}
                >
                  <svg 
                    width="24" 
                    height="16" 
                    viewBox="0 0 24 16" 
                    fill="none"
                    className="text-primary"
                  >
                    <path 
                      d="M12 0L24 16H0L12 0Z" 
                      fill="currentColor"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ 
                opacity: 0, 
                x: direction > 0 ? 50 : -50, 
                scale: 0.95 
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1 
              }}
              exit={{ 
                opacity: 0, 
                x: direction < 0 ? 50 : -50, 
                scale: 0.95 
              }}
              transition={springTransition}
              className="absolute bg-card rounded-xl shadow-2xl p-5 w-[300px]"
              style={getTooltipPosition()}
            >
              {/* Skip button */}
              <motion.button
                onClick={onSkip}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Content */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Step indicator */}
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <motion.div 
                    className="p-2 bg-primary/10 rounded-lg text-primary"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 260, 
                      damping: 20, 
                      delay: 0.2 
                    }}
                  >
                    {step.icon}
                  </motion.div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
                  </span>
                </motion.div>

                {/* Title and description */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>

                {/* Progress dots */}
                <motion.div 
                  className="flex justify-center gap-1.5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {TUTORIAL_STEPS.map((_, index) => (
                    <motion.div
                      key={index}
                      className={cn(
                        'h-1.5 rounded-full',
                        index === currentStep
                          ? 'w-6 bg-primary'
                          : index < currentStep
                          ? 'w-1.5 bg-primary/50'
                          : 'w-1.5 bg-muted'
                      )}
                      initial={{ scale: 0.8 }}
                      animate={{ 
                        scale: index === currentStep ? 1.2 : 1,
                        opacity: index === currentStep ? 1 : index < currentStep ? 0.8 : 0.5,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  ))}
                </motion.div>

                {/* Navigation buttons */}
                <motion.div 
                  className="flex items-center justify-between pt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
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
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="gap-1"
                    >
                      {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                      {currentStep < TUTORIAL_STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
