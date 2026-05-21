import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Monitor from './Monitor.jsx'

const path = window.location.pathname;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path === "/monitor" ? <Monitor /> : <App /> }
    
  </StrictMode>,
)
