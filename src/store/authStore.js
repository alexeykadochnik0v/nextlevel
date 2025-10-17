import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            loading: true,

            setUser: (user) => set({ user, loading: false }),

            logout: () => set({ user: null }),

            updateProfile: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            }))
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user })
        }
    )
)

export default useAuthStore

