/**
 * Snackbar Context Provider
 * Manages global snackbar state
 */

import React, { createContext, useState, useCallback } from 'react';
import { Snackbar, SnackbarContextValue, SnackbarOptions } from './types';

export const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

const DEFAULT_OPTIONS: Required<SnackbarOptions> = {
  type: 'info',
  duration: 4000,
  position: 'bottom-right',
  design: 'default',
  closable: true,
  action: undefined as any,
};

interface SnackbarProviderProps {
  children: React.ReactNode;
  defaultOptions?: Partial<SnackbarOptions>;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
  defaultOptions = {}
}) => {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  const showSnackbar = useCallback((message: string, options: SnackbarOptions = {}): string => {
    const id = `snackbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const snackbar: Snackbar = {
      id,
      message,
      ...DEFAULT_OPTIONS,
      ...defaultOptions,
      ...options,
    };

    setSnackbars((prev) => [...prev, snackbar]);

    // Auto-dismiss if duration > 0
    if (snackbar.duration > 0) {
      setTimeout(() => {
        hideSnackbar(id);
      }, snackbar.duration);
    }

    return id;
  }, [defaultOptions]);

  const hideSnackbar = useCallback((id: string) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  }, []);

  const success = useCallback((message: string, options?: Omit<SnackbarOptions, 'type'>) => {
    return showSnackbar(message, { ...options, type: 'success' });
  }, [showSnackbar]);

  const error = useCallback((message: string, options?: Omit<SnackbarOptions, 'type'>) => {
    return showSnackbar(message, { ...options, type: 'error' });
  }, [showSnackbar]);

  const warning = useCallback((message: string, options?: Omit<SnackbarOptions, 'type'>) => {
    return showSnackbar(message, { ...options, type: 'warning' });
  }, [showSnackbar]);

  const info = useCallback((message: string, options?: Omit<SnackbarOptions, 'type'>) => {
    return showSnackbar(message, { ...options, type: 'info' });
  }, [showSnackbar]);

  const value: SnackbarContextValue = {
    snackbars,
    showSnackbar,
    hideSnackbar,
    success,
    error,
    warning,
    info,
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
};
