import { useState, useEffect } from 'react';
import { Tabs, Title } from '@mantine/core';
import Home from './components/Home';
import ConversationalRAG from './components/ConversationalRAG';
import RagAs from './components/RagAs';
import Settings from './components/Settings';
import { logger } from './utils/logger';

function App() {
  const [activeTab, setActiveTab] = useState<string | null>('home');

  useEffect(() => {
    logger.info('App component mounted', { initialTab: activeTab });
  }, []);

  useEffect(() => {
    logger.info('Active tab changed', { newTab: activeTab });
  }, [activeTab]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title order={1} mb="lg" style={{ marginBottom: '24px' }}>
        LevBoots RAG System
      </Title>

      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="home">Home</Tabs.Tab>
          <Tabs.Tab value="conversational">Conversational RAG</Tabs.Tab>
          <Tabs.Tab value="ragas">RAGAS Evaluation</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="home" pt="xl">
          <Home />
        </Tabs.Panel>

        <Tabs.Panel value="conversational" pt="xl">
          <ConversationalRAG />
        </Tabs.Panel>

        <Tabs.Panel value="ragas" pt="xl">
          <RagAs />
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="xl">
          <Settings />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default App;
