// Simplified layout definition for US QWERTY
const QWERTY_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'RShift'],
  ['Space']
];

// Map characters to finger colors
const FINGER_COLORS: Record<string, string> = {
  // Left Pinky
  '`': 'bg-pink-500/30', '1': 'bg-pink-500/30', 'q': 'bg-pink-500/30', 'a': 'bg-pink-500/30', 'z': 'bg-pink-500/30',
  // Left Ring
  '2': 'bg-purple-500/30', 'w': 'bg-purple-500/30', 's': 'bg-purple-500/30', 'x': 'bg-purple-500/30',
  // Left Middle
  '3': 'bg-blue-500/30', 'e': 'bg-blue-500/30', 'd': 'bg-blue-500/30', 'c': 'bg-blue-500/30',
  // Left Index
  '4': 'bg-cyan-500/30', '5': 'bg-cyan-500/30', 'r': 'bg-cyan-500/30', 't': 'bg-cyan-500/30', 'f': 'bg-cyan-500/30', 'g': 'bg-cyan-500/30', 'v': 'bg-cyan-500/30', 'b': 'bg-cyan-500/30',
  // Right Index
  '6': 'bg-emerald-500/30', '7': 'bg-emerald-500/30', 'y': 'bg-emerald-500/30', 'u': 'bg-emerald-500/30', 'h': 'bg-emerald-500/30', 'j': 'bg-emerald-500/30', 'n': 'bg-emerald-500/30', 'm': 'bg-emerald-500/30',
  // Right Middle
  '8': 'bg-yellow-500/30', 'i': 'bg-yellow-500/30', 'k': 'bg-yellow-500/30', ',': 'bg-yellow-500/30',
  // Right Ring
  '9': 'bg-orange-500/30', 'o': 'bg-orange-500/30', 'l': 'bg-orange-500/30', '.': 'bg-orange-500/30',
  // Right Pinky
  '0': 'bg-red-500/30', '-': 'bg-red-500/30', '=': 'bg-red-500/30', 'p': 'bg-red-500/30', '[': 'bg-red-500/30', ']': 'bg-red-500/30', '\\': 'bg-red-500/30', ';': 'bg-red-500/30', "'": 'bg-red-500/30', '/': 'bg-red-500/30',
  // Thumbs
  'Space': 'bg-slate-500/30'
};

interface VirtualKeyboardProps {
  targetChar?: string;
  layout?: 'english' | 'hindi-inscript' | 'hindi-remington' | string;
}

export default function VirtualKeyboard({ targetChar }: VirtualKeyboardProps) {
  // Map exact target character or convert space
  let activeChar = targetChar;
  if (targetChar === ' ') activeChar = 'Space';
  else if (targetChar) activeChar = targetChar.toLowerCase();

  const renderKey = (keyLabel: string) => {
    const isSpecial = ['Backspace', 'Tab', 'Caps', 'Enter', 'Shift', 'RShift', 'Space'].includes(keyLabel);
    
    // The shift logic is incomplete but functional for demonstration, it triggers full scale on the whole component basically
    
    const isExactActive = activeChar === keyLabel;
    
    const baseColor = FINGER_COLORS[keyLabel] || 'bg-slate-800/50';

    let widthClass = 'w-10 sm:w-12 h-10 sm:h-12';
    if (keyLabel === 'Backspace' || keyLabel === 'Enter') widthClass = 'w-20 sm:w-24 h-10 sm:h-12';
    if (keyLabel === 'Shift' || keyLabel === 'RShift') widthClass = 'w-24 sm:w-28 h-10 sm:h-12';
    if (keyLabel === 'Caps') widthClass = 'w-20 sm:w-24 h-10 sm:h-12';
    if (keyLabel === 'Tab') widthClass = 'w-16 sm:w-20 h-10 sm:h-12';
    if (keyLabel === 'Space') widthClass = 'w-64 sm:w-[500px] h-10 sm:h-12';

    return (
      <div 
        key={keyLabel}
        className={`flex items-center justify-center rounded-lg border border-slate-700/50 text-sm font-medium transition-all duration-200 shadow-sm
          ${widthClass}
          ${baseColor}
          ${isExactActive ? 'ring-2 ring-emerald-400 bg-emerald-500/80 shadow-[0_0_20px_rgba(52,211,153,0.6)] scale-110 z-10 text-white' : 'text-slate-300'}
        `}
      >
        {!isSpecial ? keyLabel.toUpperCase() : keyLabel.replace('RShift', 'Shift')}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-8 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-4xl w-full max-w-5xl mx-auto shadow-2xl items-center mt-4">
       {/* Keyboard Layout */}
       <div className="flex flex-col gap-2 w-full items-center">
         {QWERTY_ROWS.map((row, i) => (
            <div key={i} className={`flex gap-2 justify-center`}>
               {row.map(renderKey)}
            </div>
         ))}
       </div>
       
       {/* Legend */}
       <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/50 p-3 px-6 rounded-full border border-slate-700/30">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" /> Pinky</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" /> Ring</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> Middle</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" /> Index (L)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Index (R)</div>
       </div>
    </div>
  );
}
