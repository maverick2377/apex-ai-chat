import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '../types';
import { Role } from '../types';
import { generateId } from '../utils';

const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    try {
      const storedConversations = localStorage.getItem('apex-conversations');
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      }
    // FIX: Corrected a malformed try...catch block which was causing a major parsing error.
    } catch (error) {
      console.error("Failed to load conversations from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      // Sanitize conversations for storage by removing large attachment data.
      // This prevents exceeding the localStorage quota.
      const conversationsForStorage = conversations.map(convo => ({
        ...convo,
        messages: convo.messages.map(message => {
          // Return the message as is if there's no attachment
          if (!message.attachment) {
            return message;
          }
          // Otherwise, create a new message object omitting the 'attachment' property
          const { attachment, ...messageWithoutAttachment } = message;
          return messageWithoutAttachment;
        }),
      }));
      localStorage.setItem('apex-conversations', JSON.stringify(conversationsForStorage));
    } catch (error) {
      console.error("Failed to save conversations to localStorage", error);
    }
  }, [conversations]);

  const createConversation = (): Conversation => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      mode: 'default',
    };
    setConversations(prev => [newConversation, ...prev]);
    return newConversation;
  };

  const getConversation = useCallback((id: string): Conversation | undefined => {
    return conversations.find(c => c.id === id);
  }, [conversations]);

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
  };

  return { conversations, createConversation, getConversation, updateConversation, deleteConversation };
};

export default useConversations;