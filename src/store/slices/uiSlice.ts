import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notification: {
    show: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  };
  loading: {
    global: boolean;
    operations: Record<string, boolean>;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: true, // Default to dark mode
  notification: {
    show: false,
    message: '',
    severity: 'info',
  },
  loading: {
    global: false,
    operations: {},
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    showNotification: (state, action: PayloadAction<{ message: string; severity: 'success' | 'info' | 'warning' | 'error' }>) => {
      state.notification = {
        show: true,
        message: action.payload.message,
        severity: action.payload.severity,
      };
    },
    hideNotification: (state) => {
      state.notification.show = false;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setOperationLoading: (state, action: PayloadAction<{ operation: string; isLoading: boolean }>) => {
      state.loading.operations[action.payload.operation] = action.payload.isLoading;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  showNotification,
  hideNotification,
  setGlobalLoading,
  setOperationLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
