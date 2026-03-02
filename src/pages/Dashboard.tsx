import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { LogOut, Play, BookOpen, Clock, Activity, BarChart2, DownloadCloud } from 'lucide-react';

export default function Dashboard() {
  const currentUser = useAppStore(state => state.currentUser);
  const logout = useAppStore(state => state.logout);
  const navigate = useNavigate();
  
  // Auto-updater state
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
     if (window.electronAPI && window.electronAPI.onUpdaterEvent) {
        window.electronAPI.onUpdaterEvent((message, data) => {
           if (message === 'update-downloaded') {
              setUpdateAvailable(true);
           }
        });
     }
  }, []);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  if (!currentUser) return null;
  return (
    <div className="flex flex-col gap-8 w-full fade-in relative">
      
      {/* Auto Updater Banner */}
      {updateAvailable && (
         <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-emerald-400/50 relative overflow-hidden z-50">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10 text-white">
               <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <DownloadCloud size={24} className="text-white animate-bounce" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Update Ready to Install</h3>
                  <p className="text-emerald-50 text-sm">A new version of KushWriter has been downloaded in the background.</p>
               </div>
            </div>
            
            <button 
               onClick={() => window.electronAPI.quitAndInstall()}
               className="w-full sm:w-auto px-6 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl shadow-md transition-all relative z-10 flex items-center justify-center gap-2 whitespace-nowrap"
            >
               Restart & Update Now
            </button>
         </div>
      )}

      {/* Header Profile Section */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex items-center gap-6 z-10 w-full sm:w-auto">
          <div className="relative">
             <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {currentUser.name.charAt(0).toUpperCase()}
             </div>
             <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1.5">
               <div className="w-3 h-3 bg-emerald-500 rounded-full" />
             </div>
          </div>
          <div className="flex flex-col flex-1 sm:flex-auto">
            <h1 className="text-3xl font-bold text-white mb-1">Hello, {currentUser.name}!</h1>
            <p className="text-slate-400">Ready to improve your typing speed?</p>
          </div>
        </div>
        <div className="flex w-full sm:w-auto gap-4 z-10">
          <button 
             onClick={() => navigate('/progress')}
             className="flex-1 sm:flex-auto px-4 py-2 flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
             <BarChart2 size={18} />
             View Progress
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 sm:flex-auto px-4 py-2 flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
      {/* Second Row: Continue Learning & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
         {/* Continue Learning right below Profile Card */}
         <div className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl p-6 shadow-lg relative overflow-hidden group w-full h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 pointer-events-none z-0" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10 w-full">
               <div>
                  <h3 className="text-xl font-bold text-white mb-2">Continue Learning</h3>
                  <p className="text-blue-100 text-sm">Resume your English Touch Typing journey from Level 4.</p>
               </div>
               <Link 
                  to="/practice/english/4"
                  className="w-full sm:w-auto px-8 py-3 bg-white text-blue-900 hover:bg-slate-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl shrink-0"
               >
                  <Play size={18} className="fill-blue-900" />
                  Play Now
               </Link>
            </div>
         </div>

         {/* Quick Stats Card */}
         <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 flex items-center justify-around shadow-xl relative overflow-hidden h-full">
            <div className="text-center">
               <div className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">Avg Speed</div>
               <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  45 <span className="text-lg text-emerald-500 font-bold">WPM</span>
               </div>
            </div>
            <div className="w-px h-16 bg-slate-700/50" />
            <div className="text-center">
               <div className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">Avg Accuracy</div>
               <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  96<span className="text-lg text-blue-500 font-bold">%</span>
               </div>
            </div>
         </div>
      </div>

      {/* Typing Test Section */}
      <div>
         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-purple-400" />
            Typing Tests
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <TestCard 
               title="English"
               desc="Master the standard QWERTY layout."
               gradient="from-blue-500 to-cyan-500"
               hoverGradient="hover:from-blue-600 hover:to-blue-500"
               shadowClass="hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
               icon="A"
               testType="english"
               navigate={navigate}
            />
            <TestCard 
               title="Hindi (Inscript)"
               desc="Standard government approved Hindi layout."
               gradient="from-orange-500 to-red-500"
               hoverGradient="hover:from-orange-600 hover:to-red-600"
               shadowClass="hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]"
               icon="अ"
               testType="hindi-inscript"
               navigate={navigate}
            />
            <TestCard 
               title="Hindi (Remington)"
               desc="Kruti Dev based Remington Gail layout."
               gradient="from-purple-500 to-pink-500"
               hoverGradient="hover:from-purple-600 hover:to-purple-500"
               shadowClass="hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
               icon="क"
               testType="hindi-remington"
               navigate={navigate}
            />

         </div>
      </div>
      {/* Learning Paths */}
      <div>
         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="text-blue-400" />
            Learning Paths
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PathCard 
               title="English Typing"
               desc="Master the standard QWERTY layout."
               progress={45}
               color="from-blue-500 to-cyan-500"
               icon="A"
               pathId="english"
            />
            <PathCard 
               title="Hindi (Inscript)"
               desc="Standard government approved Hindi layout."
               progress={10}
               color="from-orange-500 to-red-500"
               icon="अ"
               pathId="hindi-inscript"
            />
            <PathCard 
               title="Hindi (Remington)"
               desc="Kruti Dev based Remington Gail layout."
               progress={0}
               color="from-purple-500 to-pink-500"
               icon="क"
               pathId="hindi-remington"
            />
         </div>
      </div>
    </div>
  );
}
function PathCard({ title, desc, progress, color, icon, pathId }: any) {
   return (
      <Link to={`/levels/${pathId}`} className="block bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800 transition-colors group cursor-pointer relative overflow-hidden flex flex-col h-full">
         <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${color} pointer-events-none z-0`} />
         
         <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl font-bold font-serif shadow-lg`}>
               {icon}
            </div>
         </div>
         
         <h3 className="text-lg font-bold text-slate-100 mb-2 relative z-10">{title}</h3>
         <p className="text-slate-400 text-sm mb-6 flex-1 relative z-10">{desc}</p>
         
         <div className="relative z-10">
            <div className="flex justify-between text-xs font-medium mb-2">
               <span className="text-slate-400">Progress</span>
               <span className="text-slate-200">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
               <div 
                  className={`h-full bg-gradient-to-r ${color} rounded-full`}
                  style={{ width: `${progress}%` }}
               />
            </div>
         </div>
      </Link>
   );
}


