# SportPago - Lista de Archivos para Migración

## 📋 Instrucciones de Uso
1. Crea un nuevo proyecto en Lovable **SIN** activar Lovable Cloud
2. Copia los archivos en el orden indicado (Prioridad 1 → 5)
3. Configura las variables de entorno al final

---

## 🔴 PRIORIDAD 1: Configuración Base (Copiar primero)

### Archivos raíz de configuración
```
tailwind.config.ts
vite.config.ts
capacitor.config.ts
index.html
```

### Estilos globales
```
src/index.css
src/App.css
```

### Entrada principal
```
src/main.tsx
src/App.tsx
```

---

## 🟠 PRIORIDAD 2: Integración Supabase

### Cliente y tipos (CREAR MANUALMENTE)
```
src/integrations/supabase/client.ts
src/integrations/supabase/types.ts
```

**NOTA**: El archivo `client.ts` necesita ser creado con tu propia URL y key de Supabase.
El archivo `types.ts` se puede copiar o regenerar con `supabase gen types typescript`.

---

## 🟡 PRIORIDAD 3: Core de la Aplicación

### Tipos TypeScript
```
src/types/index.ts
```

### Contextos
```
src/context/AppContext.tsx
src/context/AuthContext.tsx
src/context/LanguageContext.tsx
```

### Hooks personalizados
```
src/hooks/use-mobile.tsx
src/hooks/use-toast.ts
src/hooks/useAthletes.tsx
src/hooks/useAuth.tsx
src/hooks/useEstablecimiento.tsx
src/hooks/useLanguage.ts
src/hooks/useTransactions.tsx
```

### Internacionalización
```
src/i18n/index.ts
src/i18n/locales/es.json
src/i18n/locales/en.json
src/i18n/locales/fr.json
src/i18n/locales/pt.json
```

### Utilidades
```
src/lib/utils.ts
src/utils/dateFormat.ts
src/utils/exportToExcel.ts
src/utils/sportIcons.tsx
src/utils/textUtils.ts
```

### Datos estáticos
```
src/data/countries.ts
```

---

## 🟢 PRIORIDAD 4: Componentes UI

### Componentes base shadcn/ui
```
src/components/ui/accordion.tsx
src/components/ui/alert-dialog.tsx
src/components/ui/alert.tsx
src/components/ui/aspect-ratio.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/breadcrumb.tsx
src/components/ui/button.tsx
src/components/ui/calendar.tsx
src/components/ui/card.tsx
src/components/ui/carousel.tsx
src/components/ui/chart.tsx
src/components/ui/checkbox.tsx
src/components/ui/collapsible.tsx
src/components/ui/command.tsx
src/components/ui/context-menu.tsx
src/components/ui/dialog.tsx
src/components/ui/drawer.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/form.tsx
src/components/ui/hover-card.tsx
src/components/ui/input-otp.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/menubar.tsx
src/components/ui/navigation-menu.tsx
src/components/ui/pagination.tsx
src/components/ui/popover.tsx
src/components/ui/progress.tsx
src/components/ui/radio-group.tsx
src/components/ui/resizable.tsx
src/components/ui/scroll-area.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/components/ui/sidebar.tsx
src/components/ui/skeleton.tsx
src/components/ui/slider.tsx
src/components/ui/sonner.tsx
src/components/ui/switch.tsx
src/components/ui/table.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx
src/components/ui/toast.tsx
src/components/ui/toaster.tsx
src/components/ui/toggle-group.tsx
src/components/ui/toggle.tsx
src/components/ui/tooltip.tsx
src/components/ui/use-toast.ts
```

### Componentes UI personalizados
```
src/components/ui/CategoryInput.tsx
src/components/ui/StatusBadge.tsx
```

### Componente de navegación
```
src/components/NavLink.tsx
```

---

## 🔵 PRIORIDAD 5: Componentes de Negocio y Páginas

### Layout
```
src/components/layout/AppFooter.tsx
src/components/layout/AppLayout.tsx
src/components/layout/BottomNav.tsx
src/components/layout/MobileHeader.tsx
```

### Atletas
```
src/components/athletes/AthleteCard.tsx
src/components/athletes/AthleteDetailModal.tsx
src/components/athletes/BulkPriceModal.tsx
src/components/athletes/DeleteAthleteDialog.tsx
src/components/athletes/EditAthleteModal.tsx
src/components/athletes/PaymentModal.tsx
```

### Dashboard
```
src/components/dashboard/StatsCard.tsx
```

### Onboarding
```
src/components/onboarding/OnboardingTutorial.tsx
```

### Configuración
```
src/components/settings/LogoUpload.tsx
```

### Staff
```
src/components/staff/StaffAssignmentModal.tsx
```

### Transacciones
```
src/components/transactions/DateRangeFilter.tsx
src/components/transactions/PaymentMethodFilter.tsx
```

### Páginas
```
src/pages/Athletes.tsx
src/pages/Auth.tsx
src/pages/Dashboard.tsx
src/pages/Install.tsx
src/pages/Landing.tsx
src/pages/NotFound.tsx
src/pages/PrivacyPolicy.tsx
src/pages/Settings.tsx
src/pages/Staff.tsx
src/pages/TermsOfService.tsx
src/pages/Transactions.tsx
```

---

## 📁 PRIORIDAD 6: Assets y Recursos Públicos

### Assets de la aplicación
```
src/assets/logo-sportpago.png
src/assets/logo-sportpago-optimized.webp
src/assets/demo-video.mp4
```

### Recursos públicos (PWA)
```
public/favicon.ico
public/logo-sportpago.png
public/placeholder.svg
public/pwa-192x192.png
public/pwa-512x512.png
public/pwa-maskable-512x512.png
public/robots.txt
```

---

## ⚙️ Variables de Entorno (.env)

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
VITE_SUPABASE_PROJECT_ID=TU_PROJECT_ID
```

---

## 📊 Resumen de Archivos

| Categoría | Cantidad |
|-----------|----------|
| Configuración raíz | 4 |
| Estilos | 2 |
| Entrada principal | 2 |
| Integración Supabase | 2 |
| Tipos | 1 |
| Contextos | 3 |
| Hooks | 7 |
| i18n | 5 |
| Utilidades | 5 |
| Componentes UI (shadcn) | 51 |
| Componentes UI personalizados | 2 |
| Componentes de negocio | 14 |
| Páginas | 11 |
| Assets | 3 |
| Recursos públicos | 7 |
| **TOTAL** | **119 archivos** |

---

## ✅ Checklist de Migración

- [ ] Crear proyecto Lovable sin Lovable Cloud
- [ ] Copiar archivos de Prioridad 1 (configuración)
- [ ] Crear cliente Supabase manualmente (Prioridad 2)
- [ ] Copiar archivos de Prioridad 3 (core)
- [ ] Copiar componentes UI (Prioridad 4)
- [ ] Copiar componentes de negocio y páginas (Prioridad 5)
- [ ] Copiar assets (Prioridad 6)
- [ ] Configurar variables de entorno
- [ ] Probar login/registro
- [ ] Probar creación de establecimiento
- [ ] Probar CRUD de atletas

---

*Generado para migración de SportPago - Enero 2026*
