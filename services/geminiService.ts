import { GoogleGenAI, Chat, Part, GenerateContentResponse, Operation, GenerateVideosResponse } from "@google/genai";
import type { Message, Attachment, Source } from '../types';
import { Role } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const APEX_SYSTEM_INSTRUCTION = "You are Apex, a powerful and friendly AI assistant. Your personality is analytical, creative, concise, and pedagogical. You must always aim for the highest level of accuracy and relevance in your responses. Please incorporate relevant emojis naturally throughout your answers to make them more engaging and expressive, just like ChatGPT would. ✨ Format your answers clearly using markdown where appropriate, especially for code blocks.";

// This will hold our stateful Chat objects.
const chatSessionCache: Record<string, Chat> = {};

// Helper to convert base64 data URI to a Part object
const fileToGenerativePart = (dataURI: string, mimeType: string): Part => {
  return {
    inlineData: {
      data: dataURI.split(',')[1],
      mimeType
    }
  };
};

// Helper to convert a Blob to a base64 data URI
const blobToDataURI = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
};


export const getOrCreateChatSession = (
  conversationId: string, 
  history: Message[], 
  systemInstruction?: string
): Chat => {
  // If a session exists, return it. It will have its own internal history.
  if (chatSessionCache[conversationId]) {
    return chatSessionCache[conversationId];
  }
  
  // If no session exists, create one with the provided history.
  // Filter out any placeholder/empty model messages that might have been persisted.
  const cleanHistory = history.filter(m => {
    const hasContent = m.content && m.content.trim() !== '';
    const hasAttachment = !!m.attachment;
    // Keep all user messages, and model messages that have content.
    return m.role === Role.USER || hasContent || hasAttachment;
  });

  const formattedHistory = cleanHistory.map(msg => {
    const parts: Part[] = [];
    if (msg.attachment) {
      parts.push(fileToGenerativePart(msg.attachment.data, msg.attachment.mimeType));
    }
    if (msg.content) {
      parts.push({ text: msg.content });
    }
    return {
      role: msg.role,
      parts,
    };
  });

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: formattedHistory,
    config: {
      systemInstruction: systemInstruction || APEX_SYSTEM_INSTRUCTION,
    },
  });

  chatSessionCache[conversationId] = chat;
  return chat;
};

// Function to invalidate a session from the cache.
export const invalidateChatSession = (conversationId: string) => {
    delete chatSessionCache[conversationId];
};


export const streamChatResponse = async (
  chat: Chat,
  prompt: string,
  attachment: Attachment | undefined,
  onChunk: (text: string) => void
): Promise<string> => {
  const parts: Part[] = [];
  if (attachment) {
    parts.push(fileToGenerativePart(attachment.data, attachment.mimeType));
  }
  if (prompt) {
    parts.push({ text: prompt });
  }
  
  // The UI prevents sending an empty message, so parts should not be empty.
  if (parts.length === 0) return "";

  const result = await chat.sendMessageStream({ message: parts });

  let fullText = "";
  for await (const chunk of result) {
    const chunkText = chunk.text;
    fullText += chunkText;
    onChunk(fullText);
  }
  return fullText;
};

export const generateImage = async (prompt: string): Promise<Attachment> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return {
        data: `data:image/png;base64,${base64ImageBytes}`,
        mimeType: 'image/png',
        name: `${prompt.slice(0, 20)}.png`
    };
};

export const getGroundedResponse = async (prompt: string): Promise<{ text: string, sources: Source[] }> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = groundingChunks
        .map((chunk: any) => ({
            uri: chunk.web?.uri || '',
            title: chunk.web?.title || '',
        }))
        .filter(source => source.uri);

    return { text, sources };
};

export const startVideoGeneration = async (prompt: string): Promise<Operation<GenerateVideosResponse>> => {
  return await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
    },
  });
};

export const pollVideoStatus = async (operation: Operation<GenerateVideosResponse>): Promise<Operation<GenerateVideosResponse>> => {
  return await ai.operations.getVideosOperation({ operation });
};

export const fetchVideo = async (operation: Operation<GenerateVideosResponse>): Promise<Attachment | null> => {
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;

  const response = await fetch(`${downloadLink}&key=${API_KEY}`);
  if (!response.ok) {
    throw new Error('Failed to download video');
  }
  const blob = await response.blob();
  const dataUri = await blobToDataURI(blob);
  return {
    data: dataUri,
    mimeType: blob.type || 'video/mp4',
    name: 'generated-video.mp4',
  };
};

export const generateTitle = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, concise title (4 words max) for a conversation that starts with this prompt: "${prompt}"`,
    });
    return response.text.trim().replace(/"/g, ''); // Clean up quotes
  } catch (error) {
    console.error("Title generation failed:", error);
    return "Chat"; // Return a simpler default title on failure
  }
};