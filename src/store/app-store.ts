import { create } from 'zustand';

export type ViewType = 'landing' | 'login' | 'register' | 'dashboard' | 'calculator' | 'optimizer' | 'documents' | 'guide' | 'reports' | 'audit' | 'settings';

interface AppState {
  view: ViewType;
  user: { id: string; email: string; name: string; role: string } | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  isLoading: boolean;
  
  setView: (view: ViewType) => void;
  setUser: (user: any) => void;
  setAuthenticated: (val: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (val: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'landing' as ViewType,
  user: null,
  isAuthenticated: false,
  sidebarOpen: true,
  isLoading: false,
  
  setView: (view) => set({ view }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setLoading: (val) => set({ isLoading: val }),
  logout: () => {
    document.cookie = 'session=; max-age=0; path=/';
    set({ user: null, isAuthenticated: false, view: 'login' });
  },
}));
