import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon } from './icons/CopyIcon';
import Tooltip from './Tooltip';
import { useToast } from '../hooks/useToast';

interface CodeArtifactProps {
  language: string;
  children: string;
  onRunCode: (code: string) => void;
}

const CodeArtifact: React.FC<CodeArtifactProps> = ({ language, children, onRunCode }) => {
  const { addToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    addToast('Code copied to clipboard!');
  };

  const isRunnable = ['html', 'javascript', 'css', 'js'].includes(language.toLowerCase());

  return (
    <div className="bg-light-code-artifact dark:bg-dark-code-artifact rounded-lg overflow-hidden my-4 border border-black/10 dark:border-white/10">
      <div className="flex justify-between items-center px-4 py-2 bg-light-code-header dark:bg-dark-code-header">
        <span className="text-sm font-mono text-light-muted-foreground dark:text-dark-muted-foreground">{language}</span>
        <div className="flex items-center gap-2">
          {isRunnable && (
            <Tooltip title="Preview code output">
               <button
                  onClick={() => onRunCode(children)}
                  className="flex items-center gap-1.5 text-xs px-2 py-1 rounded text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/10 dark:hover:bg-white/10"
                >
                  ▶ Run
                </button>
            </Tooltip>
          )}
          <Tooltip title="Copy code">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/10 dark:hover:bg-white/10"
            >
              <CopyIcon className="h-3.5 w-3.5" />
              Copy
            </button>
          </Tooltip>
        </div>
      </div>
      <SyntaxHighlighter
        style={oneDark as any}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, background: 'transparent' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeArtifact;