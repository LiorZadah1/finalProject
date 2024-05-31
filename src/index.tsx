import React from 'react';
import ReactDOM from 'react-dom/client';
import { MetaMaskProvider } from "metamask-react";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';

// Define your custom MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Attempt to locate the root container in the DOM
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement); // Now we are sure rootElement is not null
  root.render(
    <React.StrictMode>
      <MetaMaskProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </MetaMaskProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
