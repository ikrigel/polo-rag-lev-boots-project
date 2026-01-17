import { useState } from 'react';
import { Container, Tabs, Title, Flex } from '@mantine/core';
import Home from './components/Home';
import ConversationalRAG from './components/ConversationalRAG';
import RagAs from './components/RagAs';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState<string | null>('home');

  return (
    <Container size="xl" py="lg">
      <Flex direction="column" gap="lg">
        <Title order={1}>LevBoots RAG System</Title>

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
      </Flex>
    </Container>
  );
}

export default App;
