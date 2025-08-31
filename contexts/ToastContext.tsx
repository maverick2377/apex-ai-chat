import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { generateId } from '../utils';
import Toast from '../components/Toast';

interface ToastMessage {
  id: string;
  message: string;
}

interface ToastContextType {
  addToast: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string) => {
    const id = generateId();
    setToasts(prevToasts => [...prevToasts, { id, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};