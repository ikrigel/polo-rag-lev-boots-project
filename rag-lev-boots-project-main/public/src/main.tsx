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
    // Get saved theme preference from localStorage
    const savedSettings = localStorage.getItem('rag_app_settings');
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

    // Listen for storage changes to apply theme in real-time
    const handleStorageChange = () => {
      const updatedSettings = localStorage.getItem('rag_app_settings');
      if (updatedSettings) {
        try {
          const settings = JSON.parse(updatedSettings);
          const theme = settings.theme || 'dark';

          if (theme === 'auto') {
            setColorScheme(undefined);
          } else {
            setColorScheme(theme);
          }
          logger.info('Theme preference updated', { theme });
        } catch (e) {
          logger.error('Failed to update theme preference', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
