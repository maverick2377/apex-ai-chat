

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export type ChatMode = 'default' | 'image' | 'code' | 'deepsearch' | 'video';

export interface Attachment {
  // base64 data URI
  data: string;
  mimeType: string;
  name: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachment?: Attachment;
  sources?: Source[];
  feedback?: 'liked' | 'disliked';
}

export interface Conversation {
  id:string;
  title: string;
  messages: Message[];
  mode: ChatMode;
  starterPrompt?: string; // For suggested prompts
  starterAttachment?: Attachment;
}

export type AnimationState = 'idle' | 'thinking' | 'speaking';

export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'github';
}