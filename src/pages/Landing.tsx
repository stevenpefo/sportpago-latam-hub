import { Link } from "react-router-dom";
import { Check, Users, CreditCard, Bell, BarChart3, Shield, Smartphone, Globe, Clock, Star, ArrowRight, Zap, Play, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppFooter } from "@/components/layout/AppFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import demoVideo from "@/assets/demo-video.mp4";

const plans = [
  {
    name: "Mensual",
    price: 10,
    period: "/mes",
    description: "Perfecto para comenzar",
    features: [
      "Deportistas ilimitados",
      "Control de pagos en tiempo real",
      "Recordatorios automáticos",
      "Soporte por email",
    ],
    popular: false,
    cta: "Comenzar Ahora",
  },
  {
    name: "Semestral",
    price: 55,
    period: "/6 meses",
    description: "Ahorra un 8% anual",
    originalPrice: 60,
    features: [
      "Todo del plan Mensual",
      "Reportes avanzados",
      "Múltiples métodos de pago",
      "Soporte prioritario",
      "Exportación a Excel",
    ],
    popular: true,
    cta: "Mejor Valor",
  },
  {
    name: "Anual",
    price: 99.98,
    period: "/año",
    description: "Máximo ahorro - 17% OFF",
    originalPrice: 120,
    features: [
      "Todo del plan Semestral",
      "Asistentes ilimitados",
      "Logo personalizado",
      "Soporte VIP 24/7",
      "Acceso anticipado a nuevas funciones",
      "Capacitación incluida",
    ],
    popular: false,
    cta: "Ahorrar Más",
  },
];

const features = [
  {
    icon: Users,
    title: "Gestión de Deportistas",
    description: "Registra y organiza todos tus atletas con información detallada, categorías y estados de pago.",
  },
  {
    icon: CreditCard,
    title: "Control de Pagos",
    description: "Visualiza quién está al día, quién está por vencer y quién tiene pagos pendientes de un vistazo.",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description: "Sistema de semáforo visual que te alerta automáticamente sobre pagos próximos a vencer.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Estadísticas",
    description: "Dashboard con métricas clave: ingresos mensuales, tasa de cobranza y deportistas activos.",
  },
  {
    icon: Shield,
    title: "Multi-Usuario Seguro",
    description: "Invita asistentes con permisos controlados para que te ayuden con la gestión diaria.",
  },
  {
    icon: Smartphone,
    title: "100% Móvil",
    description: "Diseñado para funcionar perfectamente en tu celular. Gestiona tu academia desde cualquier lugar.",
  },
];

const targetAudience = [
  {
    title: "Academias Deportivas",
    description: "Fútbol, baloncesto, natación, tenis y más. Organiza las mensualidades de todos tus alumnos.",
    icon: "⚽",
  },
  {
    title: "Gimnasios y Crossfit",
    description: "Controla las membresías de tus clientes y nunca pierdas un cobro por olvido.",
    icon: "🏋️",
  },
  {
    title: "Entrenadores Personales",
    description: "Gestiona tus clientes individuales y lleva un registro profesional de sus pagos.",
    icon: "🎯",
  },
  {
    title: "Escuelas de Artes Marciales",
    description: "Karate, taekwondo, jiu-jitsu. Administra categorías por cinturón y nivel.",
    icon: "🥋",
  },
  {
    title: "Clubes Deportivos",
    description: "Ya sea un club de running o de ciclismo, mantén el control de tus socios.",
    icon: "🚴",
  },
  {
    title: "Escuelas de Danza",
    description: "Ballet, salsa, urbano. Organiza por niveles y mantén tus finanzas en orden.",
    icon: "💃",
  },
];

