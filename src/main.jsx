import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SchoolProvider } from './context/SchoolContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SchoolProvider>
      <App />
    </SchoolProvider>
  </React.StrictMode>
);
