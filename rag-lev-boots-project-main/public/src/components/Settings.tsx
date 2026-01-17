import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Card,
  Switch,
  Slider,
  NumberInput,
  Select,
  Divider,
  Badge,
  Alert,
  Tabs,
  Code,
  SimpleGrid,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconRefresh } from '@tabler/icons-react';

interface UserSettings {
  // Feature Flags
  enableConversationalRAG: boolean;
  enableRagAsEvaluation: boolean;
  enableAnalytics: boolean;
  enableConversationHistory: boolean;
  enableAutoSave: boolean;

  // Theme Settings
  theme: 'light' | 'dark' | 'auto';

  // LLM Parameters
  temperature: number;
  maxTokens: number;
  topP: number;

  // RAG Settings
  similarityThreshold: number;
  topKChunks: number;
  contextWindowSize: number;

  // API Settings
  apiTimeout: number;
  retryAttempts: number;

  // Embedding Settings
  embeddingDimension: number;
  embeddingModel: string;

  // Notifications
  enableNotifications: boolean;
  notificationLevel: 'all' | 'warnings' | 'errors';

  // Advanced
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const DEFAULT_SETTINGS: UserSettings = {
  enableConversationalRAG: true,
  enableRagAsEvaluation: true,
  enableAnalytics: true,
  enableConversationHistory: true,
  enableAutoSave: true,
  theme: 'auto',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  similarityThreshold: 0.3,
  topKChunks: 5,
  contextWindowSize: 2000,
  apiTimeout: 30,
  retryAttempts: 3,
  embeddingDimension: 768,
  embeddingModel: 'text-embedding-004',
  enableNotifications: true,
  notificationLevel: 'warnings',
  debugMode: false,
  logLevel: 'info',
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('user_settings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSettingChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveMessage(null);
  };

  const saveSettings = () => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
    setHasChanges(false);
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('user_settings');
    setHasChanges(false);
    setSaveMessage('Settings reset to defaults!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Settings
      </Title>

      {saveMessage && (
        <Alert icon={<IconCheck size={16} />} color="green" mb="md" title="Success">
          {saveMessage}
        </Alert>
      )}

      <Tabs defaultValue="features">
        <Tabs.List>
          <Tabs.Tab value="features">Features</Tabs.Tab>
          <Tabs.Tab value="llm">LLM & RAG</Tabs.Tab>
          <Tabs.Tab value="api">API & Embeddings</Tabs.Tab>
          <Tabs.Tab value="advanced">Advanced</Tabs.Tab>
          <Tabs.Tab value="export">Export</Tabs.Tab>
        </Tabs.List>

        {/* Features Tab */}
        <Tabs.Panel value="features" pt="md">
          <Stack gap="md">
            <div>
              <Title order={3}>Feature Flags</Title>
              <Text c="dimmed" size="sm" mb="md">
                Enable or disable specific features
              </Text>
            </div>

            <Card withBorder p="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Conversational RAG</Text>
                    <Text size="sm" c="dimmed">
                      Multi-turn conversation support with context management
                    </Text>
                  </div>
                  <Switch
                    checked={settings.enableConversationalRAG}
                    onChange={(e) =>
                      handleSettingChange('enableConversationalRAG', e.currentTarget.checked)
                    }
                  />
                </Group>

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>RAGAS Evaluation</Text>
                    <Text size="sm" c="dimmed">
                      Quality evaluation and metrics tracking
                    </Text>
                  </div>
                  <Switch
                    checked={settings.enableRagAsEvaluation}
                    onChange={(e) =>
                      handleSettingChange('enableRagAsEvaluation', e.currentTarget.checked)
                    }
                  />
                </Group>

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Conversation History</Text>
                    <Text size="sm" c="dimmed">
                      Save and restore past conversations
                    </Text>
                  </div>
                  <Switch
                    checked={settings.enableConversationHistory}
                    onChange={(e) =>
                      handleSettingChange('enableConversationHistory', e.currentTarget.checked)
                    }
                  />
                </Group>

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Auto-Save</Text>
                    <Text size="sm" c="dimmed">
                      Automatically save conversations and settings
                    </Text>
                  </div>
                  <Switch
                    checked={settings.enableAutoSave}
                    onChange={(e) => handleSettingChange('enableAutoSave', e.currentTarget.checked)}
                  />
                </Group>

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Analytics</Text>
                    <Text size="sm" c="dimmed">
                      Collect usage analytics for improvement
                    </Text>
                  </div>
                  <Switch
                    checked={settings.enableAnalytics}
                    onChange={(e) => handleSettingChange('enableAnalytics', e.currentTarget.checked)}
                  />
                </Group>

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Notifications</Text>
                    <Text size="sm" c="dimmed">
                      Receive system notifications
                    </Text>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onChange={(e) =>
                      handleSettingChange('enableNotifications', e.currentTarget.checked)
                    }
                  />
                </Group>

                {settings.enableNotifications && (
                  <>
                    <Divider />
                    <Select
                      label="Notification Level"
                      value={settings.notificationLevel}
                      onChange={(value) =>
                        handleSettingChange('notificationLevel', value as 'all' | 'warnings' | 'errors')
                      }
                      data={[
                        { value: 'all', label: 'All Events' },
                        { value: 'warnings', label: 'Warnings & Errors' },
                        { value: 'errors', label: 'Errors Only' },
                      ]}
                    />
                  </>
                )}
              </Stack>
            </Card>

            <div>
              <Title order={3}>Theme</Title>
              <Text c="dimmed" size="sm" mb="md">
                Choose your preferred theme
              </Text>
            </div>

            <Select
              label="Theme"
              value={settings.theme}
              onChange={(value) =>
                handleSettingChange('theme', value as 'light' | 'dark' | 'auto')
              }
              data={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' },
              ]}
            />
          </Stack>
        </Tabs.Panel>

        {/* LLM & RAG Tab */}
        <Tabs.Panel value="llm" pt="md">
          <Stack gap="md">
            <div>
              <Title order={3}>LLM Parameters</Title>
              <Text c="dimmed" size="sm" mb="md">
                Control language model behavior
              </Text>
            </div>

            <Card withBorder p="md">
              <Stack gap="md">
                <div>
                  <Text fw={500} mb="xs">
                    Temperature: {settings.temperature}
                  </Text>
                  <Slider
                    value={settings.temperature}
                    onChange={(value) => handleSettingChange('temperature', value)}
                    min={0}
                    max={2}
                    step={0.1}
                    marks={[
                      { value: 0, label: '0 (Deterministic)' },
                      { value: 1, label: '1 (Default)' },
                      { value: 2, label: '2 (Creative)' },
                    ]}
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    Lower = more deterministic, Higher = more creative
                  </Text>
                </div>

                <Divider />

                <NumberInput
                  label="Max Tokens"
                  value={settings.maxTokens}
                  onChange={(value) => handleSettingChange('maxTokens', value || 2048)}
                  min={100}
                  max={8192}
                  step={100}
                  description="Maximum length of generated responses"
                />

                <Divider />

                <div>
                  <Text fw={500} mb="xs">
                    Top P: {settings.topP}
                  </Text>
                  <Slider
                    value={settings.topP}
                    onChange={(value) => handleSettingChange('topP', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 0.5, label: '0.5' },
                      { value: 1, label: '1' },
                    ]}
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    Nucleus sampling probability
                  </Text>
                </div>
              </Stack>
            </Card>

