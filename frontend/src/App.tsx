import React from 'react';
import MainPage from './pages/MainPage/MainPage';
import { SnackbarProvider, SnackbarContainer } from './components/common';
import './App.scss';

function App() {
  return (
    <SnackbarProvider>
      <MainPage />
      <SnackbarContainer />
    </SnackbarProvider>
  );
}

export default App;
