/**
 * Snackbar Demo Component
 * Test all design variants and options
 */

import React, { useState } from 'react';
import { useSnackbar } from './useSnackbar';
import { SnackbarDesign, SnackbarType } from './types';
import './SnackbarDemo.scss';

const SnackbarDemo: React.FC = () => {
  const snackbar = useSnackbar();
  const [selectedDesign, setSelectedDesign] = useState<SnackbarDesign>('default');

  const designs: SnackbarDesign[] = ['default', 'minimal', 'modern', 'gradient', 'outlined'];
  const types: SnackbarType[] = ['success', 'error', 'warning', 'info'];

  const messages = {
    success: 'Operation completed successfully!',
    error: 'An error occurred while processing your request.',
    warning: 'Please review your input before proceeding.',
    info: 'New updates are available for download.',
  };

  const handleShowSnackbar = (type: SnackbarType) => {
    snackbar.showSnackbar(messages[type], {
      type,
      design: selectedDesign,
      duration: 4000,
      closable: true,
    });
  };

  const handleShowWithAction = (type: SnackbarType) => {
    snackbar.showSnackbar(messages[type], {
      type,
      design: selectedDesign,
      duration: 6000,
      closable: true,
      action: {
        label: 'UNDO',
        onClick: () => {
          console.log('Action clicked!');
        },
      },
    });
  };

  return (
    <div className="snackbar-demo">
      <div className="demo-header">
        <h2>Snackbar Design System</h2>
        <p>Choose a design variant and test different notification types</p>
      </div>

      <div className="demo-section">
        <h3>Design Variants</h3>
        <div className="design-selector">
          {designs.map((design) => (
            <button
              key={design}
              className={`design-btn ${selectedDesign === design ? 'active' : ''}`}
              onClick={() => setSelectedDesign(design)}
            >
              {design.charAt(0).toUpperCase() + design.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="demo-section">
        <h3>Test Notifications</h3>
        <div className="type-buttons">
          {types.map((type) => (
            <button
              key={type}
              className={`type-btn type-btn-${type}`}
              onClick={() => handleShowSnackbar(type)}
            >
              Show {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="demo-section">
        <h3>With Action Button</h3>
        <div className="type-buttons">
          {types.map((type) => (
            <button
              key={type}
              className={`type-btn type-btn-${type}`}
              onClick={() => handleShowWithAction(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} + Action
            </button>
          ))}
        </div>
      </div>

      <div className="demo-section">
        <h3>Design Previews</h3>
        <div className="design-previews">
          {designs.map((design) => (
            <div key={design} className="preview-card">
              <h4>{design.charAt(0).toUpperCase() + design.slice(1)}</h4>
              <p className="preview-description">
                {design === 'default' && 'Filled background with strong colors'}
                {design === 'minimal' && 'Light background with subtle tones'}
                {design === 'modern' && 'Elevated with blur effect and borders'}
                {design === 'gradient' && 'Gradient backgrounds for visual impact'}
                {design === 'outlined' && 'White background with colored borders'}
              </p>
              <div className="preview-images">
                {types.map((type) => (
                  <div key={type} className={`preview-snackbar snackbar snackbar-${type} snackbar-${design}`}>
                    <div className="snackbar-icon">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="snackbar-content">
                      <div className="snackbar-message">{type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SnackbarDemo;
