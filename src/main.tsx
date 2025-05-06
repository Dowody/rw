import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Ensure the root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

// Create root with error boundary
const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Optional: Add global error handling
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
})
