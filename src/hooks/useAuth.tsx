import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'staff' | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  establecimientoId: string | null;
  isLoading: boolean;
  tutorialCompleted: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userRole: null,
    establecimientoId: null,
    isLoading: true,
    tutorialCompleted: false,
  });

  // Fetch user role and establecimiento
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      // Fetch profile for tutorial status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('tutorial_completado')
        .eq('id', userId)
        .single();

      // Get establecimiento_id using the database function
      const { data: estabId } = await supabase
        .rpc('get_user_establecimiento_id', { _user_id: userId });

      setAuthState(prev => ({
        ...prev,
        userRole: (roleData?.role as UserRole) || null,
        establecimientoId: estabId || null,
        tutorialCompleted: profileData?.tutorial_completado || false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            userRole: null,
            establecimientoId: null,
            tutorialCompleted: false,
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  // Sign up with email/password
  const signUp = async (email: string, password: string, nombre: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nombre,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null, user: data.user };
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null, user: data.user };
  };

  // Sign in with club code + staff access code (using secure RPC functions)
  const signInWithAccessCode = async (clubCode: string, accessCode: string) => {
    // Use secure RPC function to verify club code (no direct table access)
    const { data: estabId, error: estabError } = await supabase
      .rpc('verify_club_code' as never, { _club_code: clubCode } as never);

    if (estabError || !estabId) {
      return { error: 'invalidClubCode' };
    }

    // Use secure RPC function to verify staff access code
    const { data: staffDataRaw, error: staffError } = await supabase
      .rpc('verify_staff_access' as never, { 
        _establecimiento_id: estabId, 
        _codigo_acceso: accessCode 
      } as never);

    const staffData = staffDataRaw as { 
      id: string; 
      nombre: string; 
      user_id: string | null; 
      establecimiento_id: string; 
      activo: boolean; 
    } | null;

    if (staffError || !staffData) {
      return { error: 'invalidPin' };
    }

    // If staff has a linked user_id, they should use email/password
    if (staffData.user_id) {
      return { error: 'codeAlreadyLinked' };
    }

    // For staff without user_id, store their info in sessionStorage temporarily
    sessionStorage.setItem('staff_session', JSON.stringify({
      staffId: staffData.id,
      nombre: staffData.nombre,
      establecimientoId: staffData.establecimiento_id,
    }));

    return { 
      error: null, 
      staffData,
      needsLinking: true,
    };
  };

  // Sign out
  const signOut = async () => {
    sessionStorage.removeItem('staff_session');
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  // Mark tutorial as completed
  const completeTutorial = async () => {
    if (!authState.user) return;

    await supabase
      .from('profiles')
      .update({ tutorial_completado: true })
      .eq('id', authState.user.id);

    setAuthState(prev => ({ ...prev, tutorialCompleted: true }));
  };

  return {
    ...authState,
    isAuthenticated: !!authState.session,
    signUp,
    signIn,
    signInWithAccessCode,
    signOut,
    completeTutorial,
    refetchUserData: () => authState.user && fetchUserData(authState.user.id),
  };
}
