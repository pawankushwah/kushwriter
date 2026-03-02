import { useState, useEffect, useMemo } from 'react';
import StatsBoard from '../components/StatsBoard';
import TypingArea from '../components/TypingArea';
import { useTyping } from '../hooks/useTyping';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Layout, Type, AlertTriangle, Star, RefreshCw, Trophy } from 'lucide-react';
import VirtualKeyboard from '../components/VirtualKeyboard';

const sampleTextsEnglish = [
  "The quick brown fox jumps over the lazy dog.",
  "Electron applications are built using modern web technologies.",
  "In computer science, a data structure is a data organization."
];

const sampleTextsHindiInscript = [
  "मेरा नाम कुशल है और मैं टाइपिंग सीख रहा हूँ।",
  "भारत एक विशाल देश है जहाँ कई भाषाएँ बोली जाती हैं।",
  "विज्ञान और तकनीक के क्षेत्र में हमने बहुत प्रगति की है।"
];

const sampleTextsHindiRemington = [
  "esjk uke dq'ky gS vkSj eSa VkbZfqax lh[k jgk gw¡A", // Transliterated/Kruti Dev representation example
  "Hkkjr ,d fo'kky ns'k gS tgk¡ dbZ Hkk\"kh,a cksyh tkrh gSaA",
  "foKku vkSj rduhd ds {ks= esa geus cgqr izxfr dh gSA"
];

function getRandomText(pathId?: string) {
  if (pathId === 'hindi-inscript') {
     return sampleTextsHindiInscript[Math.floor(Math.random() * sampleTextsHindiInscript.length)];
  } else if (pathId === 'hindi-remington') {
     return sampleTextsHindiRemington[Math.floor(Math.random() * sampleTextsHindiRemington.length)];
  }
  return sampleTextsEnglish[Math.floor(Math.random() * sampleTextsEnglish.length)];
}

