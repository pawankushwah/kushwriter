import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Keyboard, User, Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const users = useAppStore(state => state.users);
  const login = useAppStore(state => state.login);
  const addUser = useAppStore(state => state.addUser);
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(users.length === 0);
  const [newUsername, setNewUsername] = useState('');

  const handleLogin = (userId: string) => {
    login(userId);
    navigate('/dashboard');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      addUser({ name: newUsername.trim(), avatarId: 'default' });
      setNewUsername('');
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto fade-in">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)] transform rotate-3">
          <Keyboard size={40} className="text-white -rotate-3" />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">KushWriter</h1>
        <p className="text-slate-400">Master touch typing in English and Hindi.</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 w-full shadow-xl">
        {!isCreating && users.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="text-blue-400" size={20} />
              Select Profile
            </h2>
            <div className="space-y-3 mb-6">
               {users.map(user => (
                  <button 
                    key={user.id}
                    onClick={() => handleLogin(user.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-800 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all text-left group"
                  >
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                        {user.name.charAt(0).toUpperCase()}
                     </div>
                     <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{user.name}</span>
                  </button>
               ))}
            </div>
            
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-white border border-slate-700 border-dashed rounded-2xl hover:bg-slate-800/50 transition-colors"
            >
              <Plus size={18} />
              Create New Profile
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-6">Create Profile</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Your Name</label>
                <input 
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={!newUsername.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-500/20"
              >
                Start Learning
              </button>
              
              {users.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="w-full py-3 text-slate-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
