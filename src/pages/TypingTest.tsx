import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, BarChart2, Delete, ArrowLeftSquare, Clock } from 'lucide-react';
import type { Paragraph } from '../components/ParagraphManager';

import { getParagraphsByLanguage } from '../data/paragraphs';

const WordSpan = React.memo(({
   word,
   isActive,
   isCorrect,
   isWrong,
   highlightEnabled,
   typedWord,
   isVirtualPlaceholder
}: {
   word: string;
   isActive: boolean;
   isCorrect: boolean;
   isWrong: boolean;
   highlightEnabled: boolean;
   typedWord: string;
   isVirtualPlaceholder?: boolean;
}) => {
   if (isVirtualPlaceholder) {
      // Used to preserve scroll layout without rendering the dom heavy spans
      return <span>{' '.repeat(word.length + 1)}</span>;
   }

   let colorClass = 'text-slate-500';
   let bgClass = '';

   // Highlight logic only if enabled
   if (highlightEnabled) {
      if (isCorrect) {
         colorClass = 'text-emerald-400/80';
      } else if (isWrong) {
         colorClass = 'text-red-400/80';
         bgClass = 'bg-red-500/10 rounded px-1';
      }
   }

   // Current active word styling
   if (isActive) {
      colorClass = 'text-slate-100';
      bgClass = 'bg-slate-700/80 rounded-lg px-2 shadow-sm border border-slate-600';
      
      // Sub-word validation for immediate feedback on the current word being typed
      const typedChars = typedWord.split('');
      const targetChars = word.split('');
      let isErrorInCurrent = false;

      for (let i = 0; i < typedChars.length; i++) {
         if (targetChars[i] !== typedChars[i]) {
            isErrorInCurrent = true;
            break;
         }
      }

      if (isErrorInCurrent && highlightEnabled) {
         bgClass = 'bg-red-500/30 rounded-lg px-2 border border-red-500/50';
      }
   }

   return (
      <span className={`inline-block mr-[0.3em] py-0.5 transition-colors duration-100 ${colorClass} ${bgClass}`}>
         {word}
      </span>
   );
});

interface TestState {
  duration: number; // in minutes
  paragraphId: string | null;
  language?: string;
}

