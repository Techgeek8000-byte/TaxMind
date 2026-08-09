import { create } from 'zustand'

export type AppView =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'calculator'
  | 'scanner'
  | 'reports'
  | 'guides'
  | 'audit-log'
  | 'guide-detail'
  | 'savings-score'
  | 'presumptive-tax'
  | 'wealth-statement'
  | 'tax-calendar'
  | 'ai-chat'
  | 'iris-export'
  | 'wht-calculator'
  | 'capital-gains'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface AppState {
  view: AppView
  user: User | null
  loading: boolean
  isLoading: boolean
  selectedGuideSlug: string | null
  sidebarOpen: boolean
  setView: (view: AppView) => void
  setUser: (user: User | null) => void
  setLoading: (l: boolean) => void
  setSelectedGuide: (slug: string) => void
  toggleSidebar: () => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'landing',
  user: null,
  loading: true,
  isLoading: false,
  selectedGuideSlug: null,
  sidebarOpen: true,
  setView: (view) => set({ view }),
  setUser: (user) => set({ user, loading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedGuide: (slug) => set({ selectedGuideSlug: slug, view: 'guide-detail' }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  logout: () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    set({ user: null, view: 'landing' })
  },
}))
