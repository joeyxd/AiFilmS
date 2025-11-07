// Main entry point for the Auracle Film Studio application
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Back to standard App import
import { Provider } from 'react-redux'
import { store } from './store'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import './global.css'

// Load debugging utilities in development
if (import.meta.env.DEV) {
  import('./debug/conversationDebug');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