export default function TypingTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as TestState | null;

  // --- 1. Initialization & Configuration ---
  const initialDurationMinutes = state?.duration || 1;
  const paragraphId = state?.paragraphId;
  const language = state?.language || 'english';
  const defaultParagraphsForLang = useMemo(() => getParagraphsByLanguage(language), [language]);

  // Options
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [backspaceMode, setBackspaceMode] = useState<'on' | 'off' | 'word'>('on');

  // Paragraph Selection
  const [currentParagraph, setCurrentParagraph] = useState<Paragraph | null>(null);
  
  useEffect(() => {
     // Load paragraph logic
     const allParagraphs: Paragraph[] = JSON.parse(localStorage.getItem('kushwriter_paragraphs') || '[]');
     const mergedParagraphs = [...defaultParagraphsForLang, ...allParagraphs.filter(p => p.isCustom)];
     
     if (paragraphId) {
        const found = mergedParagraphs.find(p => p.id === paragraphId);
        if (found) setCurrentParagraph(found);
        else setCurrentParagraph(mergedParagraphs[0]);
     } else {
        // Randomly pick a default paragraph if none selected (e.g., standard quick tests 1-30min)
        const randomDefault = defaultParagraphsForLang[Math.floor(Math.random() * defaultParagraphsForLang.length)];
        setCurrentParagraph(randomDefault);
     }
  }, [paragraphId, defaultParagraphsForLang]);

  // --- 2. Typing Mechanics State ---
  const [inputVal, setInputVal] = useState('');
  const [baseIndex, setBaseIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // --- Virtualization State ---
  const [renderBounds, setRenderBounds] = useState({ start: 0, end: 150 });

  
  // Stats
  const [timeLeft, setTimeLeft] = useState(initialDurationMinutes * 60);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  
  const [grossKeystrokes, setGrossKeystrokes] = useState(0);
  const [deleteCount, setDeleteCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  
  const wordStatusesRef = useRef<Uint8Array | null>(null);
  if (!wordStatusesRef.current) {
     wordStatusesRef.current = new Uint8Array(50000);
  }

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const paragraphContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Split paragraph into words when it loads
  useEffect(() => {
     if (currentParagraph) {
        // Splitting by whitespace and removing empty strings
        const parsedWords = currentParagraph.content.split(/\s+/).filter(w => w.length > 0);
        setWords(parsedWords);
        resetTest();
     }
  }, [currentParagraph]);

  // --- 3. Scroll & Virtualization Management ---
  // Ensure the active word is always visible by auto-scrolling
  useEffect(() => {
     if (activeWordRef.current && paragraphContainerRef.current) {
        const container = paragraphContainerRef.current;
        const activeElem = activeWordRef.current;
        
        // Calculate the necessary scroll top to keep the active element around the center vertically
        const containerHeight = container.clientHeight;
        const elementOffsetTop = activeElem.offsetTop;
        
        // Only scroll if we move below the first line reasonably
        if (elementOffsetTop > containerHeight / 2) {
           container.scrollTo({
              top: elementOffsetTop - containerHeight / 2,
              behavior: 'smooth'
           });
        } else {
           container.scrollTo({ top: 0, behavior: 'smooth' });
        }
     }
  }, [currentWordIndex]);

  // Handle manual scrolling to load words dynamically
  const handleScroll = useCallback(() => {
     if (!paragraphContainerRef.current) return;
     
     // We estimate how many words fit on screen based on an average typography density
     // Standard paragraph width: ~800px. Avg word length: 5 chars. Font size: 32px.
     // Roughly 10-14 words per line, 10 lines per screen = ~150 words visible max.
     const WORDS_PER_SCREEN = 150; 
     const WORDS_PER_LINE_ESTIMATE = 12;
     
     const container = paragraphContainerRef.current;
     const scrollTop = container.scrollTop;
     
     // Rough estimate: 51px line height (32px font + 1.6 leading margin)
     const LINE_HEIGHT = 51; 
     
     const linesScrolled = Math.floor(scrollTop / LINE_HEIGHT);
     const guessedStartWord = Math.max(0, (linesScrolled - 5) * WORDS_PER_LINE_ESTIMATE); // Give 5 lines buffer above
     
     setRenderBounds({
         start: guessedStartWord,
         end: guessedStartWord + WORDS_PER_SCREEN + 100 // 100 words buffer below
     });
  }, []);

  // Initialize bounds on load
  useEffect(() => {
     handleScroll();
  }, [words, handleScroll]);

  // --- 4. Timer Logic ---
  useEffect(() => {
     let timer: ReturnType<typeof setInterval>;
     if (isTestActive && timeLeft > 0) {
        timer = setInterval(() => {
           setTimeLeft(prev => prev - 1);
        }, 1000);
     } else if (timeLeft === 0 && isTestActive) {
        // Test ends
        finishTest();
     }
     
     return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);


  // --- 5. Handlers ---
  const resetTest = useCallback(() => {
     setIsTestActive(false);
     setIsTestFinished(false);
     setTimeLeft(initialDurationMinutes * 60);
     setInputVal('');
     setBaseIndex(0);
     setCurrentWordIndex(0);
     setGrossKeystrokes(0);
     setDeleteCount(0);
     setBackspaceCount(0);
     if (wordStatusesRef.current) {
        wordStatusesRef.current.fill(0);
     }
     
     if (inputRef.current) {
         inputRef.current.value = '';
         inputRef.current.focus();
     }
     if (paragraphContainerRef.current) {
        paragraphContainerRef.current.scrollTo(0,0);
     }
  }, [initialDurationMinutes]);

  const changeParagraph = () => {
      // Pick a random default if custom isn't forced, or just cycle through defaults
      const otherDefaults = defaultParagraphsForLang.filter(p => p.id !== currentParagraph?.id);
      if (otherDefaults.length > 0) {
         setCurrentParagraph(otherDefaults[Math.floor(Math.random() * otherDefaults.length)]);
      }
  };

  const finishTest = useCallback(() => {
     setIsTestActive(false);
     setIsTestFinished(true);

     let correctCount = 0;
     let wrongCount = 0;
     
     if (wordStatusesRef.current) {
        for (let i = 0; i < baseIndex; i++) {
           if (wordStatusesRef.current[i] === 1) correctCount++;
           else if (wordStatusesRef.current[i] === 2) wrongCount++;
        }
     }
     
     const activeWords = inputVal.split(' ');
     for (let i = 0; i < activeWords.length; i++) {
        if (i === activeWords.length - 1 && activeWords[i] === '') continue;
        const typed = activeWords[i];
        const target = words[baseIndex + i];
        if (target !== undefined) {
           if (typed === target) correctCount++;
           else wrongCount++;
        }
     }

     // Redirect to results page, passing stats
     navigate('/test/result', {
        state: {
           stats: {
              timeElapsed: (initialDurationMinutes * 60) - timeLeft,
              totalTime: initialDurationMinutes * 60,
              grossKeystrokes,
              deleteCount,
              backspaceCount,
              correctWordCount: correctCount,
              wrongWordCount: wrongCount,
              totalWordsEncountered: currentWordIndex,
              // extra tracking can be passed here...
           }
        },
        replace: true 
     });
  }, [navigate, initialDurationMinutes, timeLeft, grossKeystrokes, deleteCount, backspaceCount, currentWordIndex, baseIndex, inputVal, words]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (isTestFinished) {
         e.preventDefault();
         return;
     }

     // Start test on first key stroke 
     // Ignore simple modifer keys alone
     if (!isTestActive && !['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        setIsTestActive(true);
     }

     // Backspace & Delete tracking
     if (e.key === 'Backspace') {
        setBackspaceCount(prev => prev + 1);
        
        // Backspace Rules Enforcement
        if (backspaceMode === 'off') {
           e.preventDefault(); // Block entirely
        } else if (backspaceMode === 'word') {
           const cursorPos = inputRef.current?.selectionStart || 0;
           const selStart = inputRef.current?.selectionStart || 0;
           const selEnd = inputRef.current?.selectionEnd || 0;
           const selectedText = inputVal.substring(selStart, selEnd);
           
           if (selectedText.includes(' ') || (selStart === selEnd && cursorPos > 0 && inputVal[cursorPos - 1] === ' ')) {
              e.preventDefault(); // Block cross-word backspacing
           }
        }
     } else if (e.key === 'Delete') {
        setDeleteCount(prev => prev + 1);
     }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (isTestFinished) return;
     
     // Anti-cheat: prevent massive script insertions (e.g. overriding paste blockers)
     // Native onChange from normal typing shouldn't be more than a few chars at once unless lagging extremely hard.
     if (e.nativeEvent && (e.nativeEvent as InputEvent).inputType === 'insertFromPaste') {
          e.preventDefault();
          return;
     }
     
     const val = e.target.value;
     const lengthDiff = val.length - inputVal.length;
     
     // More extreme anti-cheat blocker for bot scripts
     if (lengthDiff > 10) {
        return;
     }
     
     if (lengthDiff > 0) {
        setGrossKeystrokes(prev => prev + lengthDiff);
     }

     let finalVal = val;
     let newBaseIndex = baseIndex;
     let typed = finalVal.split(' ');

     if (typed.length > 25) {
        const wordsToCommit = typed.length - 25;
        for (let i = 0; i < wordsToCommit; i++) {
            const committedWord = typed[i];
            const targetWord = words[newBaseIndex + i];
            if (wordStatusesRef.current) {
                wordStatusesRef.current[newBaseIndex + i] = (committedWord === targetWord) ? 1 : 2;
            }
        }
        newBaseIndex += wordsToCommit;
        typed = typed.slice(wordsToCommit);
        finalVal = typed.join(' ');
        
        const trimLen = val.length - finalVal.length;
        const currentSelection = inputRef.current?.selectionStart || 0;
        requestAnimationFrame(() => {
           if (inputRef.current) {
               inputRef.current.setSelectionRange(
                  Math.max(0, currentSelection - trimLen), 
                  Math.max(0, currentSelection - trimLen)
               );
           }
        });
     }
     
     setBaseIndex(newBaseIndex);
     setInputVal(finalVal);
     
     const newWordIndex = newBaseIndex + typed.length - 1;
     setCurrentWordIndex(newWordIndex);
     
     if (newWordIndex >= words.length && finalVal.endsWith(' ')) {
        finishTest();
     }
  };

  // --- Helpers ---
  const formatTime = (seconds: number) => {
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate live WPM
  const timeElapsed = (initialDurationMinutes * 60) - timeLeft;
  const liveWpm = timeElapsed > 0 ? Math.round((grossKeystrokes / 5) / (timeElapsed / 60)) : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto fade-in h-[calc(100vh-8rem)]">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between z-10">
         <button onClick={() => navigate('/test/setup')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ChevronLeft size={20} />
            <span>Abort Test</span>
         </button>
         
         <div className="flex items-center gap-4">
            {isTestActive && <button 
               onClick={finishTest}
               className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
               <BarChart2 size={16} />
               <span>Submit Test</span>
            </button>}
            <button 
               onClick={resetTest}
               className="text-sm font-bold text-slate-400 hover:text-blue-400 px-4 py-2 border border-slate-700/50 hover:border-blue-500/30 hover:bg-blue-500/10 rounded-xl transition-all"
            >
               Restart Test
            </button>
            <button 
               onClick={changeParagraph}
               title="Change standard paragraph"
               className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 transition-colors bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50"
            >
               <RefreshCw size={16} />
               <span className="text-sm font-semibold hidden sm:inline">Change Paragraph</span>
            </button>
         </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 z-10 shrink-0">
         <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center">
            <div className="text-slate-400 text-sm font-semibold flex items-center gap-1.5 mb-1"><BarChart2 size={16} className="text-blue-400"/> Gross WPM</div>
            <div className="text-2xl font-bold text-white font-mono">{liveWpm}</div>
         </div>
         <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center">
            <div className="text-slate-400 text-sm font-semibold flex items-center gap-1.5 mb-1"><Delete size={16} className="text-red-400"/> Delete Count</div>
            <div className="text-2xl font-bold text-white font-mono">{deleteCount}</div>
         </div>
         <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center">
            <div className="text-slate-400 text-sm font-semibold flex items-center gap-1.5 mb-1"><ArrowLeftSquare size={16} className="text-orange-400"/> Backspace</div>
            <div className="text-2xl font-bold text-white font-mono">{backspaceCount}</div>
         </div>
         <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg shadow-purple-900/20">
            <div className="text-purple-300 text-sm font-semibold flex items-center gap-1.5 mb-1"><Clock size={16} /> Time Left</div>
            <div className={`text-3xl font-bold font-mono ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
               {formatTime(timeLeft)}
            </div>
         </div>
      </div>

      {/* Paragraph Display Area (Scrollable) */}
      <div 
         className="flex-1 bg-slate-800/20 border border-slate-700/50 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col min-h-0"
      >
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
         
         <div 
            ref={paragraphContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar relative z-10 rounded-xl"
         >
            <div className="text-[28px] sm:text-[32px] leading-[1.6] font-medium tracking-wide text-slate-500 font-serif" style={{ wordSpacing: '0.2em' }}>
               {(() => {
                  // Next.js style virtualization bounds driven by scroll estimation
                  // Always ensure the active word typed is forced into the render bounds just in case of fast jump
                  const FORCED_AHEAD = 30;
                  const startIndex = Math.min(renderBounds.start, Math.max(0, currentWordIndex - 20));
                  const endIndex = Math.min(words.length, Math.max(renderBounds.end, currentWordIndex + FORCED_AHEAD));
                  
                  const activeTypedWords = inputVal.split(' ');

                  // We must render a few dummy span placeholders so the browser's scroll height doesn't collapse
                  const items = [];

                  // 1. Placeholder padding for stripped earlier DOM nodes
                  if (startIndex > 0) {
                      const hiddenBeforeWords = words.slice(0, startIndex);
                      items.push(
                         <span key="virtual-top" className="opacity-0 pointer-events-none select-none" style={{ userSelect: 'none' }}>
                            {hiddenBeforeWords.join(' ')} 
                         </span>
                      );
                  }

                  // 2. The actual visible DOM nodes (Slide window)
                  for (let globalIndex = startIndex; globalIndex < endIndex; globalIndex++) {
                     const word = words[globalIndex];
                     const isActive = globalIndex === currentWordIndex;
                     
                     let isCorrect = false;
                     let isWrong = false;
                     let typedWordForThis = '';
                     
                     if (globalIndex < baseIndex) {
                        isCorrect = wordStatusesRef.current ? wordStatusesRef.current[globalIndex] === 1 : false;
                        isWrong = wordStatusesRef.current ? wordStatusesRef.current[globalIndex] === 2 : false;
                     } else if (globalIndex < baseIndex + activeTypedWords.length) {
                        const slidingIndex = globalIndex - baseIndex;
                        typedWordForThis = activeTypedWords[slidingIndex];
                        if (!isActive) {
                           isCorrect = typedWordForThis === word;
                           isWrong = typedWordForThis !== word;
                        }
                     }

                     items.push(
                        <span key={globalIndex} ref={isActive ? activeWordRef : null}>
                           <WordSpan 
                              word={word}
                              isActive={isActive}
                              isCorrect={isCorrect}
                              isWrong={isWrong}
                              highlightEnabled={highlightEnabled}
                              typedWord={isActive ? typedWordForThis : ''}
                           />
                        </span>
                     );
                  }

                  // 3. Placeholder padding for stripped future DOM nodes
                  if (endIndex < words.length) {
                     const hiddenAfterWords = words.slice(endIndex);
                     items.push(
                        <span key="virtual-bottom" className="opacity-0 pointer-events-none select-none" style={{ userSelect: 'none' }}>
                           {' ' + hiddenAfterWords.join(' ')}
                        </span>
                     );
                  }

                  return items;
               })()}
            </div>
         </div>
      </div>

      {/* Control Area (Input & Options) */}
      <div className="shrink-0 flex flex-col gap-4 z-10">
         
         {/* Input Field */}
         <div className="relative">
            <input 
               ref={inputRef}
               type="text"
               value={inputVal}
               onChange={handleInputChange}
               onKeyDown={handleKeyDown}
               onPaste={(e) => e.preventDefault()}
               onDrop={(e) => e.preventDefault()}
               onContextMenu={(e) => e.preventDefault()}
               disabled={isTestFinished}
               placeholder={isTestActive ? "" : "Type the highlighted word to start..."}
               className={`w-full bg-slate-800 border-2 rounded-2xl px-6 py-5 pr-50 sm:py-6 text-2xl font-bold font-serif focus:outline-none transition-all ${
                  isTestFinished 
                     ? 'border-slate-700 text-slate-500 cursor-not-allowed opacity-50' 
                     : 'border-blue-500/50 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] text-white placeholder:text-slate-500 placeholder:font-sans placeholder:text-lg'
               }`}
               autoComplete="off"
               autoCorrect="off"
               autoCapitalize="off"
               spellCheck="false"
               autoFocus
            />
            {/* Typing Indicator pulse */}
            {isTestActive && !isTestFinished && (
               <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            )}
         </div>

         {/* Options Bar */}
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
            
            <div className="flex items-center gap-3">
               <span className="text-sm font-semibold text-slate-400">Right/Wrong Indicator:</span>
               <button 
                  onClick={() => setHighlightEnabled(!highlightEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${highlightEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
               >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${highlightEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
               </button>
            </div>

            <div className="flex items-center gap-3">
               <span className="text-sm font-semibold text-slate-400">Backspace:</span>
               <div className="bg-slate-900 rounded-lg p-1 flex">
                  {(['on', 'word', 'off'] as const).map((mode) => (
                     <button
                        key={mode}
                        onClick={() => setBackspaceMode(mode)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                           backspaceMode === mode 
                              ? 'bg-slate-700 text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                     >
                        {mode.toUpperCase()}
                     </button>
                  ))}
               </div>
            </div>

            

         </div>
      </div>
    </div>
  );
}
