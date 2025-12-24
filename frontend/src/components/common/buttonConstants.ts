/**
 * Common button constants and types
 * Defines standardized button variants and sizes across the application
 */

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info';

export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button variant mapping for semantic usage
 */
export const ButtonPurpose = {
  // Primary actions
  PRIMARY: 'primary' as ButtonVariant,
  GENERATE: 'primary' as ButtonVariant,
  SUBMIT: 'primary' as ButtonVariant,

  // Secondary/Cancel actions
  SECONDARY: 'secondary' as ButtonVariant,
  CANCEL: 'secondary' as ButtonVariant,

  // Success/Confirm actions
  SUCCESS: 'success' as ButtonVariant,
  CREATE: 'success' as ButtonVariant,
  SAVE: 'success' as ButtonVariant,

  // Danger/Delete actions
  DANGER: 'danger' as ButtonVariant,
  DELETE: 'outline-danger' as ButtonVariant,
  REMOVE: 'outline-danger' as ButtonVariant,

  // Info/Export actions
  INFO: 'outline-info' as ButtonVariant,
  EXPORT: 'outline-info' as ButtonVariant,
  DOWNLOAD: 'outline-info' as ButtonVariant,

  // Upload/Import actions
  UPLOAD: 'outline-success' as ButtonVariant,
  IMPORT: 'outline-success' as ButtonVariant,

  // Add/Create new actions
  ADD: 'outline-primary' as ButtonVariant,
  NEW: 'outline-primary' as ButtonVariant,
} as const;

/**
 * Common button icons
 */
export const ButtonIcons = {
  ADD: '+ ',
  DELETE: '',
  EDIT: '✏️ ',
  SAVE: '💾 ',
  CANCEL: '',
  EXPORT: '📥 ',
  IMPORT: '📤 ',
  UPLOAD: '📤 ',
  DOWNLOAD: '📥 ',
  GENERATE: '🚀 ',
  AI: '🤖 ',
  CREATE: '✅ ',
  SEARCH: '🔍 ',
  FILTER: '🔎 ',
} as const;

/**
 * Default button size
 */
export const DEFAULT_BUTTON_SIZE: ButtonSize = 'sm';
