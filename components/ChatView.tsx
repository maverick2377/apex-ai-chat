import React, { useEffect, useRef, useState } from 'react';
import type { Conversation, Message, AnimationState, ChatMode, Attachment } from '../types';
import { Role } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import CodePreviewModal from './CodePreviewModal';
import WelcomeScreen from './WelcomeScreen';
import ChatTurnNavigator from './ChatTurnNavigator';
import { AnimatedApexLogo } from './icons/AnimatedApexLogo';

interface ChatViewProps {
  conversation: Conversation | null;
  isLoading: boolean;
  onSendMessage: (prompt: string, attachment?: Attachment) => void;
  onRegenerate: (conversationId: string, messageId: string) => void;
  onFeedback: (messageId: string, feedback: 'liked' | 'disliked') => void;
  onModeChange: (mode: ChatMode) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  conversation, 
  isLoading, 
  onSendMessage, 
  onRegenerate, 
  onFeedback, 
  onModeChange 
}) => {
  const [codeToPreview, setCodeToPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(true);

  // State for turn-by-turn navigation
  const [currentTurnIndex, setCurrentTurnIndex] = useState(-1);
  const userMessageElements = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // When a new response starts generating, re-enable auto-scrolling
    // so the user can see the new message coming in.
    if (isLoading) {
      isAutoScrolling.current = true;
    }
  }, [isLoading]);

  useEffect(() => {
    // When messages change, repopulate the list of user message elements
    if (chatContainerRef.current) {
        userMessageElements.current = Array.from(
            chatContainerRef.current.querySelectorAll('[data-role="user-message"]')
        ) as HTMLElement[];
        
        // Point to the last message, this keeps the navigator in sync
        setCurrentTurnIndex(userMessageElements.current.length - 1);
    }
  }, [conversation?.messages.length, isLoading]);


  const scrollToBottom = () => {
    if (isAutoScrolling.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  };

  useEffect(scrollToBottom, [conversation?.messages.length, isLoading]);

  const handleRegenerate = (messageId: string) => {
    if (conversation) {
      onRegenerate(conversation.id, messageId);
    }
  };

  const handleRunCode = (code: string) => {
    setCodeToPreview(code);
  };
  
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Add a small buffer to ensure it triggers correctly
      const atBottom = scrollHeight - scrollTop - clientHeight < 10;
      if (atBottom) {
        isAutoScrolling.current = true;
      } else {
        isAutoScrolling.current = false;
      }
    }
  };

  const handleScrollToMessage = (index: number) => {
    const element = userMessageElements.current[index];
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevTurn = () => {
    const newIndex = Math.max(0, currentTurnIndex - 1);
    if (newIndex !== currentTurnIndex) {
        setCurrentTurnIndex(newIndex);
        handleScrollToMessage(newIndex);
    }
  };

  const handleNextTurn = () => {
    const isAtLastTurn = currentTurnIndex >= userMessageElements.current.length - 1;

    if (!isAtLastTurn) {
      const newIndex = Math.min(userMessageElements.current.length - 1, currentTurnIndex + 1);
      setCurrentTurnIndex(newIndex);
      handleScrollToMessage(newIndex);
    } else {
      // If at or past the last turn, "Next" button should scroll to the very bottom
      // and re-enable auto-scrolling.
      isAutoScrolling.current = true;
      scrollToBottom();
      setCurrentTurnIndex(userMessageElements.current.length - 1);
    }
  };
  
  const showNavigator = userMessageElements.current.length > 1;
  const showWelcomeScreen = !conversation;

  return (
    <>
      <div className="flex-1 flex flex-col bg-light-background dark:bg-dark-background h-full transition-colors overflow-hidden relative">
        <div 
          ref={chatContainerRef} 
          onScroll={handleScroll} 
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {showWelcomeScreen ? (
            <WelcomeScreen onStartConversation={onSendMessage} />
          ) : (
            conversation.messages.map((message, index) => {
              const isLastMessage = index === conversation.messages.length - 1;
              return (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  isLoading={isLoading && isLastMessage}
                  onRunCode={handleRunCode}
                  onRegenerate={handleRegenerate}
                  onFeedback={onFeedback}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        {showNavigator && (
          <ChatTurnNavigator
            onPrev={handlePrevTurn}
            onNext={handleNextTurn}
          />
        )}
        <div className="p-4 bg-light-background dark:bg-dark-background transition-colors border-t border-black/10 dark:border-white/10">
          <ChatInput 
            onSendMessage={onSendMessage} 
            isLoading={isLoading} 
            mode={conversation?.mode || 'default'}
            onModeChange={onModeChange}
            disabled={!conversation && isLoading} // Disable input on welcome screen if a send is in progress
          />
        </div>
      </div>
      {codeToPreview && (
        <CodePreviewModal 
          code={codeToPreview}
          onClose={() => setCodeToPreview(null)}
        />
      )}
    </>
  );
};

export default ChatView;