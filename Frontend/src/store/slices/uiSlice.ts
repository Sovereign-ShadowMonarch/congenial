import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'BTC' | 'ETH';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  autoClose?: number; // ms until auto close, false to disable
  timestamp: number;
  read: boolean;
}

export interface ModalState {
  activeModal: string | null;
  modalProps: Record<string, unknown>;
}

export interface LoadingState {
  global: boolean;
  [key: string]: boolean;
}

interface UiState {
  theme: ThemeMode;
  currency: Currency;
  sidebarOpen: boolean;
  modals: ModalState;
  notifications: Notification[];
  loading: LoadingState;
  timeRange: '1d' | '7d' | '30d' | '90d' | '1y' | 'all';
}

const initialState: UiState = {
  theme: 'auto',
  currency: 'USD',
  sidebarOpen: true,
  modals: {
    activeModal: null,
    modalProps: {},
  },
  notifications: [],
  loading: {
    global: false,
  },
  timeRange: '30d',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.currency = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    openModal: (state, action: PayloadAction<{ modalId: string; props?: Record<string, unknown> }>) => {
      state.modals.activeModal = action.payload.modalId;
      state.modals.modalProps = action.payload.props || {};
    },
    
    closeModal: (state) => {
      state.modals.activeModal = null;
      state.modals.modalProps = {};
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      state.notifications.unshift({
        ...action.payload,
        id,
        timestamp: Date.now(),
        read: false,
      });
      
      // Limit notifications to last 50
      if (state.notifications.length > 50) {
        state.notifications.pop();
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (notification) => notification.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
    
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    setTimeRange: (state, action: PayloadAction<UiState['timeRange']>) => {
      state.timeRange = action.payload;
    },
  },
});

export const {
  setTheme,
  setCurrency,
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  clearAllNotifications,
  setLoading,
  setGlobalLoading,
  setTimeRange,
} = uiSlice.actions;

export default uiSlice.reducer;
