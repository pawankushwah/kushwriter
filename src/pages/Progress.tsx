import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, ChevronLeft, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { day: 'Mon', wpm: 35, accuracy: 92 },
  { day: 'Tue', wpm: 40, accuracy: 94 },
  { day: 'Wed', wpm: 38, accuracy: 95 },
  { day: 'Thu', wpm: 45, accuracy: 96 },
  { day: 'Fri', wpm: 48, accuracy: 97 },
  { day: 'Sat', wpm: 52, accuracy: 96 },
  { day: 'Sun', wpm: 55, accuracy: 98 },
];

export default function Progress() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 w-full fade-in pb-12">
      <div className="flex items-center justify-between">
         <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
         </button>
         <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Your Progress
         </h1>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Chart Section */}
         <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="text-emerald-400" />
                  Performance Over Time
               </h2>
               <div className="flex gap-2 text-sm">
                  <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> WPM
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium ml-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Accuracy %
                  </span>
               </div>
            </div>
            
            <div className="flex-1 w-full min-h-[250px] lg:min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{fontSize: 12}} fill="#94a3b8" />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                     itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="wpm" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWpm)" />
                  <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Side Stats */}
         <div className="flex flex-col gap-6">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 flex-1 flex flex-col justify-center">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <Award className="text-amber-400" />
                 Recent Milestones
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-slate-300 text-sm">Highest WPM</span>
                     <span className="text-blue-400 font-bold">55</span>
                  </div>
                  <div className="h-px w-full bg-slate-700/50" />
                  <div className="flex items-center justify-between">
                     <span className="text-slate-300 text-sm">Avg Accuracy</span>
                     <span className="text-emerald-400 font-bold">95.4%</span>
                  </div>
                   <div className="h-px w-full bg-slate-700/50" />
                  <div className="flex items-center justify-between">
                     <span className="text-slate-300 text-sm">Time Spent</span>
                     <span className="text-purple-400 font-bold flex items-center gap-1">
                        <Clock size={14} /> 2.5 hrs
                     </span>
                  </div>
               </div>
            </div>
         </div>
       </div>
    </div>
  );
}
