/**
 * Snackbar Container
 * Renders all active snackbars
 */

import React from 'react';
import { useSnackbar } from './useSnackbar';
import SnackbarItem from './SnackbarItem';
import { SnackbarPosition } from './types';
import './Snackbar.scss';

const SnackbarContainer: React.FC = () => {
  const { snackbars, hideSnackbar } = useSnackbar();

  // Group snackbars by position
  const groupedSnackbars = snackbars.reduce((acc, snackbar) => {
    const position = snackbar.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(snackbar);
    return acc;
  }, {} as Record<SnackbarPosition, typeof snackbars>);

  return (
    <>
      {Object.entries(groupedSnackbars).map(([position, positionSnackbars]) => (
        <div key={position} className={`snackbar-container snackbar-container-${position}`}>
          {positionSnackbars.map((snackbar) => (
            <SnackbarItem
              key={snackbar.id}
              snackbar={snackbar}
              onClose={hideSnackbar}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default SnackbarContainer;
