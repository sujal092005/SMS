import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SchoolProvider } from './context/SchoolContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/index.css';
import './i18n'; // initialize i18n
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <SchoolProvider>
          <App />
        </SchoolProvider>
      </I18nextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
