import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "the-new-css-reset/css/reset.css";
import './index.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
);
