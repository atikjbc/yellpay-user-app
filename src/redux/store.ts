// src/app/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { appApi } from '../services/appApi';
import { dogApi } from '../services/dogApi';
import SecureStorage from '../utils/secureStorage';
import registrationReducer from './slice/auth/registrationSlice';

const persistConfig = {
  key: 'root',
  storage: SecureStorage, // ✅ Use SecureStore instead of AsyncStorage
  whitelist: ['registration'],
};

const rootReducer = combineReducers({
  registration: registrationReducer,
  [appApi.reducerPath]: appApi.reducer,
  [dogApi.reducerPath]: dogApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefault =>
    getDefault({ serializableCheck: false })
      .concat(appApi.middleware)
      .concat(dogApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
