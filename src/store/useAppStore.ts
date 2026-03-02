import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export interface UserProfile {
  id: string;
  name: string;
  avatarId: string; // ID for predefined avatars or data URL
}
interface AppState {
  currentUser: UserProfile | null;
  users: UserProfile[];
  login: (userId: string) => void;
  logout: () => void;
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  removeUser: (userId: string) => void;
}
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      users: [],
      login: (userId) => 
        set((state) => ({ 
          currentUser: state.users.find(u => u.id === userId) || null 
        })),
      logout: () => set({ currentUser: null }),
      addUser: (user) => 
        set((state) => {
          const newUser = { ...user, id: crypto.randomUUID() };
          return {
            users: [...state.users, newUser],
            currentUser: newUser // Auto-login on creation
          };
        }),
      removeUser: (userId) =>
        set((state) => ({
          users: state.users.filter(u => u.id !== userId),
          currentUser: state.currentUser?.id === userId ? null : state.currentUser
        })),
    }),
    {
      name: 'kushwriter-storage', // key in local storage
    }
  )
);