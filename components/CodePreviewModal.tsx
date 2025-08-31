import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CodePreviewModalProps {
  code: string;
  onClose: () => void;
}

interface ConsoleLog {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
}

const CodePreviewModal: React.FC<CodePreviewModalProps> = ({ code, onClose }) => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [dividerY, setDividerY] = useState(window.innerHeight * 0.4); // Initial 50% of an 80vh modal
  const modalRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Message listener for console logs from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === 'null' && event.data && event.data.type === 'console') {
        setLogs(prevLogs => [...prevLogs, { level: event.data.level, message: event.data.message }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !modalRef.current) return;
    const modalRect = modalRef.current.getBoundingClientRect();
    const newY = e.clientY - modalRect.top;

    // Constrain the divider position (e.g., between 100px from top and 100px from bottom)
    if (newY > 80 && newY < modalRect.height - 80) {
      setDividerY(newY);
    }
  }, []);

  // Attach mouse move/up listeners to the window for better drag experience
  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    if (isDragging.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging.current, handleMouseMove]);


  const createHtml = (htmlCode: string) => {
    const consoleInterceptor = `
      <script>
        try {
          const originalConsole = { ...console };
          const formatArg = (arg) => {
            if (arg instanceof Error) {
                return arg.stack || arg.message;
            }
            if (typeof arg === 'object' && arg !== null) {
              try {
                return JSON.stringify(arg, null, 2);
              } catch (e) {
                return '[Unserializable Object]';
              }
            }
            if (typeof arg === 'undefined') {
                return 'undefined';
            }
            return String(arg);
          };
          const postLog = (level, args) => {
            const message = Array.from(args).map(formatArg).join(' ');
            window.parent.postMessage({ type: 'console', level, message }, '*');
          };
          console.log = (...args) => { postLog('log', args); originalConsole.log.apply(originalConsole, args); };
          console.warn = (...args) => { postLog('warn', args); originalConsole.warn.apply(originalConsole, args); };
          console.error = (...args) => { postLog('error', args); originalConsole.error.apply(originalConsole, args); };
          console.info = (...args) => { postLog('info', args); originalConsole.info.apply(originalConsole, args); };
          
          window.addEventListener('unhandledrejection', event => {
              const reason = event.reason || 'Unhandled promise rejection';
              postLog('error', [reason]);
          });

          window.onerror = (message, source, lineno, colno, error) => {
            let errorMessage = message;
            if (error && error.stack) {
                errorMessage = error.stack;
            } else if(source) {
                const sourceFile = source.split('/').pop();
                errorMessage = \`\${message} at \${sourceFile}:(\${lineno}:\${colno})\`;
            }
            window.parent.postMessage({ type: 'console', level: 'error', message: errorMessage }, '*');
            return true;
          };
        } catch (e) {
          window.parent.postMessage({ type: 'console', level: 'error', message: 'Error setting up console interceptor: ' + e.message }, '*');
        }
      </script>
    `;

    if (htmlCode.trim().startsWith('<')) {
        if (htmlCode.includes('<head>')) {
            return htmlCode.replace('<head>', '<head>' + consoleInterceptor);
        }
        return consoleInterceptor + htmlCode;
    }
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: sans-serif; color: #1a1a1a; padding: 8px; box-sizing: border-box; }
          </style>
        </head>
        <body>
          \${consoleInterceptor}
          <script>\${htmlCode}</script>
        </body>
      </html>
    `;
  };
  
  const getLogColorClass = (level: ConsoleLog['level']) => {
    switch(level) {
      case 'error': return 'text-red-500 dark:text-red-400';
      case 'warn': return 'text-yellow-500 dark:text-yellow-400';
      case 'info': return 'text-blue-500 dark:text-blue-400';
      default: return 'text-light-foreground dark:text-dark-foreground opacity-90';
    }
  };
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [logs]);

  return (
    <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-light-background dark:bg-dark-sidebar rounded-lg shadow-2xl w-full max-w-6xl h-4/5 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <h3 className="font-semibold text-light-foreground dark:text-dark-foreground">Code Preview Sandbox</h3>
            <button 
                onClick={onClose}
                className="text-light-muted-foreground dark:text-dark-muted-foreground hover:text-light-foreground dark:hover:text-dark-foreground text-2xl"
            >&times;</button>
        </div>
        
        <div className="flex flex-col flex-grow h-full">
            <div style={{ height: `\${dividerY}px` }}>
                <iframe
                    srcDoc={createHtml(code)}
                    title="Code Preview"
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts allow-modals"
                />
            </div>

            <div 
              className="w-full h-1.5 bg-light-input dark:bg-dark-input cursor-row-resize hover:bg-indigo-500 transition-colors"
              onMouseDown={handleMouseDown}
            />

            <div className="flex flex-col flex-grow" style={{ height: `calc(100% - \${dividerY}px - 6px)` }}>
                <div className="flex justify-between items-center px-4 py-2 bg-light-code-header dark:bg-dark-code-header flex-shrink-0">
                    <h4 className="font-semibold text-sm text-light-muted-foreground dark:text-dark-muted-foreground">Console</h4>
                    <button 
                        onClick={() => setLogs([])}
                        className="text-xs px-2 py-1 rounded text-light-muted-foreground dark:text-dark-muted-foreground hover:bg-black/10 dark:hover:bg-white/10"
                    >Clear</button>
                </div>
                <div className="flex-grow p-2 bg-light-code-artifact dark:bg-dark-code-artifact overflow-y-auto font-mono text-xs">
                  {logs.map((log, index) => (
                    <div key={index} className={`flex items-start gap-2 py-1 border-b border-black/5 dark:border-white/5 last:border-b-0`}>
                        <span className="flex-shrink-0 opacity-50 select-none">&gt;</span>
                        <pre className={`whitespace-pre-wrap break-words w-full \${getLogColorClass(log.level)}`}>{log.message}</pre>
                    </div>
                  ))}
                  {logs.length === 0 && (
                      <div className="text-light-muted-foreground dark:text-dark-muted-foreground italic h-full flex items-center justify-center select-none">
                          Console output will appear here...
                      </div>
                  )}
                  <div ref={consoleEndRef} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodePreviewModal;