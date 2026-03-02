import { Outlet } from 'react-router-dom';
import TitleBar from '../components/TitleBar';
export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-slate-50 relative">
      <TitleBar />
      
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none z-0" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/2 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none z-0" />
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto mt-8 relative z-10 pt-6 px-6 sm:px-12 pb-12 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col gap-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}