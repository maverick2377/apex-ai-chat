import React, { useState, useRef, useEffect } from 'react';
import type { Attachment, ChatMode } from '../types';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ImageIcon } from './icons/ImageIcon';
import { CodeIcon } from './icons/CodeIcon';
import { SearchIcon } from './icons/SearchIcon';
import { VideoIcon } from './icons/VideoIcon';
import Tooltip from './Tooltip';
import { useToast } from '../hooks/useToast';

// Check for SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'fr-FR';
  recognition.interimResults = true;
}

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: Attachment) => void;
  isLoading: boolean;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

const modeConfig = {
    default: { name: 'Apex', placeholder: "Type your message to Apex...", icon: <SparklesIcon className="h-5 w-5"/> },
    image: { name: 'Image', placeholder: "Describe an image to generate...", icon: <ImageIcon className="h-5 w-5 text-purple-400" /> },
    video: { name: 'Video', placeholder: "Describe a video to generate...", icon: <VideoIcon className="h-5 w-5 text-orange-400" /> },
    code: { name: 'Code', placeholder: "Ask a coding question...", icon: <CodeIcon className="h-5 w-5 text-blue-400" /> },
    deepsearch: { name: 'Deep Search', placeholder: "Search the web with Apex...", icon: <SearchIcon className="h-5 w-5 text-green-400" /> },
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, mode, onModeChange, disabled = false }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 256)}px`;
    }
  }, [text]);
  
  // Close mode menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
            setIsModeMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((text.trim() || attachment) && !isLoading && !disabled) {
      onSendMessage(text.trim(), attachment);
      setText('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setAttachment({
          data: loadEvent.target?.result as string,
          mimeType: file.type,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleVoiceInput = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      return;
    }

    recognition.start();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
        console.error("Speech recognition error", e);
        setIsListening(false);
    };
    recognition.onresult = (event) => {
      setText(Array.from(event.results).map(r => r[0].transcript).join(''));
    };
  };

  const handleSelectMode = (newMode: ChatMode) => {
      onModeChange(newMode);
      addToast(`Switched to ${modeConfig[newMode].name} mode`);
      setIsModeMenuOpen(false);
  }

  return (
    <div className="bg-light-input dark:bg-dark-input rounded-xl p-2 transition-colors">
       {attachment && (
        <div className="p-2 relative w-fit">
          <img src={attachment.data} alt={attachment.name} className="h-20 w-20 object-cover rounded-md" />
          <button 
            onClick={() => setAttachment(null)}
            className="absolute -top-1 -right-1 bg-gray-600 text-white rounded-full p-0.5 hover:bg-red-500"
          >
            <DeleteIcon className="h-3 w-3" />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-1">
        <div className="relative" ref={modeMenuRef}>
            {isModeMenuOpen && (
                <div className="absolute bottom-full mb-2 w-48 bg-light-sidebar dark:bg-dark-sidebar rounded-lg shadow-xl border border-black/10 dark:border-white/10 py-1 z-10">
                    {(Object.keys(modeConfig) as ChatMode[]).map(modeKey => (
                       <button key={modeKey} type="button" onClick={() => handleSelectMode(modeKey)} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-light-foreground dark:text-dark-foreground hover:bg-black/5 dark:hover:bg-white/5">
                           {modeConfig[modeKey].icon}
                           <span>{modeConfig[modeKey].name}</span>
                       </button>
                    ))}
                </div>
            )}
            <Tooltip title={`Current Mode: ${modeConfig[mode].name}`}>
              <button
                type="button"
                onClick={() => setIsModeMenuOpen(prev => !prev)}
                className="p-2 rounded-full text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-light-foreground dark:hover:text-dark-foreground transition-colors"
                disabled={isLoading || disabled}
                aria-label="Select Mode"
              >
                {modeConfig[mode].icon}
              </button>
            </Tooltip>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <Tooltip title="Attach file">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-light-foreground dark:hover:text-dark-foreground transition-colors" disabled={isLoading || disabled} aria-label="Attach file">
            <PaperclipIcon className="h-5 w-5" />
          </button>
        </Tooltip>
        <Tooltip title="Use voice">
          <button type="button" onClick={handleVoiceInput} className={`p-2 rounded-full text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-light-foreground dark:hover:text-dark-foreground transition-colors ${isListening ? 'text-red-500' : ''}`} disabled={isLoading || disabled || !recognition} aria-label="Use voice input">
            <MicrophoneIcon className="h-5 w-5" />
          </button>
        </Tooltip>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={modeConfig[mode].placeholder}
          rows={1}
          className="hide-scrollbar flex-1 bg-transparent text-light-foreground dark:text-dark-foreground placeholder-light-muted-foreground dark:placeholder-dark-muted-foreground py-2.5 pl-2 pr-12 focus:outline-none resize-none max-h-64"
          disabled={isLoading || disabled}
        />
        <Tooltip title="Send message">
          <button
            type="submit"
            className={`absolute right-2 bottom-1.5 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors ${isLoading ? 'animate-pulse !bg-indigo-500' : ''}`}
            disabled={isLoading || disabled || (!text.trim() && !attachment)}
            aria-label="Send message"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </Tooltip>
      </form>
    </div>
  );
};

export default ChatInput;