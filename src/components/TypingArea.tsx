import { useMemo } from 'react';

interface TypingAreaProps {
  originalText: string;
  userInput: string;
  isActive: boolean;
  isFinished: boolean;
  inSplitMode?: boolean;
}

export default function TypingArea({ originalText, userInput, isActive, isFinished, inSplitMode = false }: TypingAreaProps) {
  const characters = useMemo(() => {
    // If in split mode, we only want to show the user's input, maybe styled slightly differently
    // Actually, in split mode, maybe we just show the user's characters exactly as typed,
    // but keep the right/wrong color glow.
    if (inSplitMode) {
      return originalText.split('').map((char, i) => {
        if (i >= userInput.length) return null; // Don't show untyped chars in split mode
        const state = userInput[i] === char ? 'correct' : 'incorrect';
        const typedChar = userInput[i];
        
        return (
          <span
            key={i}
            className={`
              relative text-2xl font-mono tracking-wide transition-colors duration-100 whitespace-pre
              ${state === 'correct' ? 'text-blue-400' : 'text-rose-400 bg-rose-500/10 rounded-sm'}
            `}
          >
            {typedChar}
          </span>
        );
      });
    }

    // Default Overlay Mode
    return originalText.split('').map((char, i) => {
      let state = 'untyped';
      if (i < userInput.length) {
        state = userInput[i] === char ? 'correct' : 'incorrect';
      }

      const isCurrent = i === userInput.length;
      
      return (
        <span
          key={i}
          className={`
            relative text-3xl font-mono tracking-wide transition-colors duration-100 whitespace-pre
            ${state === 'untyped' ? 'text-slate-500' : ''}
            ${state === 'correct' ? 'text-slate-50' : ''}
            ${state === 'incorrect' ? 'text-rose-400 bg-rose-500/20 rounded-sm' : ''}
            ${isCurrent ? 'after:content-[""] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-1 after:bg-blue-400 after:animate-pulse' : ''}
            ${!isActive && isCurrent && !isFinished ? 'animate-pulse opacity-50' : ''}
          `}
        >
          {char}
        </span>
      );
    });
  }, [originalText, userInput, isActive, isFinished, inSplitMode]);

  return (
    <div className={`relative w-full ${inSplitMode ? 'mt-4' : 'max-w-4xl mx-auto mt-8'}`}>
      {/* Blurry glow effect behind the text */}
      {!inSplitMode && <div className="absolute -inset-4 bg-slate-800/30 blur-2xl rounded-[3rem] -z-10" />}
      
      <div 
        className={`text-left leading-relaxed ${inSplitMode ? 'p-2 min-h-[150px] w-full' : 'p-10 bg-slate-800/40 backdrop-blur-md rounded-4xl border border-slate-700/50 shadow-2xl min-h-[300px]'}`}
        tabIndex={0} // Make focusable to capture keystrokes via hook easily if wanted
        onKeyDown={(e) => {
          // Prevent spacebar scrolling when active
          if (e.key === ' ' && isActive) e.preventDefault();
        }}
      >
        <div className="select-none flex flex-wrap" style={{ wordBreak: 'break-word' }}>
          {characters}
          
          {/* Caret in split mode */}
          {inSplitMode && !isFinished && (
             <span className={`inline-block w-2.5 h-6 bg-blue-500 ml-0.5 mt-1 ${!isActive ? 'animate-pulse opacity-50' : 'animate-pulse'}`} />
          )}
        </div>
      </div>
      
      {!isActive && !isFinished && userInput.length === 0 && (
        <div className={`absolute inset-x-0 ${inSplitMode ? '-bottom-8' : '-bottom-12'} text-center text-slate-400 animate-bounce`}>
          Start typing to begin...
        </div>
      )}
    </div>
  );
}
