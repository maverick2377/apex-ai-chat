import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { auth } from '../firebaseConfig';
// FIX: Changed to namespace import for firebase auth to fix module resolution issues.
import * as firebaseAuth from 'firebase/auth';

type AuthProviderType = 'google' | 'github';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (provider: AuthProviderType) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (firebaseUser: firebaseAuth.User | null) => {
      if (firebaseUser) {
        // User is signed in.
        const providerId = firebaseUser.providerData?.[0]?.providerId;
        let provider: 'google' | 'github' = 'google'; // default
        if (providerId === 'github.com') {
            provider = 'github';
        }

        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          provider: provider,
        });
      } else {
        // User is signed out.
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (provider: AuthProviderType) => {
    const authProvider = provider === 'google' ? new firebaseAuth.GoogleAuthProvider() : new firebaseAuth.GithubAuthProvider();
    try {
      await firebaseAuth.signInWithPopup(auth, authProvider);
      // The onAuthStateChanged listener will handle setting the user state.
    } catch (error) {
      console.error("Authentication error:", error);
      // Optionally, show a toast or message to the user.
    }
  };

  const logout = async () => {
    try {
      await firebaseAuth.signOut(auth);
      // The onAuthStateChanged listener will handle setting the user state to null.
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isAuthenticated = !!user;

  // Don't render children until auth state is determined
  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};