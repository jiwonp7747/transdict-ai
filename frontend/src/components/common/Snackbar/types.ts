/**
 * Snackbar Types and Interfaces
 */

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

export type SnackbarPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type SnackbarDesign = 'default' | 'minimal' | 'modern' | 'gradient' | 'outlined';

export interface SnackbarOptions {
  /**
   * Type of snackbar (determines color and icon)
   */
  type?: SnackbarType;

  /**
   * Duration in milliseconds (0 = no auto-dismiss)
   */
  duration?: number;

  /**
   * Position on screen
   */
  position?: SnackbarPosition;

  /**
   * Design variant
   */
  design?: SnackbarDesign;

  /**
   * Show close button
   */
  closable?: boolean;

  /**
   * Custom action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Snackbar extends Required<SnackbarOptions> {
  id: string;
  message: string;
}

export interface SnackbarContextValue {
  snackbars: Snackbar[];
  showSnackbar: (message: string, options?: SnackbarOptions) => string;
  hideSnackbar: (id: string) => void;
  success: (message: string, options?: Omit<SnackbarOptions, 'type'>) => string;
  error: (message: string, options?: Omit<SnackbarOptions, 'type'>) => string;
  warning: (message: string, options?: Omit<SnackbarOptions, 'type'>) => string;
  info: (message: string, options?: Omit<SnackbarOptions, 'type'>) => string;
}
