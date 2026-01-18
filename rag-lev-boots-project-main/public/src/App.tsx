import { Container, Tabs } from '@mantine/core';
import Home from './components/Home';
import ConversationalRAG from './components/ConversationalRAG';
import RagAs from './components/RagAs';
import Settings from './components/Settings';

function App() {
  return (
    <Container size="xl" py="xl">
      <h1 style={{ marginBottom: '30px' }}>LevBoots RAG System</h1>
      <h1 style={{ marginBottom: '20px', fontSize: '30px', fontWeight: 'normal' }}>
        🐕Polo Love Coding with Jona🐕
      </h1>
      <Tabs defaultValue="home">
        <Tabs.List>
          <Tabs.Tab value="home">Home</Tabs.Tab>
          <Tabs.Tab value="conversational">Conversational</Tabs.Tab>
          <Tabs.Tab value="ragas">RAGAS</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="home" pt="md">
          <Home />
        </Tabs.Panel>

        <Tabs.Panel value="conversational" pt="md">
          <ConversationalRAG />
        </Tabs.Panel>

        <Tabs.Panel value="ragas" pt="md">
          <RagAs />
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="md">
          <Settings />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

export default App;
