
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedApexLogo } from './icons/AnimatedApexLogo';
import { GoogleIcon } from './icons/GoogleIcon';
import { GitHubIcon } from './icons/GitHubIcon';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-light-background dark:bg-dark-background p-8 transition-colors">
      <div className="text-center">
        <AnimatedApexLogo className="h-24 w-24 mx-auto mb-6" animationState="idle" />
        <h1 className="text-4xl font-bold text-light-foreground dark:text-dark-foreground">Welcome to Apex AI</h1>
        <p className="text-lg text-light-muted-foreground dark:text-dark-muted-foreground mt-2 mb-8">Sign in to continue</p>

        <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
          <button
            onClick={() => login('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold rounded-lg bg-light-card dark:bg-dark-card hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <GoogleIcon className="h-6 w-6" />
            Sign in with Google
          </button>
          <button
            onClick={() => login('github')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold rounded-lg bg-light-card dark:bg-dark-card hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <GitHubIcon className="h-6 w-6" />
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
