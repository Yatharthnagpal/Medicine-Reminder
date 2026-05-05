import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#25D366', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    />
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
