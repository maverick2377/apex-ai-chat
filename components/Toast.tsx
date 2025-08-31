import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);
    
    // Set timeout for animation out before component is removed from DOM
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // Start fade out 500ms before it's removed

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Toast;