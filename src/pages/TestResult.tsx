import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Award, Zap, AlertTriangle, Clock, Hash, MousePointerClick } from 'lucide-react';

interface TestStats {
   timeElapsed: number; // in seconds
   totalTime: number; // in seconds
   grossKeystrokes: number;
   deleteCount: number;
   backspaceCount: number;
   correctWordCount: number;
   wrongWordCount: number;
   totalWordsEncountered: number;
}

export default function TestResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { stats: TestStats } | null;

  if (!state || !state.stats) {
     return <Navigate to="/dashboard" replace />;
  }

  const { stats } = state;
  const timeElapsedMinutes = stats.timeElapsed / 60;

  // --- Calculations ---
  
  // Formula 1: Standard Method (5 chars = 1 word)
  // Standard Net WPM = (Gross Keystrokes / 5) - Uncorrected Errors / Time in Min
  // For simplicity since we track word-level right/wrong, we'll estimate standard errors based on wrong words * 5
  const standardGrossWpm = timeElapsedMinutes > 0 ? (stats.grossKeystrokes / 5) / timeElapsedMinutes : 0;
  // Let's assume average word length is 5 for the penalty
  const standardNetWpm = Math.max(0, Math.round(standardGrossWpm - (stats.wrongWordCount / timeElapsedMinutes)));
  const standardAccuracy = stats.grossKeystrokes > 0 ? Math.max(0, Math.round(((stats.grossKeystrokes/5) - stats.wrongWordCount) / (stats.grossKeystrokes/5) * 100)) : 0;

  // Formula 2: Space-Separated Method (Actual words typed)
  // Actual words typed correctly / Time in Min
  const actualNetWpm = timeElapsedMinutes > 0 ? Math.round(stats.correctWordCount / timeElapsedMinutes) : 0;
  const actualAccuracy = stats.totalWordsEncountered > 0 ? Math.round((stats.correctWordCount / stats.totalWordsEncountered) * 100) : 0;

  // Formatting helpers
  const formatTime = (seconds: number) => {
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto fade-in pb-12">
      <div className="flex items-center justify-between">
         <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
         </button>
         <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
            Test Results
         </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Top Level Summary Cards */}
         <div className="bg-gradient-to-br from-emerald-900/40 to-blue-900/40 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <Award size={64} className="text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            <h2 className="text-4xl font-black text-white mb-2">{standardNetWpm} <span className="text-xl text-emerald-400/80 font-bold">WPM</span></h2>
            <div className="text-slate-300 font-medium mb-8 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
                Standard Net Speed
            </div>

            <div className="grid grid-cols-2 gap-8 w-full">
               <div className="flex flex-col items-center text-center">
                  <span className="text-slate-400 text-sm font-semibold mb-1">Standard Accuracy</span>
                  <span className="text-2xl font-bold text-white">{standardAccuracy}%</span>
               </div>
               <div className="flex flex-col items-center text-center">
                  <span className="text-slate-400 text-sm font-semibold mb-1">Duration</span>
                  <span className="text-2xl font-bold text-white">{formatTime(stats.timeElapsed)}</span>
               </div>
            </div>
         </div>

         {/* Secondary Formula Card */}
         <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 flex flex-col justify-center shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
               <Zap className="text-blue-400" />
               Actual Words Metric
            </h3>
            <p className="text-sm text-slate-400 mb-6">
               This metric calculates WPM based strictly on space-separated words rather than the standard 5-character average.
            </p>
            
            <div className="grid grid-cols-2 gap-6 bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
               <div>
                  <div className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Net Speed</div>
                  <div className="text-3xl font-bold text-blue-400">{actualNetWpm} <span className="text-base text-slate-500">WPM</span></div>
               </div>
               <div>
                  <div className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Accuracy</div>
                  <div className="text-3xl font-bold text-emerald-400">{actualAccuracy}%</div>
               </div>
            </div>
         </div>

      </div>

      {/* Detailed Analysis */}
      <div>
         <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Hash className="text-purple-400" />
            Detailed Analysis
         </h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <StatBox 
               title="Total Keystrokes" 
               val={stats.grossKeystrokes} 
               icon={<MousePointerClick size={16} className="text-blue-400" />} 
               desc="Total keys pressed"
            />
            <StatBox 
               title="Correct Words" 
               val={stats.correctWordCount} 
               icon={<Award size={16} className="text-emerald-400" />} 
               desc="Typed perfectly"
            />
            <StatBox 
               title="Wrong Words" 
               val={stats.wrongWordCount} 
               icon={<AlertTriangle size={16} className="text-red-400" />} 
               desc="Typed with errors"
            />
            <StatBox 
               title="Backspace Mvmt" 
               val={stats.backspaceCount} 
               icon={<RotateCcw size={16} className="text-orange-400" />} 
               desc="Backspaces used"
            />
            
         </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center mt-6">
         <button 
            onClick={() => navigate('/test/setup')}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-600 shadow-lg hover:shadow-xl"
         >
            <RotateCcw size={18} />
            Test Again
         </button>
      </div>

    </div>
  );
}

function StatBox({ title, val, icon, desc }: any) {
   return (
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between">
         <div className="flex items-center gap-2 mb-3">
            {icon}
            <span className="text-sm font-semibold text-slate-300">{title}</span>
         </div>
         <div className="text-2xl font-bold text-white mb-1">{val.toLocaleString()}</div>
         <div className="text-xs text-slate-500">{desc}</div>
      </div>
   );
}
