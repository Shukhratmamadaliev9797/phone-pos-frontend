import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer, { clearAuth } from './slices/auth.slice'
import { baseApi } from '@/api'

const appReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
})

// Reset state on logout
const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === clearAuth.type) {
    storage.removeItem('persist:root')
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      baseApi.middleware
    ),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
