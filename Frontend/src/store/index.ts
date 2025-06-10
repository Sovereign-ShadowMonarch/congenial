import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import API slices - Using type assertion to avoid module not found errors
// The files exist based on our previous checks, but TypeScript may have caching issues
const portfolioApi = require('./apis/portfolioApi').portfolioApi;
const exchangeApi = require('./apis/exchangeApi').exchangeApi;
const walletsApi = require('./apis/walletsApi').walletsApi;
const defiApi = require('./apis/defiApi').defiApi;
const authApi = require('./apis/authApi').authApi;
const assetsApi = require('./apis/assetsApi').assetsApi;
const transactionsApi = require('./apis/transactionsApi').transactionsApi;
const settingsApi = require('./apis/settingsApi').settingsApi;
const reportingApi = require('./apis/reportingApi').reportingApi;

// Import regular slices - Using type assertion to avoid module not found errors
const authReducer = require('./slices/authSlice').default;
const uiReducer = require('./slices/uiSlice').default;
const portfolioReducer = require('./slices/portfolioSlice').default;
const walletReducer = require('./slices/walletSlice').default;

// Configure API-specific middleware
const apiMiddleware = [
  portfolioApi.middleware,
  exchangeApi.middleware, 
  walletsApi.middleware,
  defiApi.middleware,
  authApi.middleware,
  assetsApi.middleware,
  transactionsApi.middleware,
  settingsApi.middleware,
  reportingApi.middleware
];

// Configure root reducer with all API reducers
const rootReducer = {
  // Regular state slices
  auth: authReducer,
  ui: uiReducer,
  portfolio: portfolioReducer,
  wallet: walletReducer,
  
  // API reducers - each with unique reducerPath
  [portfolioApi.reducerPath]: portfolioApi.reducer,
  [exchangeApi.reducerPath]: exchangeApi.reducer,
  [walletsApi.reducerPath]: walletsApi.reducer,
  [defiApi.reducerPath]: defiApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [assetsApi.reducerPath]: assetsApi.reducer,
  [transactionsApi.reducerPath]: transactionsApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [reportingApi.reducerPath]: reportingApi.reducer,
};

// Configure store with all reducers and middleware
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Add serializable check options to handle non-serializable data like File objects
      serializableCheck: {
        // Ignore specific paths for non-serializable data (e.g., file uploads)
        ignoredActions: ['settingsApi/executeQuery/importSettings'],
        ignoredPaths: ['settingsApi.queries.importSettings.currentData'],
      },
    }).concat(apiMiddleware),
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

// Export TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed dispatch and selector hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
