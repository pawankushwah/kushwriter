import React from 'react';
import { Minus, Square, X } from 'lucide-react';
export default function TitleBar() {
  const isElectron = window.electronAPI !== undefined;
  const handleMinimize = () => {
    if (isElectron) window.electronAPI.minimize();
  };
  const handleMaximize = () => {
    if (isElectron) window.electronAPI.toggleMaximize();
  };
  const handleClose = () => {
    if (isElectron) window.electronAPI.close();
  };
  return (
    <div className="h-8 w-full bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none shadow-sm z-50 fixed top-0 left-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      
      {/* App Icon and Title */}
      <div className="flex items-center pl-3 gap-2">
        <img src="logo.png" className="w-5 h-5 rounded-md" alt="KushWriter Logo" />
        <span className="text-xs font-semibold text-slate-300 tracking-wide">KushWriter Touch Typing</span>
      </div>
      {/* Window Controls (Only visible in Electron) */}
      {isElectron && (
        <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button 
            onClick={handleMinimize}
            className="px-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors h-full flex items-center justify-center focus:outline-none"
            title="Minimize"
          >
            <Minus size={16} />
          </button>
          
          <button 
            onClick={handleMaximize}
            className="px-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors h-full flex items-center justify-center focus:outline-none"
            title="Maximize"
          >
            <Square size={13} />
          </button>
          
          <button 
            onClick={handleClose}
            className="px-4 hover:bg-red-500 text-slate-400 hover:text-white transition-colors h-full flex items-center justify-center focus:outline-none"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}