const testimonials = [
  {
    quote: "Antes perdía horas buscando quién me debía. Ahora lo veo en segundos.",
    author: "Carlos M.",
    role: "Academia de Fútbol",
    rating: 5,
  },
  {
    quote: "El sistema de colores es genial. Verde, amarillo, rojo. Simple y efectivo.",
    author: "María L.",
    role: "Gimnasio CrossFit",
    rating: 5,
  },
  {
    quote: "Mis asistentes ahora pueden ayudarme a cobrar sin acceso a información sensible.",
    author: "Roberto S.",
    role: "Escuela de Natación",
    rating: 5,
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export default function Landing() {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Navigation */}
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-16"
          >
            <div className="flex items-center gap-2">
              <img 
                src="/logo-sportpago.png" 
                alt="SportPago" 
                className="h-10 w-auto"
              />
            </div>
            <Link to="/auth">
              <Button variant="outline" className="font-medium">
                Iniciar Sesión
              </Button>
            </Link>
          </motion.nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2 inline" />
                +500 academias ya confían en nosotros
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Deja de Perder Dinero por
              <span className="text-primary block mt-2">Pagos Olvidados</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              El sistema más simple para que <strong>academias deportivas y gimnasios</strong> controlen 
              las mensualidades de sus atletas. Sin hojas de Excel. Sin confusiones. Sin pagos perdidos.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <a href="#pricing">
                <Button size="lg" className="text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <p className="text-sm text-muted-foreground">
                Configura en minutos • Cancela cuando quieras
              </p>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground mb-12"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>Disponible en 4 idiomas</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Configura en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Datos 100% seguros</span>
              </div>
            </motion.div>

            {/* Demo Video */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative max-w-3xl mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20 bg-card">
                <video
                  ref={videoRef}
                  className="w-full aspect-video object-cover"
                  loop
                  muted
                  playsInline
                  autoPlay
                  onClick={togglePlayPause}
                >
                  <source src={demoVideo} type="video/mp4" />
                  Tu navegador no soporta videos HTML5.
                </video>
                {!isPlaying && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </motion.button>
                )}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Mira cómo SportPago simplifica la gestión de tu academia
              </p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Te suena familiar?
            </h2>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { emoji: "😰", title: '"No sé quién me debe"', desc: "Pierdes tiempo buscando en libretas o Excel quién pagó y quién no." },
              { emoji: "💸", title: '"Se me olvida cobrar"', desc: "Los meses pasan y cuando te das cuenta, ya perdiste ingresos." },
              { emoji: "📊", title: '"No tengo control"', desc: "No sabes cuánto deberías estar facturando al mes realmente." },
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-background p-6 rounded-xl border border-destructive/20 shadow-sm"
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Todo lo que necesitas para cobrar sin estrés
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas simples pero poderosas diseñadas específicamente para el mundo deportivo.
            </p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                >
                  <feature.icon className="h-6 w-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Para quién es SportPago?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Si cobras mensualidades a deportistas o atletas, SportPago es para ti.
            </p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {targetAudience.map((item, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                className="bg-background p-6 rounded-xl border hover:shadow-md transition-shadow"
              >
                <motion.div 
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-4xl mb-4"
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Lo que dicen nuestros usuarios
            </h2>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-card h-full">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Planes simples, sin sorpresas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu academia. Todos incluyen deportistas ilimitados.
            </p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -10, scale: plan.popular ? 1.02 : 1.05 }}
              >
                <Card 
                  className={`relative overflow-hidden transition-all duration-300 h-full ${
                    plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'hover:border-primary/50'
                  }`}
                >
                  {plan.popular && (
                    <motion.div 
                      initial={{ x: 100 }}
                      animate={{ x: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute top-0 right-0"
                    >
                      <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground px-3 py-1">
                        Más Popular
                      </Badge>
                    </motion.div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <div className="mb-6">
                      {plan.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through mr-2">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className="text-5xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3"
                        >
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full py-6 text-lg font-semibold transition-all hover:scale-105" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            * Precios en USD. Aceptamos pagos en moneda local.
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Resolvemos las dudas más comunes sobre SportPago
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
                {
                  question: "¿Cuántos deportistas puedo registrar?",
                  answer: "¡Ilimitados! Todos nuestros planes incluyen deportistas ilimitados. No importa si tienes 10 o 1,000 atletas, el precio no cambia."
                },
                {
                  question: "¿Puedo usar SportPago en mi celular?",
                  answer: "Sí, SportPago está diseñado 100% para funcionar en dispositivos móviles. Puedes gestionar tu academia desde cualquier smartphone o tablet, sin necesidad de instalar ninguna aplicación."
                },
                {
                  question: "¿Cómo funciona el sistema de alertas de pagos?",
                  answer: "Usamos un sistema de semáforo visual: Verde para deportistas al día, Amarillo para pagos próximos a vencer, y Rojo para pagos vencidos. Así puedes identificar de un vistazo quién necesita atención."
                },
                {
                  question: "¿Puedo agregar asistentes para que me ayuden?",
                  answer: "¡Por supuesto! Puedes invitar a tu equipo con permisos controlados. Ellos pueden registrar pagos y gestionar deportistas sin acceso a información financiera sensible."
                },
                {
                  question: "¿En qué moneda puedo cobrar?",
                  answer: "SportPago se adapta a tu país. Soportamos múltiples monedas latinoamericanas y puedes configurar el símbolo y formato de moneda que prefieras para tu academia."
                },
                {
                  question: "¿Qué pasa si quiero cancelar mi suscripción?",
                  answer: "Puedes cancelar en cualquier momento sin penalidades. Tu cuenta seguirá activa hasta el final del período pagado y podrás exportar todos tus datos."
                },
                {
                  question: "¿Mis datos están seguros?",
                  answer: "Absolutamente. Usamos encriptación de nivel bancario y servidores seguros. Tus datos y los de tus deportistas están protegidos con los más altos estándares de seguridad."
                },
                {
                  question: "¿Ofrecen soporte técnico?",
                  answer: "Sí, todos los planes incluyen soporte por email. Los planes Semestral y Anual tienen soporte prioritario, y el plan Anual incluye soporte VIP 24/7 con capacitación personalizada."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  transition={{ duration: 0.3 }}
                >
                  <AccordionItem 
                    value={`item-${index}`} 
                    className="bg-card border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para dejar de perder dinero?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a cientos de academias que ya recuperaron el control de sus finanzas.
          </p>
          <a href="#pricing">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" className="text-lg px-10 py-6 font-semibold shadow-lg hover:shadow-xl transition-all">
                Elegir Mi Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AppFooter />
        </div>
      </footer>
    </div>
  );
}
