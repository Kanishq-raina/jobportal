import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext.jsx';
import axios from 'axios';

// ✅ Add this here globally
axios.defaults.withCredentials = true;
// ✅ Add this line at the top to polyfill Buffer
import { Buffer } from 'buffer';
window.Buffer = Buffer;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
);
