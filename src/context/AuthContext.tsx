import { createContext, useContext, ReactNode } from 'react';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  establecimientoId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tutorialCompleted: boolean;
  signUp: (email: string, password: string, nombre: string) => Promise<{ error: string | null; user?: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: User | null }>;
  signInWithAccessCode: (accessCode: string) => Promise<{ error: string | null; staffData?: any; needsLinking?: boolean }>;
  signOut: () => Promise<{ error: string | null }>;
  completeTutorial: () => Promise<void>;
  refetchUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