export default function Practice() {
  const { pathId, levelId } = useParams();
  const [currentText, setCurrentText] = useState(getRandomText(pathId));
  const [viewMode, setViewMode] = useState<'overlay' | 'split'>('overlay');
  const [keyboardWarning, setKeyboardWarning] = useState(false);
  
  const { userInput, isActive, isFinished, stats, reset } = useTyping({
    textToType: currentText,
    timeLimit: 60
  });

  const targetChar = useMemo(() => {
     if (isFinished || userInput.length >= currentText.length) return undefined;
     return currentText[userInput.length];
  }, [userInput, currentText, isFinished]);

  const handleRestart = () => {
    setCurrentText(getRandomText(pathId));
    reset();
    setKeyboardWarning(false);
  };

  const calculateStars = () => {
     if (stats.accuracy >= 98 && stats.wpm > 40) return 5;
     if (stats.accuracy >= 95 && stats.wpm > 30) return 4;
     if (stats.accuracy >= 90 && stats.wpm > 20) return 3;
     if (stats.accuracy >= 80) return 2;
     return 1;
  };

  // Check for keyboard layout mismatches (e.g. typing English chars in Hindi mode)
  useEffect(() => {
    if (userInput.length > 0) {
      const lastChar = userInput[userInput.length - 1];
      const isEnglishChar = /^[a-zA-Z]$/.test(lastChar);
      const isHindiTarget = /[\u0900-\u097F]/.test(currentText);
      
      if (isHindiTarget && isEnglishChar && !keyboardWarning) {
         setKeyboardWarning(true);
      }
    }
  }, [userInput, currentText, keyboardWarning]);

  return (
    <div className="flex flex-col gap-6 w-full fade-in pb-12">
      <div className="flex items-center justify-between">
         <Link to={`/levels/${pathId || 'english'}`} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ChevronLeft size={20} />
            <span>Levels</span>
         </Link>
         <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            {levelId ? `Level ${levelId} Practice` : 'Practice Mode'}
         </h1>
      </div>

      {keyboardWarning && (
         <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-2xl flex items-start gap-3 fade-in shadow-lg">
            <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
               <h4 className="font-bold text-amber-400">Keyboard Layout Mismatch Detected</h4>
               <p className="text-sm mt-1">
                 It looks like you are trying to type Hindi text using an English keyboard layout. 
                 Browsers cannot change your OS keyboard automatically. Please switch your system keyboard layout (e.g., using Alt+Shift or Win+Space) to continue.
               </p>
            </div>
         </div>
      )}

      {/* View Mode Toggles */}
      {/* <div className="flex justify-center mb-2">
         <div className="bg-slate-800/80 p-1 rounded-xl flex gap-1 border border-slate-700/50 shadow-inner">
            <button 
               onClick={() => setViewMode('overlay')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'overlay' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
               <Type size={16} /> Direct Overlay
            </button>
            <button 
               onClick={() => setViewMode('split')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'split' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
               <Layout size={16} /> Split View
            </button>
         </div>
      </div> */}

      <div className="flex flex-col gap-8 w-full">
        
        {/* Top Stats Board */}
        {/* <StatsBoard stats={stats} /> */}

        {/* Main Area */}
        {isFinished ? (
           <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-10 rounded-4xl shadow-2xl flex flex-col items-center justify-center min-h-[400px] fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />
              
              <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-6 shadow-lg border border-slate-600/50 z-10">
                 <Trophy size={36} className="text-yellow-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2 z-10">Test Complete!</h2>
              <p className="text-slate-400 mb-8 z-10">Great job. Here's how you did:</p>
              
              <div className="flex gap-2 mb-10 z-10">
                 {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                       key={star} 
                       size={36} 
                       className={`transition-all duration-500 transform ${star <= calculateStars() ? 'fill-yellow-400 text-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'text-slate-600'}`} 
                       style={{ transitionDelay: `${star * 100}ms` }}
                    />
                 ))}
              </div>

              <div className="flex gap-4 z-10">
                 <button 
                  onClick={handleRestart}
                  className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl flex items-center gap-2 transition-all"
                 >
                   <RefreshCw size={18} />
                   Retry
                 </button>
                 <Link 
                  to="/levels"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20"
                 >
                   Next Level
                 </Link>
              </div>
           </div>
        ) : (
           <>
              {/* Typing Area based on View Mode */}
              {viewMode === 'overlay' ? (
                 <TypingArea 
                   originalText={currentText}
                   userInput={userInput}
                   isActive={isActive}
                   isFinished={isFinished}
                 />
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
                    {/* Original Text Card */}
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl shadow-lg relative min-h-[300px]">
                       <div className="absolute top-4 left-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Text to Type</div>
                       <div className="text-2xl leading-relaxed text-slate-300 mt-6 font-serif">
                         {currentText}
                       </div>
                    </div>
                    
                    {/* Typing Input Card */}
                    <div className="bg-slate-800/60 backdrop-blur-md border border-blue-500/30 p-8 rounded-3xl shadow-xl shadow-blue-900/10 relative min-h-[300px] flex flex-col items-center justify-center">
                       <div className="absolute top-4 left-6 text-xs font-bold text-blue-400 uppercase tracking-wider">Your Input</div>
                       <TypingArea 
                         originalText={currentText}
                         userInput={userInput}
                         isActive={isActive}
                         isFinished={isFinished}
                         inSplitMode={true}
                       />
                    </div>
                 </div>
              )}

              {/* Virtual Keyboard */}
              <div className="w-full mt-4">
                 <VirtualKeyboard targetChar={targetChar} layout={pathId} />
              </div>

              {/* Action Controls Section */}
              <div className="flex justify-center mt-8">
                <button 
                  onClick={handleRestart}
                  className="group relative px-8 py-3 bg-slate-800 text-white font-medium rounded-full overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 border border-slate-700/50"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    Restart Test
                  </span>
                </button>
              </div>
           </>
        )}

      </div>
    </div>
  );
}
