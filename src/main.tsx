import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ReduxProvider } from './store/provider'
import { initTheme } from './lib/theme'
import { I18nProvider } from './lib/i18n/provider'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ReduxProvider>
  </StrictMode>,
)
