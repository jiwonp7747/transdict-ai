/**
 * Common Button Component
 * Standardized button component with consistent styling across the application
 */

import React from 'react';
import { ButtonVariant, ButtonSize, DEFAULT_BUTTON_SIZE } from './buttonConstants';
import '../../styles/buttons.scss';

export interface CommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant (color scheme)
   */
  variant?: ButtonVariant;

  /**
   * Button size
   */
  size?: ButtonSize;

  /**
   * Icon to display before the button text
   */
  icon?: React.ReactNode;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Icon-only button (no text)
   */
  iconOnly?: boolean;

  /**
   * Custom className to add to the button
   */
  className?: string;

  /**
   * Children (button content)
   */
  children?: React.ReactNode;
}

/**
 * Common Button Component
 *
 * @example
 * ```tsx
 * <CommonButton variant="primary" icon="🚀" onClick={handleClick}>
 *   Generate
 * </CommonButton>
 * ```
 */
const CommonButton = React.forwardRef<HTMLButtonElement, CommonButtonProps>(
  (
    {
      variant = 'primary',
      size = DEFAULT_BUTTON_SIZE,
      icon,
      loading = false,
      fullWidth = false,
      iconOnly = false,
      className = '',
      children,
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    // Build class names
    const buttonClasses = [
      'common-btn',
      `common-btn-${variant}`,
      `common-btn-${size}`,
      loading && 'common-btn-loading',
      iconOnly && 'common-btn-icon',
      fullWidth && 'w-100',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        {...rest}
      >
        {!loading && icon && <span className="button-icon">{icon}</span>}
        {!iconOnly && children}
      </button>
    );
  }
);

CommonButton.displayName = 'CommonButton';

export default CommonButton;
