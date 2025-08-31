import React from 'react';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import Tooltip from './Tooltip';

interface ChatTurnNavigatorProps {
  onPrev: () => void;
  onNext: () => void;
}

const ChatTurnNavigator: React.FC<ChatTurnNavigatorProps> = ({ onPrev, onNext }) => {
  return (
    <div className="absolute bottom-28 right-6 bg-light-sidebar dark:bg-dark-sidebar shadow-lg rounded-full border border-black/10 dark:border-white/10 flex items-center z-10">
      <Tooltip title="Previous prompt">
        <button
          onClick={onPrev}
          className="p-2 text-light-muted-foreground dark:text-dark-muted-foreground hover:text-light-foreground dark:hover:text-dark-foreground"
          aria-label="Previous prompt"
        >
          <ChevronUpIcon className="h-5 w-5" />
        </button>
      </Tooltip>
      <div className="h-4 w-px bg-black/10 dark:bg-white/10"></div>
      <Tooltip title="Next prompt">
        <button
          onClick={onNext}
          className="p-2 text-light-muted-foreground dark:text-dark-muted-foreground hover:text-light-foreground dark:hover:text-dark-foreground"
          aria-label="Next prompt"
        >
          <ChevronDownIcon className="h-5 w-5" />
        </button>
      </Tooltip>
    </div>
  );
};

export default ChatTurnNavigator;