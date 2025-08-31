import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';
import { Role } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AnimatedApexLogo } from './icons/AnimatedApexLogo';
import { CopyIcon } from './icons/CopyIcon';
import { RegenerateIcon } from './icons/RegenerateIcon';
import { LikeIcon } from './icons/LikeIcon';
import { DislikeIcon } from './icons/DislikeIcon';
import CodeArtifact from './CodeArtifact';
import { useToast } from '../hooks/useToast';
import Tooltip from './Tooltip';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  onRunCode: (code: string) => void;
  onRegenerate: (messageId: string) => void;
  onFeedback: (messageId: string, feedback: 'liked' | 'disliked') => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false, onRunCode, onRegenerate, onFeedback }) => {
  const { id, role, content, attachment, sources, feedback } = message;
  const isUser = role === Role.USER;
  const { addToast } = useToast();

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      addToast('Copied to clipboard!');
    }
  };

  // A model message is in a loading state if isLoading is true and it has no content yet.
  const showLoadingIndicator = !isUser && isLoading && !content && !attachment;

  return (
    <div data-role={isUser ? 'user-message' : 'model-message'} className={`group flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <AnimatedApexLogo className="h-8 w-8 flex-shrink-0 mt-1" animationState={isLoading ? 'thinking' : 'idle'} />}
      <div className="w-full max-w-3xl">
        {showLoadingIndicator ? (
            <div className="bg-light-bubble-model dark:bg-dark-bubble-model px-4 py-3 rounded-xl">
                <div className="h-5 flex items-center space-x-1.5" aria-label="Apex is thinking...">
                    <span className="h-2 w-2 bg-indigo-500 rounded-full pulsing-dot"></span>
                    <span className="h-2 w-2 bg-indigo-500 rounded-full pulsing-dot"></span>
                    <span className="h-2 w-2 bg-indigo-500 rounded-full pulsing-dot"></span>
                </div>
            </div>
        ) : (
            <div className={`relative rounded-xl ${
              isUser 
                ? 'bg-light-bubble-user text-light-bubble-user-text dark:bg-dark-bubble-user dark:text-dark-bubble-user-text' 
                : 'bg-light-bubble-model text-light-bubble-model-text dark:bg-dark-bubble-model dark:text-dark-bubble-model-text'
            }`}>
              {(attachment || content) && (
              <div className="px-4 py-3">
                  {attachment && (
                  <div className="pb-2 relative">
                      {attachment.mimeType.startsWith('image/') && (
                        <img 
                          src={attachment.data} 
                          alt={attachment.name} 
                          className="rounded-lg max-w-sm max-h-80"
                        />
                      )}
                      {attachment.mimeType.startsWith('video/') && (
                        <div className="relative w-fit rounded-lg overflow-hidden">
                           <video 
                             src={attachment.data} 
                             controls 
                             className="block max-w-sm max-h-80"
                           />
                           <div className="absolute bottom-2 right-2 text-white font-mono text-xs opacity-70 pointer-events-none bg-black/30 px-1.5 py-0.5 rounded-sm">
                             Nexora_Prime
                           </div>
                        </div>
                      )}
                  </div>
                  )}
                  {content && (
                  <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                      code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          
                          if (!isUser && match) {
                            return (
                              <CodeArtifact
                                language={match[1]}
                                onRunCode={onRunCode}
                              >
                                {codeString}
                              </CodeArtifact>
                            );
                          }

                          return match ? (
                          <div className="bg-black/80 text-white rounded-md my-2 text-sm">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-white/10">
                              <span className="text-gray-300 text-xs">{match[1]}</span>
                              </div>
                              <pre className="p-3 overflow-x-auto"><code>{children}</code></pre>
                          </div>
                          ) : (
                          <code className="bg-black/10 dark:bg-white/10 text-indigo-500 dark:text-indigo-400 px-1.5 py-1 rounded" {...props}>
                              {children}
                          </code>
                          );
                      },
                      p({ children }) {
                          return <p className="mb-2 last:mb-0">{children}</p>;
                      },
                      ul({ children }) {
                          return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                      },
                      ol({ children }) {
                          return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                      }
                      }}
                  >
                      {content}
                  </ReactMarkdown>
                  )}
              </div>
              )}
              
              {sources && sources.length > 0 && (
                <div className="border-t border-black/10 dark:border-white/10 mt-2 px-4 py-3">
                  <h4 className="text-xs font-semibold mb-2 text-light-muted-foreground dark:text-dark-muted-foreground">Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source, index) => (
                      <a 
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors truncate"
                        title={source.uri}
                      >
                        {index + 1}. {source.title || new URL(source.uri).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
        )}
        {!isUser && content && !isLoading && (
            <div className="flex items-center gap-2 mt-2 h-7">
                <Tooltip title="Copy">
                    <button onClick={handleCopy} className="p-1.5 rounded-lg text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/5 dark:hover:bg-white/5" aria-label="Copy message">
                        <CopyIcon className="h-4 w-4" />
                    </button>
                </Tooltip>
                <Tooltip title="Regenerate">
                    <button onClick={() => onRegenerate(id)} className="p-1.5 rounded-lg text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/5 dark:hover:bg-white/5" aria-label="Regenerate response">
                        <RegenerateIcon className="h-4 w-4" />
                    </button>
                </Tooltip>
                <Tooltip title="Like">
                    <button onClick={() => onFeedback(id, 'liked')} className={`p-1.5 rounded-lg ${feedback === 'liked' ? 'text-indigo-500' : 'text-light-muted-foreground dark:text-dark-muted-foreground'} hover:bg-black/5 dark:hover:bg-white/5`} aria-label="Like response">
                        <LikeIcon className="h-4 w-4" />
                    </button>
                </Tooltip>
                <Tooltip title="Dislike">
                    <button onClick={() => onFeedback(id, 'disliked')} className={`p-1.5 rounded-lg ${feedback === 'disliked' ? 'text-indigo-500' : 'text-light-muted-foreground dark:text-dark-muted-foreground'} hover:bg-black/5 dark:hover:bg-white/5`} aria-label="Dislike response">
                        <DislikeIcon className="h-4 w-4" />
                    </button>
                </Tooltip>
            </div>
        )}
      </div>
      {isUser && <UserIcon className="h-8 w-8 text-light-muted-foreground dark:text-dark-muted-foreground flex-shrink-0 mt-1" />}
    </div>
  );
};

export default ChatMessage;