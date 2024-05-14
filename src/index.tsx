import React from 'react';
import ReactDOM from 'react-dom/client';
import { MetaMaskProvider } from "metamask-react";
import App from './App';

// Attempt to locate the root container in the DOM
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement); // Now we are sure rootElement is not null
  root.render(
    <React.StrictMode>
      <MetaMaskProvider>
        <App />
      </MetaMaskProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
