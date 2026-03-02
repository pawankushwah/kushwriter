import type { TypingStats } from '../hooks/useTyping';

export default function StatsBoard({ stats }: { stats: TypingStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto rounded-3xl p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
      <StatBox label="WPM" value={stats.wpm} highlight className="text-emerald-400" />
      <StatBox label="Accuracy" value={`${stats.accuracy}%`} className="text-blue-400" />
      <StatBox label="Errors" value={stats.errors} className="text-rose-400" />
      <StatBox label="Time" value={`${stats.timeRemaining}s`} className="text-purple-400" />
    </div>
  );
}

function StatBox({ label, value, highlight, className }: { label: string, value: string | number, highlight?: boolean, className?: string }) {
  return (
    <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${highlight ? 'bg-slate-700/50 transform scale-105 shadow-lg relative overflow-hidden' : ''}`}>
      {highlight && <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none" />}
      <span className="text-sm uppercase tracking-widest text-slate-400 mb-1 font-medium">{label}</span>
      <span className={`text-4xl lg:text-5xl font-bold tracking-tight ${className}`}>{value}</span>
    </div>
  );
}
