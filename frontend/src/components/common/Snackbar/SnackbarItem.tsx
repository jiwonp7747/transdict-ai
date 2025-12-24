/**
 * Individual Snackbar Component
 */

import React, { useEffect, useState } from 'react';
import { Snackbar } from './types';
import './Snackbar.scss';

interface SnackbarItemProps {
  snackbar: Snackbar;
  onClose: (id: string) => void;
}

const SnackbarItem: React.FC<SnackbarItemProps> = ({ snackbar, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(snackbar.id);
    }, 300); // Match animation duration
  };

  // Auto-dismiss
  useEffect(() => {
    if (snackbar.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, snackbar.duration);

      return () => clearTimeout(timer);
    }
  }, [snackbar.duration]);

  const getIcon = () => {
    switch (snackbar.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M1 17H19L10 2L1 17ZM11 14H9V12H11V14ZM11 10H9V6H11V10Z" fill="currentColor"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="currentColor"/>
          </svg>
        );
    }
  };

  const classNames = [
    'snackbar',
    `snackbar-${snackbar.type}`,
    `snackbar-${snackbar.design}`,
    isExiting ? 'snackbar-exit' : 'snackbar-enter',
  ].join(' ');

  return (
    <div className={classNames} role="alert">
      <div className="snackbar-icon">{getIcon()}</div>
      <div className="snackbar-content">
        <div className="snackbar-message">{snackbar.message}</div>
        {snackbar.action && (
          <button
            className="snackbar-action"
            onClick={() => {
              snackbar.action?.onClick();
              handleClose();
            }}
          >
            {snackbar.action.label}
          </button>
        )}
      </div>
      {snackbar.closable && (
        <button
          className="snackbar-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default SnackbarItem;
