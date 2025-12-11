import React from 'react';
import { HashRouter } from 'react-router-dom'; // Use HashRouter for Electron (file:// URLs)
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
