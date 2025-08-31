import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import useConversations from './hooks/useConversations';
import type { AnimationState, Attachment, Message, ChatMode, Conversation } from './types';
import { Role } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// FIX: `useToast` is a custom hook and should be imported from the hooks directory.
import { ToastProvider } from './contexts/ToastContext';
import { useToast } from './hooks/useToast';
import LoginScreen from './components/LoginScreen';
import { generateId } from './utils';
import { getOrCreateChatSession, invalidateChatSession, streamChatResponse, generateTitle, generateImage, getGroundedResponse, startVideoGeneration, pollVideoStatus, fetchVideo } from './services/geminiService';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const {
    conversations,
    createConversation,
    updateConversation,
    deleteConversation,
    getConversation,
  } = useConversations();
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setAnimationState('idle'); 
    setIsLoading(false); // Ensure loading state is reset
  };

  const handleNewConversation = useCallback(() => {
    const newConversation = createConversation();
    setActiveConversationId(newConversation.id);
    setAnimationState('idle');
    setIsLoading(false);
    return newConversation;
  }, [createConversation]);

  const showWelcomeScreen = () => {
    setActiveConversationId(null);
    setAnimationState('idle');
    setIsLoading(false);
  };

  const handleDeleteConversation = (id: string) => {
    const remainingConversations = conversations.filter(c => c.id !== id);
    deleteConversation(id);
    invalidateChatSession(id); // Clean up cached session
    if (activeConversationId === id) {
      setActiveConversationId(remainingConversations.length > 0 ? remainingConversations[0].id : null);
    }
  };
  
  const handleRenameConversation = (id: string, title: string) => {
    updateConversation(id, { title });
  };

  const processRequest = useCallback(async (
    convoId: string, 
    prompt: string, 
    attachment: Attachment | undefined, 
    history: Message[],
    mode: ChatMode,
  ) => {
    setIsLoading(true);
    setAnimationState('thinking');

    const userMessage = history[history.length-1];
    let modelMessage: Message = { id: generateId(), role: Role.MODEL, content: '' };
    // Add model placeholder to the conversation immediately after user message
    updateConversation(convoId, { messages: [...history, modelMessage] });
  
    try {
      let finalContent = '';
      let finalModelMessageUpdate: Partial<Message> = {};
  
      switch(mode) {
        case 'image':
          const generatedImage = await generateImage(prompt);
          finalModelMessageUpdate = { attachment: generatedImage, content: '' };
          break;
        
        case 'video':
          const videoStatusUpdate = (content: string) => {
            modelMessage = { ...modelMessage, content };
            updateConversation(convoId, { messages: [...history, modelMessage] });
          };
          
          videoStatusUpdate('Starting video generation...');
          let operation = await startVideoGeneration(prompt);
          
          const pollIntervals = [10000, 10000, 15000, 20000]; // Poll more frequently at the start
          let pollIndex = 0;

          videoStatusUpdate('Apex is crafting your video scene by scene...');
          while (!operation.done) {
              const waitTime = pollIntervals[Math.min(pollIndex, pollIntervals.length - 1)];
              await new Promise(resolve => setTimeout(resolve, waitTime));
              operation = await pollVideoStatus(operation);
              videoStatusUpdate('Rendering the frames, this can take a moment...');
              pollIndex++;
          }

          videoStatusUpdate('Finalizing and downloading your video...');
          const videoAttachment = await fetchVideo(operation);
          if (videoAttachment) {
            finalModelMessageUpdate = { attachment: videoAttachment, content: '' };
          } else {
            throw new Error("Video generation completed, but no video was returned.");
          }
          break;

        case 'deepsearch':
          const { text: groundedText, sources } = await getGroundedResponse(prompt);
          finalContent = groundedText;
          finalModelMessageUpdate = { content: groundedText, sources };
          break;
  
        case 'code':
        case 'default':
          const systemInstruction = mode === 'code' 
            ? "You are an expert programmer. Provide only code in your responses, with brief explanations in comments. Use markdown for all code blocks." 
            : undefined;
          
          // The history for the chat session should not include the model's placeholder message.
          const historyForChatSession = history.slice(0, -1);
          const chat = getOrCreateChatSession(convoId, historyForChatSession, systemInstruction);
          setAnimationState('speaking');
          
          await streamChatResponse(chat, prompt, attachment, (streamedText) => {
            finalContent = streamedText;
            const updatedModelMessage = { ...modelMessage, content: streamedText };
            updateConversation(convoId, { messages: [...history, updatedModelMessage] });
          });
          finalModelMessageUpdate = { content: finalContent };
          break;
      }
  
      const finalHistory = [...history, { ...modelMessage, ...finalModelMessageUpdate }];
      updateConversation(convoId, { messages: finalHistory });

    } catch (error) {
      console.error("Error processing message:", error);
      addToast("Sorry, I encountered an error. Please try again.");
      const errorMessage : Message = {
          ...modelMessage,
          content: "Sorry, I encountered an error. Please try again."
      };
      updateConversation(convoId, { messages: [...history, errorMessage] });
    } finally {
      setIsLoading(false);
      setAnimationState('idle');
    }
  }, [updateConversation, addToast]);

  const handleSendMessage = useCallback(async (content: string, attachment?: Attachment) => {
    let convoId = activeConversationId;
    let conversation = convoId ? getConversation(convoId) : null;

    if (!conversation) {
      conversation = handleNewConversation();
      convoId = conversation.id;
    }
    
    const userMessage: Message = { id: generateId(), role: Role.USER, content, attachment };
    const messagesWithUser = [...conversation.messages, userMessage];
    updateConversation(convoId, { messages: messagesWithUser });

    // Generate title in parallel if it's the first message
    if (conversation.messages.length === 0) {
        generateTitle(content).then(title => {
            updateConversation(convoId!, { title });
        });
    }
    
    // We pass the conversation mode from the conversation state
    await processRequest(convoId, content, attachment, messagesWithUser, conversation.mode);

  }, [activeConversationId, getConversation, handleNewConversation, updateConversation, processRequest]);

  const handleRegenerate = useCallback(async (conversationId: string, messageId: string) => {
    const conversation = getConversation(conversationId);
    if (!conversation) return;

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex < 1 || conversation.messages[messageIndex - 1].role !== Role.USER) return;
    
    // Invalidate the cached chat session to force recreation with truncated history
    invalidateChatSession(conversationId);

    const historyToRegenFrom = conversation.messages.slice(0, messageIndex - 1);
    const promptMessage = conversation.messages[messageIndex - 1];
    
    const historyWithPrompt = [...historyToRegenFrom, promptMessage];
    updateConversation(conversationId, { messages: historyWithPrompt });

    // Pass the conversation mode to processRequest
    await processRequest(conversationId, promptMessage.content, promptMessage.attachment, historyWithPrompt, conversation.mode);
  }, [getConversation, updateConversation, processRequest]);

  const handleFeedback = (messageId: string, feedback: 'liked' | 'disliked') => {
    if (!activeConversationId) return;
    const conversation = getConversation(activeConversationId);
    if (!conversation) return;

    const newMessages = conversation.messages.map(msg => 
      msg.id === messageId ? { ...msg, feedback: msg.feedback === feedback ? undefined : feedback } : msg
    );
    updateConversation(activeConversationId, { messages: newMessages });
  };
  
  const handleModeChange = (newMode: ChatMode) => {
    if (activeConversationId) {
      // Invalidate session because system instruction might change
      invalidateChatSession(activeConversationId);
      updateConversation(activeConversationId, { mode: newMode });
    }
  };

  const activeConversation = activeConversationId ? getConversation(activeConversationId) : null;

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-screen bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground font-sans">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewConversation={showWelcomeScreen}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        animationState={isLoading ? animationState : 'idle'}
      />
      <main className="flex-1 flex flex-col">
        <ChatView
            key={activeConversation?.id ?? 'welcome-view'}
            conversation={activeConversation}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onRegenerate={handleRegenerate}
            onFeedback={handleFeedback}
            onModeChange={handleModeChange}
        />
      </main>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;