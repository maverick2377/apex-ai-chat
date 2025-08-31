import React, { ReactNode } from 'react';

interface TooltipProps {
  title: string;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ title, children }) => {
  return (
    <div className="group relative flex items-center">
      {children}
      <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {title}
      </div>
    </div>
  );
};

export default Tooltip;