            <div>
              <Title order={3}>RAG Configuration</Title>
              <Text c="dimmed" size="sm" mb="md">
                Retrieval-Augmented Generation settings
              </Text>
            </div>

            <Card withBorder p="md">
              <Stack gap="md">
                <div>
                  <Text fw={500} mb="xs">
                    Similarity Threshold: {settings.similarityThreshold}
                  </Text>
                  <Slider
                    value={settings.similarityThreshold}
                    onChange={(value) => handleSettingChange('similarityThreshold', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 0.5, label: '0.5' },
                      { value: 1, label: '1' },
                    ]}
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    Minimum relevance score for retrieved chunks
                  </Text>
                </div>

                <Divider />

                <NumberInput
                  label="Top K Chunks"
                  value={settings.topKChunks}
                  onChange={(value) => handleSettingChange('topKChunks', value || 5)}
                  min={1}
                  max={20}
                  description="Number of relevant chunks to retrieve"
                />

                <Divider />

                <NumberInput
                  label="Context Window Size"
                  value={settings.contextWindowSize}
                  onChange={(value) => handleSettingChange('contextWindowSize', value || 2000)}
                  min={500}
                  max={5000}
                  step={100}
                  description="Maximum tokens for conversation context"
                />
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* API & Embeddings Tab */}
        <Tabs.Panel value="api" pt="md">
          <Stack gap="md">
            <div>
              <Title order={3}>API Configuration</Title>
              <Text c="dimmed" size="sm" mb="md">
                Adjust API behavior and timeouts
              </Text>
            </div>

            <Card withBorder p="md">
              <Stack gap="md">
                <NumberInput
                  label="API Timeout (seconds)"
                  value={settings.apiTimeout}
                  onChange={(value) => handleSettingChange('apiTimeout', value || 30)}
                  min={5}
                  max={120}
                  description="Maximum time to wait for API response"
                />

                <Divider />

                <NumberInput
                  label="Retry Attempts"
                  value={settings.retryAttempts}
                  onChange={(value) => handleSettingChange('retryAttempts', value || 3)}
                  min={0}
                  max={5}
                  description="Number of retries for failed API calls"
                />
              </Stack>
            </Card>

            <div>
              <Title order={3}>Embedding Configuration</Title>
              <Text c="dimmed" size="sm" mb="md">
                Vector embedding settings
              </Text>
            </div>

            <Card withBorder p="md">
              <Stack gap="md">
                <Select
                  label="Embedding Model"
                  value={settings.embeddingModel}
                  onChange={(value) => handleSettingChange('embeddingModel', value || 'text-embedding-004')}
                  data={[
                    { value: 'text-embedding-004', label: 'text-embedding-004 (768-dim)' },
                    { value: 'text-embedding-3-large', label: 'text-embedding-3-large (3072-dim)' },
                    { value: 'text-embedding-3-small', label: 'text-embedding-3-small (512-dim)' },
                  ]}
                  description="Choose which embedding model to use"
                />

                <Divider />

                <Paper p="sm" bg="gray.1">
                  <Text size="sm" fw={500} mb="xs">
                    Embedding Dimension: {settings.embeddingDimension}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Read-only. Determined by selected embedding model.
                  </Text>
                </Paper>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Advanced Tab */}
        <Tabs.Panel value="advanced" pt="md">
          <Stack gap="md">
            <Alert icon={<IconAlertCircle size={16} />} title="Advanced Settings">
              These settings are for debugging and advanced use cases. Modify with caution.
            </Alert>

            <Card withBorder p="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Debug Mode</Text>
                    <Text size="sm" c="dimmed">
                      Enable additional logging and debug information
                    </Text>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onChange={(e) => handleSettingChange('debugMode', e.currentTarget.checked)}
                  />
                </Group>

                <Divider />

                <Select
                  label="Log Level"
                  value={settings.logLevel}
                  onChange={(value) =>
                    handleSettingChange('logLevel', value as 'debug' | 'info' | 'warn' | 'error')
                  }
                  data={[
                    { value: 'debug', label: 'Debug (Most Verbose)' },
                    { value: 'info', label: 'Info' },
                    { value: 'warn', label: 'Warn' },
                    { value: 'error', label: 'Error (Least Verbose)' },
                  ]}
                  description="Controls verbosity of logging output"
                />

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Local Storage Size</Text>
                    <Text size="sm" c="dimmed">
                      {(() => {
                        const stored = localStorage.getItem('user_settings');
                        return stored ? `${(stored.length / 1024).toFixed(2)} KB` : 'Empty';
                      })()}
                    </Text>
                  </div>
                </Group>

                <Divider />

                <Group>
                  <Button size="sm" variant="light" onClick={exportSettings}>
                    Export Settings
                  </Button>
                  <Button size="sm" color="red" variant="light" onClick={resetSettings}>
                    Reset to Defaults
                  </Button>
                </Group>
              </Stack>
            </Card>

            <div>
              <Title order={3}>Current Configuration</Title>
              <Text c="dimmed" size="sm" mb="md">
                JSON representation of current settings
              </Text>
            </div>

            <Paper withBorder p="md" style={{ overflow: 'auto' }}>
              <Code block>{JSON.stringify(settings, null, 2)}</Code>
            </Paper>
          </Stack>
        </Tabs.Panel>

        {/* Export Tab */}
        <Tabs.Panel value="export" pt="md">
          <Stack gap="md">
            <div>
              <Title order={3}>Settings Management</Title>
              <Text c="dimmed" size="sm" mb="md">
                Export or manage your settings
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Card withBorder p="md">
                <Stack gap="md">
                  <div>
                    <Title order={4}>Export Settings</Title>
                    <Text size="sm" c="dimmed" mb="md">
                      Download your current settings as a JSON file for backup
                    </Text>
                  </div>
                  <Button onClick={exportSettings} variant="light">
                    Download Settings
                  </Button>
                </Stack>
              </Card>

              <Card withBorder p="md">
                <Stack gap="md">
                  <div>
                    <Title order={4}>Reset to Defaults</Title>
                    <Text size="sm" c="dimmed" mb="md">
                      Restore all settings to their default values
                    </Text>
                  </div>
                  <Button onClick={resetSettings} color="red" variant="light">
                    Reset All
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>

            <div>
              <Title order={3}>Settings Summary</Title>
              <Text c="dimmed" size="sm" mb="md">
                Overview of your configuration
              </Text>
            </div>

            <Card withBorder p="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <div>
                  <Text fw={500} mb="xs">
                    Features Enabled
                  </Text>
                  <Stack gap="xs">
                    {settings.enableConversationalRAG && (
                      <Badge variant="light" leftSection="✓">
                        Conversational RAG
                      </Badge>
                    )}
                    {settings.enableRagAsEvaluation && (
                      <Badge variant="light" leftSection="✓">
                        RAGAS Evaluation
                      </Badge>
                    )}
                    {settings.enableConversationHistory && (
                      <Badge variant="light" leftSection="✓">
                        Conversation History
                      </Badge>
                    )}
                    {settings.enableAnalytics && (
                      <Badge variant="light" leftSection="✓">
                        Analytics
                      </Badge>
                    )}
                    {settings.enableNotifications && (
                      <Badge variant="light" leftSection="✓">
                        Notifications
                      </Badge>
                    )}
                  </Stack>
                </div>

                <div>
                  <Text fw={500} mb="xs">
                    Key Parameters
                  </Text>
                  <Stack gap="xs" size="sm">
                    <Text>Temperature: {settings.temperature}</Text>
                    <Text>Max Tokens: {settings.maxTokens}</Text>
                    <Text>Similarity Threshold: {settings.similarityThreshold}</Text>
                    <Text>Top K: {settings.topKChunks}</Text>
                  </Stack>
                </div>
              </SimpleGrid>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Save/Reset Buttons */}
      <Group justify="flex-end" mt="lg" sticky>
        <Button
          variant="light"
          onClick={resetSettings}
          disabled={!hasChanges}
          leftSection={<IconRefresh size={16} />}
        >
          Discard Changes
        </Button>
        <Button
          onClick={saveSettings}
          disabled={!hasChanges}
          leftSection={<IconCheck size={16} />}
        >
          Save Settings
        </Button>
      </Group>
    </Container>
  );
};

export default Settings;