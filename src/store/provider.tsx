import * as React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './index'
import { PageLoader } from '@/components/ui/page-loader'

interface ReduxProviderProps {
  children: React.ReactNode
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<PageLoader  />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
