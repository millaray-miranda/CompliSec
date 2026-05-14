import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

const params = new URLSearchParams(window.location.search);
const token = localStorage.getItem('token');

if (window.location.pathname === '/' && !params.has('view')) {
  window.location.href = '/landing.html';
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
