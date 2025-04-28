import { create } from 'zustand';

interface IAuth {
  user: any | null; //TODO: bring in user interfact
  loading: boolean;
  token: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  setPhoneVerified: (loading: boolean) => void;
  setEmailVerified: (loading: boolean) => void;
  setToken: (token: string | null) => void;
}

const useRegisterStore = create<IAuth>((set) => ({
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
  setPhoneVerified: (phoneVerified) => set({ phoneVerified }),
  setEmailVerified: (emailVerified) => set({ emailVerified }),
  user: null,
  token: null,
  loading: false,
  phoneVerified: false,
  emailVerified: false
}));

export default useRegisterStore;
