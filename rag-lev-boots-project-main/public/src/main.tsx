import { StrictMode } from 'react';
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

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider forceColorScheme='dark'>
      <App />
    </MantineProvider>
  </StrictMode>
);

logger.info('App rendered successfully');
