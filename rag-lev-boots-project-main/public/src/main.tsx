import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/figtree/400.css';
import '@fontsource/figtree/600.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@mantine/core/styles.css';

import './index.css';
import App from './App.tsx';
import { MantineProvider } from '@mantine/core';
import { logger } from './utils/logger';

logger.info('Frontend application starting');

const rootElement = document.getElementById('root');
if (!rootElement) {
  logger.error('Root element not found in DOM');
  throw new Error('Root element not found');
}

logger.info('Root element found, rendering App');

// Root component to handle theme
function Root() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | undefined>(undefined);

  useEffect(() => {
    // Function to apply theme from localStorage
    const applyTheme = () => {
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          const theme = settings.theme || 'dark';

          if (theme === 'auto') {
            // Use system preference
            setColorScheme(undefined);
          } else {
            setColorScheme(theme);
          }
          logger.info('Theme preference loaded', { theme });
        } catch (e) {
          logger.error('Failed to load theme preference', e);
          setColorScheme('dark');
        }
      } else {
        // Default to dark if no preference saved
        setColorScheme('dark');
      }
    };

    // Apply theme on initial load
    applyTheme();

    // Listen for storage changes to apply theme in real-time
    const handleStorageChange = () => {
      logger.info('Storage change detected, reloading theme');
      applyTheme();
    };

    // Also listen for custom storage event for same-tab updates
    const handleCustomStorageChange = () => {
      logger.info('Custom theme change event detected');
      applyTheme();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleCustomStorageChange);
    };
  }, []);

  return (
    <StrictMode>
      <MantineProvider forceColorScheme={colorScheme}>
        <App />
      </MantineProvider>
    </StrictMode>
  );
}

createRoot(rootElement).render(<Root />);

logger.info('App rendered successfully');
