import React, { useState } from 'react';
import { AnimatedApexLogo } from './icons/AnimatedApexLogo';
import { useAuth } from '../contexts/AuthContext';
import { Attachment } from '../types';

interface WelcomeScreenProps {
  onStartConversation: (prompt: string, attachment?: Attachment) => void;
}

const allPrompts = [
    // Explain
    { title: "Explain a concept", prompt: "Explain quantum computing in simple terms." },
    { title: "Break down a topic", prompt: "What are the main causes of climate change?" },
    { title: "Simplify a theory", prompt: "Explain the theory of relativity like I'm five." },
    { title: "Summarize a book", prompt: "Summarize the key ideas of 'Sapiens: A Brief History of Humankind'." },
    // Creative
    { title: "Write a story", prompt: "Write a short story about a robot who discovers music." },
    { title: "Draft a poem", prompt: "Write a poem about the city at night." },
    { title: "Imagine a scenario", prompt: "What would a conversation between Shakespeare and a modern teenager be like?" },
    { title: "Create a character", prompt: "Describe a fantasy character who is a chef for dragons." },
    // Code
    { title: "Code a function", prompt: "Write a python function to check if a number is prime." },
    { title: "Debug this code", prompt: "Find the bug in this JavaScript code snippet: `const arr = [1, 2, 3]; arr.length = 0; console.log(arr[0]);`" },
    { title: "Explain a snippet", prompt: "What does the `useMemo` hook do in React? Provide a simple example." },
    { title: "Suggest an architecture", prompt: "Suggest a simple architecture for a to-do list application." },
    // Plan
    { title: "Plan a trip", prompt: "Create a 3-day itinerary for a trip to Paris." },
    { title: "Outline a project", prompt: "Outline the steps to launch a personal blog." },
    { title: "Design a workout", prompt: "Create a 30-minute workout plan for beginners." },
    { title: "Draft an email", prompt: "Draft a professional email asking for a deadline extension." },
];

const getRandomPrompts = (count: number) => {
    const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartConversation }) => {
  const { user } = useAuth();
  // Initialize state with 4 random prompts. This runs only once on mount.
  const [prompts] = useState(() => getRandomPrompts(4));


  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-center gap-4 mb-8">
          <AnimatedApexLogo className="h-20 w-20" animationState="idle" />
          <div>
            {/* FIX: Corrected property access on the user object from 'name' to 'displayName' to align with the User type definition. */}
            <h1 className="text-4xl font-bold text-light-foreground dark:text-dark-foreground">Hello, {user?.displayName || 'Explorer'}</h1>
            <p className="text-xl text-light-muted-foreground dark:text-dark-muted-foreground">How can Apex help you today?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompts.map(({ title, prompt }) => (
            <button
              key={title}
              onClick={() => onStartConversation(prompt)}
              className="bg-light-card dark:bg-dark-card p-4 rounded-lg text-left hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <h3 className="font-semibold text-light-foreground dark:text-dark-foreground">{title}</h3>
              <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mt-1">{prompt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;