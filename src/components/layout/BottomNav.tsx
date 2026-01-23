import { Home, Users, Settings, UserCog, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  href: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, labelKey: 'nav.dashboard', href: '/dashboard' },
  { icon: Users, labelKey: 'nav.athletes', href: '/athletes' },
  { icon: Receipt, labelKey: 'nav.transactions', href: '/transactions', adminOnly: true },
  { icon: UserCog, labelKey: 'nav.staff', href: '/staff', adminOnly: true },
  { icon: Settings, labelKey: 'nav.settings', href: '/settings', adminOnly: true },
];

export function BottomNav() {
  const location = useLocation();
  const { userRole } = useAuthContext();
  const { t } = useLanguage();

  const filteredItems = navItems.filter(item => 
    !item.adminOnly || userRole === 'admin'
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href;
          // Map hrefs to tutorial data attributes
          const tutorialAttr = 
            item.href === '/staff' ? 'staff' :
            item.href === '/settings' ? 'settings' :
            item.href === '/transactions' ? 'transactions' :
            undefined;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              data-tutorial={tutorialAttr}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
              {isActive && (
                <span className="absolute -bottom-0 h-0.5 w-8 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
