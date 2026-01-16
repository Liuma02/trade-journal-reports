/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Uses Supabase Auth for email/password authentication.
 * 
 * Features:
 * - Persistent session handling via onAuthStateChange listener
 * - Email/password sign up and login
 * - Logout functionality
 * - Loading states for auth operations
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  // Current authenticated user (null if not logged in)
  user: User | null;
  // Current session
  session: Session | null;
  // Loading state for initial auth check
  isLoading: boolean;
  // Whether Supabase is properly configured
  isConfigured: boolean;
  // Sign up with email and password
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  // Sign in with email and password
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  // Sign out the current user
  signOut: () => Promise<{ error: AuthError | null }>;
  // Reset password (sends email)
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    /**
     * CRITICAL: Set up auth state listener BEFORE checking current session
     * This ensures we catch all auth state changes, including:
     * - Initial session load
     * - Login/logout events
     * - Token refresh
     * - Session changes from other tabs
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  /**
   * Sign up a new user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password (min 6 characters)
   * @returns Object with error property (null if successful)
   */
  const signUp = useCallback(async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect URL after email confirmation
        emailRedirectTo: window.location.origin,
      },
    });

    return { error };
  }, [isConfigured]);

  /**
   * Sign in an existing user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Object with error property (null if successful)
   */
  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }, [isConfigured]);

  /**
   * Sign out the current user
   * Clears session from localStorage and Supabase
   * 
   * @returns Object with error property (null if successful)
   */
  const signOut = useCallback(async () => {
    if (!isConfigured) {
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  }, [isConfigured]);

  /**
   * Send password reset email
   * 
   * @param email - User's email address
   * @returns Object with error property (null if successful)
   */
  const resetPassword = useCallback(async (email: string) => {
    if (!isConfigured) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  }, [isConfigured]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * Must be used within an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