function TestCard({ title, desc, gradient, hoverGradient, shadowClass, icon, testType, navigate }: any) {
   return (
      <div className={`bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 flex flex-col relative overflow-hidden flex-1 group hover:border-slate-500/50 hover:bg-slate-800/80 transition-all duration-300 ${shadowClass} hover:-translate-y-1`}>
         <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-[1.8] group-hover:opacity-30`} />
         <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
               <span className="text-white text-xl font-bold font-serif">{icon}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300">
               <Activity size={12} className="group-hover:animate-pulse text-emerald-400" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Typing Test</span>
            </div>
         </div>
         <h3 className="text-xl font-bold text-white mb-2 relative z-10 transition-colors">{title}</h3>
         <p className="text-slate-400 text-sm mb-6 flex-1 relative z-10 group-hover:text-slate-300 transition-colors">{desc}</p>
         <button 
            onClick={() => navigate('/test/setup', { state: { language: testType } })}
            className={`w-full py-3.5 bg-slate-700/40 hover:bg-gradient-to-r ${hoverGradient} text-white font-bold rounded-xl transition-all duration-300 border border-slate-600 hover:border-transparent relative z-10 shadow-sm flex items-center justify-center gap-2`}
         >
            <Play size={16} className="fill-current" />
            Setup Test
         </button>
      </div>
   );
}
