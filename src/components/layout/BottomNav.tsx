import { Home, Users, Settings, UserCog, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Users, label: 'Deportistas', href: '/athletes' },
  { icon: Receipt, label: 'Pagos', href: '/transactions', adminOnly: true },
  { icon: UserCog, label: 'Staff', href: '/staff', adminOnly: true },
  { icon: Settings, label: 'Ajustes', href: '/settings', adminOnly: true },
];

export function BottomNav() {
  const location = useLocation();
  const { userRole } = useApp();

  const filteredItems = navItems.filter(item => 
    !item.adminOnly || userRole === 'admin'
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-[10px] font-medium">{item.label}</span>
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
