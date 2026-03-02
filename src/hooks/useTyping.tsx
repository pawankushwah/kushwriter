import { useState, useEffect, useCallback, useRef } from 'react';

export interface TypingStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  timeRemaining: number;
  errors: number;
  totalTyped: number;
}

interface UseTypingProps {
  textToType: string;
  timeLimit?: number; // In seconds
}

export function useTyping({ textToType, timeLimit = 60 }: UseTypingProps) {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stats
  const errors = userInput.split('').reduce((acc, char, index) => {
    return char !== textToType[index] && index < textToType.length ? acc + 1 : acc;
  }, 0);

  const accuracy = userInput.length > 0 
    ? Math.max(0, Math.round(((userInput.length - errors) / userInput.length) * 100))
    : 100;

  // Words Per Minute: 1 word = 5 characters on average
  // WPM = (Total Typed Characters - Errors) / 5 / (Time in Minutes)
  const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const minutesElapsed = timeElapsed / 60;
  
  const wpm = minutesElapsed > 0 
    ? Math.round(((userInput.length - errors) / 5) / minutesElapsed)
    : 0;

  const cpm = minutesElapsed > 0 
    ? Math.round((userInput.length - errors) / minutesElapsed)
    : 0;


  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFinished) return;
    
    // Start timing on first keypress
    if (!isActive && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Blur any focused buttons so they don't intercept keypresses like space or enter
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setIsActive(true);
      setStartTime(Date.now());
    }

    if (e.key === 'Backspace') {
      setUserInput((prev) => prev.slice(0, -1));
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key === ' ') {
        e.preventDefault(); // Prevent space from scrolling or clicking buttons
      }
      
      // Prevent typing beyond the text length
      if (userInput.length < textToType.length) {
         setUserInput((prev) => prev + e.key);
      }
    }
  }, [isActive, isFinished, userInput.length, textToType.length]);

  // Hook up event listeners globally so we don't need a focused input field
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

    const handleFinish = useCallback(() => {
    setIsFinished(true);
    setIsActive(false);

    // Calculate final stats
    const finalErrors = userInput.split('').reduce((acc, char, index) => {
      return char !== textToType[index] && index < textToType.length ? acc + 1 : acc;
    }, 0);
    
    const finalTimeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
    const finalMinutesElapsed = finalTimeElapsed / 60;
    const finalWpm = finalMinutesElapsed > 0 
      ? Math.round(((userInput.length - finalErrors) / 5) / finalMinutesElapsed)
      : 0;

    // Save best score to localStorage
    const savedBest = localStorage.getItem('kushwriter_best_wpm');
    if (!savedBest || finalWpm > parseInt(savedBest, 10)) {
       localStorage.setItem('kushwriter_best_wpm', finalWpm.toString());
       // Fire a custom event to notify other parts of the app if they care
       window.dispatchEvent(new Event('new-best-score'));
    }
  }, [userInput, textToType, startTime]);

  // Timer effect
  useEffect(() => {
    if (isActive && !isFinished && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

     // Finish immediately if text is fully typed
     if (userInput.length === textToType.length && isActive) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleFinish();
     }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isFinished, timeRemaining, userInput.length, textToType.length, handleFinish]);

  const reset = () => {
    setUserInput('');
    setStartTime(null);
    setIsActive(false);
    setIsFinished(false);
    setTimeRemaining(timeLimit);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
    userInput,
    isActive,
    isFinished,
    stats: {
      wpm: Math.max(0, wpm),
      cpm: Math.max(0, cpm),
      accuracy,
      timeRemaining,
      errors,
      totalTyped: userInput.length
    },
    reset
  };
}
