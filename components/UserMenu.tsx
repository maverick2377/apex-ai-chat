import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import Tooltip from './Tooltip';
import { UserIcon } from './icons/UserIcon';

type Theme = 'light' | 'dark';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('apex-theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('apex-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  if (!user) return null;

  return (
    <div className="p-2 border-t border-black/10 dark:border-white/10 mt-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="User avatar" className="h-7 w-7 rounded-full flex-shrink-0" />
          ) : (
            <div className="h-7 w-7 rounded-full flex-shrink-0 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{user.displayName}</span>
            <div className="flex items-center gap-1 text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                {user.provider === 'google' 
                    ? <GoogleIcon className="h-3 w-3 flex-shrink-0" /> 
                    : <GitHubIcon className="h-3 w-3 flex-shrink-0" />
                }
                <span>{user.provider}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0">
          <Tooltip title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </Tooltip>
          <Tooltip title="Log out">
            <button
              onClick={logout}
              className="p-2 rounded-lg text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;