// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { ThemeProvider } from './contexts/ThemeContext.jsx'; // Import ThemeProvider
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
<ThemeProvider>
  <React.StrictMode>
    {/* Bọc App bằng ThemeProvider */}
        <App />
  </React.StrictMode>
</ThemeProvider>
);