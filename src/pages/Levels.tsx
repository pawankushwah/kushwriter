import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Star, Lock, Play } from 'lucide-react';

const englishLevels = [
  { id: 1, title: 'Home Row Basics', description: 'Learn the f, j, d, k keys.', isUnlocked: true, stars: 3 },
  { id: 2, title: 'Home Row Extended', description: 'Learn a, s, l, ; keys.', isUnlocked: true, stars: 2 },
  { id: 3, title: 'Top Row Intros', description: 'Reach up: e, i, r, u.', isUnlocked: true, stars: 0 },
  { id: 4, title: 'Bottom Row Intros', description: 'Reach down: c, m, v, ,.', isUnlocked: true, stars: 0 },
  { id: 5, title: 'Number Row', description: 'Typing digits 1 through 0.', isUnlocked: false, stars: 0 },
];

const hindiInscriptLevels = [
  { id: 1, title: 'Home Row (Inscript)', description: 'Learn matras and basic consonants.', isUnlocked: true, stars: 0 },
  { id: 2, title: 'Top Row (Inscript)', description: 'More vowels and consonants.', isUnlocked: false, stars: 0 },
];

const hindiRemingtonLevels = [
  { id: 1, title: 'Home Row (Remington)', description: 'Kruti Dev / Remington basic keys.', isUnlocked: true, stars: 0 },
  { id: 2, title: 'Shift Modifiers', description: 'Using Shift for half-letters.', isUnlocked: false, stars: 0 },
];

export default function Levels() {
  const navigate = useNavigate();
  const { pathId } = useParams();

  let levelsData = englishLevels;
  let pathTitle = "English Typing";

  if (pathId === 'hindi-inscript') {
     levelsData = hindiInscriptLevels;
     pathTitle = "Hindi (Inscript)";
  } else if (pathId === 'hindi-remington') {
     levelsData = hindiRemingtonLevels;
     pathTitle = "Hindi (Remington)";
  }

  return (
    <div className="flex flex-col gap-8 w-full fade-in">
      <div className="flex items-center justify-between">
         <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
         </button>
         <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            {pathTitle} Levels
         </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {levelsData.map((level) => (
          <div 
            key={level.id}
            className={`relative overflow-hidden rounded-3xl border ${level.isUnlocked ? 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800 cursor-pointer group' : 'border-slate-800/50 bg-slate-900/50 opacity-70'} p-6 transition-all duration-300`}
            onClick={() => level.isUnlocked && navigate(`/practice/${pathId || 'english'}/${level.id}`)}
          >
             {/* Decorative Background for Unlocked Items */}
             {level.isUnlocked && (
               <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors" />
             )}
             <div className="flex justify-between items-start mb-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${level.isUnlocked ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                 {level.id}
               </div>
               {level.isUnlocked ? (
                 <div className="flex gap-1">
                   {[1, 2, 3].map((star) => (
                     <Star 
                       key={star} 
                       size={14} 
                       className={star <= level.stars ? "fill-amber-400 text-amber-400" : "text-slate-600"} 
                     />
                   ))}
                 </div>
               ) : (
                 <Lock size={18} className="text-slate-500" />
               )}
             </div>
             <h3 className={`text-lg font-bold mb-2 ${level.isUnlocked ? 'text-white' : 'text-slate-500'}`}>
               {level.title}
             </h3>
             
             <p className="text-sm text-slate-400 mb-6">
               {level.description}
             </p>
             {level.isUnlocked && (
               <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                 <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                   <Play size={14} className="fill-white translate-x-0.5" />
                 </div>
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}