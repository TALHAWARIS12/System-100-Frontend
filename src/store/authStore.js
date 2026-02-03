import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          // Save token to localStorage AND Zustand state
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({ user, token, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          
          // Save token to localStorage AND Zustand state
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({ user, token, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        // First check localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        // If user is in localStorage, use it immediately
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ user, token, isAuthenticated: true });
          } catch (e) {
            console.error('Failed to parse stored user');
          }
        }

        // Then verify with backend
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user, isAuthenticated: true });
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      hasRole: (roles) => {
        const state = useAuthStore.getState();
        if (!state.user) return false;
        return roles.includes(state.user.role);
      },

      hasActiveSubscription: () => {
        const state = useAuthStore.getState();
        if (!state.user) return false;
        return (
          state.user.role === 'admin' ||
          state.user.role === 'educator' ||
          state.user.subscriptionStatus === 'active'
        );
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
