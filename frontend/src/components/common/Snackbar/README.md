# Snackbar Component System

A flexible and customizable snackbar notification system with 5 design variants.

## Features

- 🎨 **5 Design Variants**: default, minimal, modern, gradient, outlined
- 🎯 **4 Notification Types**: success, error, warning, info
- 📍 **6 Position Options**: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
- ⏱️ **Auto-dismiss**: Configurable duration (or persistent with duration: 0)
- 🔘 **Action Buttons**: Optional action buttons with custom callbacks
- ❌ **Closable**: Optional close button
- 📱 **Responsive**: Works on all screen sizes
- ♿ **Accessible**: ARIA attributes and keyboard support

## Installation

The Snackbar system is already integrated into the app via `App.tsx`:

```tsx
import { SnackbarProvider, SnackbarContainer } from './components/common';

function App() {
  return (
    <SnackbarProvider>
      <MainPage />
      <SnackbarContainer />
    </SnackbarProvider>
  );
}
```

## Basic Usage

```tsx
import { useSnackbar } from '../common';

function MyComponent() {
  const snackbar = useSnackbar();

  const handleClick = () => {
    // Simple notification
    snackbar.success('Operation completed!');

    // Error notification
    snackbar.error('Something went wrong!');

    // Warning notification
    snackbar.warning('Please review your input');

    // Info notification
    snackbar.info('New updates available');
  };

  return <button onClick={handleClick}>Show Notification</button>;
}
```

## Advanced Usage

### Custom Options

```tsx
snackbar.success('File uploaded successfully!', {
  design: 'modern',      // Choose design variant
  duration: 5000,        // 5 seconds
  position: 'top-right', // Position on screen
  closable: true,        // Show close button
});
```

### With Action Button

```tsx
snackbar.error('Failed to delete item', {
  design: 'gradient',
  duration: 6000,
  action: {
    label: 'RETRY',
    onClick: () => {
      // Retry logic here
      console.log('Retrying...');
    }
  }
});
```

### Manual Control

```tsx
const snackbar = useSnackbar();

// Show and get ID
const id = snackbar.showSnackbar('Processing...', {
  type: 'info',
  duration: 0, // Won't auto-dismiss
});

// Later, manually dismiss
snackbar.hideSnackbar(id);
```

## Design Variants

### 1. Default (Recommended for CSV Upload errors)
- **Style**: Filled background with strong colors
- **Use case**: Clear, visible notifications
- **Example**:
  ```tsx
  snackbar.error('Please select a CSV file', { design: 'default' });
  ```

### 2. Minimal
- **Style**: Light background with subtle tones
- **Use case**: Non-intrusive notifications
- **Example**:
  ```tsx
  snackbar.info('Auto-save enabled', { design: 'minimal' });
  ```

### 3. Modern
- **Style**: Elevated with blur effect and borders
- **Use case**: Modern, premium feel
- **Example**:
  ```tsx
  snackbar.success('Changes saved', { design: 'modern' });
  ```

### 4. Gradient
- **Style**: Gradient backgrounds
- **Use case**: Eye-catching, important notifications
- **Example**:
  ```tsx
  snackbar.warning('Action required', { design: 'gradient' });
  ```

### 5. Outlined
- **Style**: White background with colored borders
- **Use case**: Clean, minimalist design
- **Example**:
  ```tsx
  snackbar.info('Tip: Use shortcuts', { design: 'outlined' });
  ```

## Testing Designs

To test all design variants, you can use the SnackbarDemo component:

```tsx
import { SnackbarDemo } from '../common/Snackbar';

function TestPage() {
  return <SnackbarDemo />;
}
```

Or test in browser console:
```javascript
// Access via window (if exposed in dev mode)
window.snackbar.success('Test message', { design: 'modern' });
```

## API Reference

### useSnackbar Hook

```tsx
const {
  snackbars,       // Current active snackbars
  showSnackbar,    // Show custom snackbar
  hideSnackbar,    // Manually hide snackbar
  success,         // Shortcut for success type
  error,           // Shortcut for error type
  warning,         // Shortcut for warning type
  info,            // Shortcut for info type
} = useSnackbar();
```

### SnackbarOptions

```typescript
interface SnackbarOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;           // milliseconds (0 = no auto-dismiss)
  position?: 'top-left' | 'top-center' | 'top-right' |
             'bottom-left' | 'bottom-center' | 'bottom-right';
  design?: 'default' | 'minimal' | 'modern' | 'gradient' | 'outlined';
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Examples in DictionaryGrid

The DictionaryGrid component uses snackbars for CSV upload feedback:

```tsx
// Error: Invalid file type
snackbar.error('Please select a CSV file', { design: 'default' });

// Error: File too large
snackbar.error('File size exceeds 5MB limit', { design: 'default' });

// Warning: No data
snackbar.warning('CSV file has no data rows', { design: 'default' });

// Success: Import completed
snackbar.success(`Successfully imported ${count} entries!`, {
  design: 'default',
  duration: 4000
});
```

## Best Practices

1. **Choose appropriate types**:
   - `error` for failures and validation errors
   - `success` for completed operations
   - `warning` for important alerts
   - `info` for general notifications

2. **Set reasonable durations**:
   - Success: 3-4 seconds
   - Error: 5-6 seconds (longer to read error details)
   - Warning: 4-5 seconds
   - Info: 3-4 seconds

3. **Use action buttons sparingly**: Only when there's a clear action the user can take

4. **Position strategically**:
   - `bottom-right`: Default, least intrusive
   - `top-center`: Important announcements
   - `top-right`: Less intrusive than center

5. **Keep messages concise**: Short, clear messages work best

## Troubleshooting

### Snackbar not showing
- Ensure `SnackbarProvider` wraps your component
- Ensure `SnackbarContainer` is rendered in App
- Check browser console for errors

### Multiple snackbars stacking
- This is expected behavior
- Snackbars stack vertically based on position
- Older snackbars auto-dismiss as new ones appear

### Styling conflicts
- Snackbar uses high z-index (9999)
- Uses fixed positioning
- Check for CSS conflicts in your app

## Migration from alert()

Replace:
```tsx
alert('Error message');
```

With:
```tsx
snackbar.error('Error message');
```

## Contributing

When adding new designs or features:
1. Update `types.ts` for new types
2. Update `Snackbar.scss` for new styles
3. Update this README
4. Test with `SnackbarDemo` component
