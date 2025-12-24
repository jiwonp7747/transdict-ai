/**
 * Custom hook for using Snackbar
 */

import { useContext } from 'react';
import { SnackbarContext } from './SnackbarContext';
import { SnackbarContextValue } from './types';

export const useSnackbar = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }

  return context;
};
