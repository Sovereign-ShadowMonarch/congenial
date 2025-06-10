import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSettings } from '../apis/authApi';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
  } | null;
  token: string | null;
  refreshToken: string | null;
  sessionExpiry: number | null;
  settings: UserSettings | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  sessionExpiry: null,
  settings: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: { name: string };
        token: string;
        refreshToken?: string;
        sessionExpiry?: number;
      }>
    ) => {
      const { user, token, refreshToken, sessionExpiry } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      if (refreshToken) state.refreshToken = refreshToken;
      if (sessionExpiry) state.sessionExpiry = sessionExpiry;
    },
    
    setUserSettings: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload;
    },
    
    updateUserSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      if (state.settings) {
        state.settings = {
          ...state.settings,
          ...action.payload,
        };
      }
    },
    
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.sessionExpiry = null;
      state.settings = null;
    },
  },
});

export const { setCredentials, setUserSettings, updateUserSettings, logout } = authSlice.actions;

export default authSlice.reducer;
