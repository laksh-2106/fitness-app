import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity } from './models/Activity';
import type { User } from './models/User';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  liveActivity: Activity | null;
  oldActivites: Activity[];
  topActivity: Activity | null;
  lastFourDaysSteps: number[];
  loading: 'idle' | 'pending' | 'success' | null;
  error: string | null;

  signup: (name: string, email: string, password: string) => { error?: string };
  login: (email: string, password: string) => { error?: string };
  logout: () => void;
  setUserData: (data: Partial<User>) => void;
  completeOnboarding: (data: Partial<User>) => void;
  startRun: () => void;
  endRun: (details: Activity['activityDetails']) => void;
  openActivity: (activity: Activity) => void;
  setError: (error: string | null) => void;
}

const sampleSteps = () => {
  const steps: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const base = 5000 + Math.floor(Math.random() * 7000);
    steps.push(base);
  }
  return steps;
};

export const useStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      liveActivity: null,
      oldActivites: [],
      topActivity: null,
      lastFourDaysSteps: sampleSteps(),
      loading: null,
      error: null,

      signup: (name, email, _password) => {
        if (!name || !email) return { error: 'Please enter valid details' };
        set({
          user: { name, email },
          isAuthenticated: true,
          isOnboarded: false,
          error: null,
        });
        return {};
      },

      login: (email, _password) => {
        if (!email) return { error: 'Please enter valid details' };
        set({
          user: { email, name: email.split('@')[0] },
          isAuthenticated: true,
          error: null,
        });
        return {};
      },

      logout: () => set({ user: null, isAuthenticated: false, isOnboarded: false }),

      setUserData: (data) =>
        set((s) => ({ user: { ...s.user, ...data } })),

      completeOnboarding: (data) => {
        set((s) => ({
          user: { ...s.user, ...data },
          isOnboarded: true,
          loading: null,
          error: null,
        }));
      },

      startRun: () => {
        const newActivity: Activity = {
          lob: 'self',
          type: 'outdoor',
          subType: 'running',
          date: new Date().toDateString(),
          isLive: true,
          currentlyGoingOn: false,
          activityDetails: {
            startTime: new Date().toLocaleTimeString(),
            coordinates: [],
          },
        };
        set({ liveActivity: newActivity });
      },

      endRun: (details) => {
        const activity: Activity = {
          lob: 'self',
          type: 'outdoor',
          subType: 'running',
          date: new Date().toDateString(),
          isLive: false,
          activityDetails: details,
        };
        const old = get().oldActivites;
        const top = get().topActivity;
        const isNewTop =
          !top ||
          parseFloat(details?.length ?? '0') >
            parseFloat(top.activityDetails?.length ?? '0');
        set({
          liveActivity: null,
          oldActivites: [activity, ...old],
          topActivity: isNewTop ? activity : top,
        });
      },

      openActivity: (_activity) => {},

      setError: (error) => set({ error }),
    }),
    { name: 'fitness-tracker' }
  )
);
