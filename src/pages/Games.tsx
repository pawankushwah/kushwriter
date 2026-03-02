import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Gamepad2, Car, Bot } from 'lucide-react';
export default function Games() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-8 w-full fade-in pb-12">
      <div className="flex items-center justify-between">
         <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
         </button>
         <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Typing Games
         </h1>
      </div>
      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-12 rounded-4xl shadow-2xl flex flex-col items-center justify-center min-h-[500px] text-center relative overflow-hidden">
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />
         
         <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-8 shadow-xl shadow-purple-900/40 z-10 animate-bounce">
            <Gamepad2 size={48} className="text-white" />
         </div>
         <h2 className="text-4xl font-bold text-white mb-4 z-10">Coming Soon!</h2>
         <p className="text-slate-400 max-w-lg mb-12 z-10 text-lg">
           Get ready to test your typing limit. Games like Typing Racing and Monkey Typer are currently in development.
         </p>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl z-10">
            <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl flex flex-col items-center gap-4 opacity-70 grayscale">
               <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <Car size={32} className="text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-300">Type Racer</h3>
               <p className="text-sm text-slate-500">Race against others by typing fast.</p>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl flex flex-col items-center gap-4 opacity-70 grayscale">
               <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <Bot size={32} className="text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-300">Monkey Typer</h3>
               <p className="text-sm text-slate-500">Defeat the falling words.</p>
            </div>
         </div>
      </div>
    </div>
  );
}