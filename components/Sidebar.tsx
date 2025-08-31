import React, { useState, useRef, useEffect } from 'react';
import type { Conversation, AnimationState } from '../types';
import { AnimatedApexLogo } from './icons/AnimatedApexLogo';
import { PlusIcon } from './icons/PlusIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import Tooltip from './Tooltip';
import UserMenu from './UserMenu';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  animationState: AnimationState;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  animationState,
}) => {
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingConversationId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingConversationId]);

  const handleStartEditing = (convo: Conversation) => {
    setEditingConversationId(convo.id);
    setEditingTitle(convo.title);
  };

  const handleRenameSubmit = () => {
    if (editingConversationId && editingTitle.trim()) {
      onRenameConversation(editingConversationId, editingTitle.trim());
    }
    setEditingConversationId(null);
    setEditingTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingConversationId(null);
      setEditingTitle('');
    }
  };

  return (
    <div className="w-72 bg-light-sidebar dark:bg-dark-sidebar flex flex-col h-full p-2 transition-colors">
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <AnimatedApexLogo className="h-10 w-10" animationState={animationState} />
          <h1 className="text-xl font-bold text-light-foreground dark:text-dark-foreground">Apex AI</h1>
        </div>
      </div>
      <div className="p-2">
        <Tooltip title="Start a new conversation">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-sidebar dark:focus:ring-offset-dark-sidebar focus:ring-indigo-500 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            New Chat
          </button>
        </Tooltip>
      </div>
      <nav className="flex-1 overflow-y-auto mt-4 space-y-1">
        {conversations.map((convo) => {
          const isEditing = editingConversationId === convo.id;
          return (
            <div
              key={convo.id}
              className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                activeConversationId === convo.id
                  ? 'bg-black/10 dark:bg-white/10 text-light-foreground dark:text-dark-foreground'
                  : 'text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-light-foreground dark:hover:text-dark-foreground'
              }`}
              onClick={() => !isEditing && onSelectConversation(convo.id)}
              onDoubleClick={() => handleStartEditing(convo)}
              title={convo.title}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-b border-indigo-500 focus:outline-none text-light-foreground dark:text-dark-foreground"
                />
              ) : (
                <span className="truncate flex-1">{convo.title}</span>
              )}

              {!isEditing && (
                <Tooltip title="Delete conversation">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(convo.id);
                    }}
                    className="ml-2 text-light-muted-foreground dark:text-dark-muted-foreground hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete conversation"
                  >
                    <DeleteIcon className="h-4 w-4" />
                  </button>
                </Tooltip>
              )}
            </div>
          );
        })}
      </nav>
      <UserMenu />
    </div>
  );
};

export default Sidebar;