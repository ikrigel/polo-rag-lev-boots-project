import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Title,
  ScrollArea,
  Badge,
  Card,
  Modal,
  ActionIcon,
  Tooltip,
  Progress,
  Tabs,
  Center,
  Loader,
  Divider,
} from '@mantine/core';
import {
  IconSend,
  IconTrash,
  IconDownload,
} from '@tabler/icons-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  questionType?: 'knowledge' | 'general' | 'clarification';
  sources?: string[];
}

interface ConversationSession {
  sessionId: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  contextUsage: number;
}

const ConversationalRAG: React.FC = () => {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextUsage, setContextUsage] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const MAX_CONTEXT_TOKENS = 2000;
  const MESSAGE_TOKEN_ESTIMATE = 100;

  // Load sessions from localStorage on mount
  useEffect(() => {
    const storedSessions = localStorage.getItem('rag_sessions');
    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].sessionId);
          setMessages(parsed[0].messages);
          setContextUsage(parsed[0].contextUsage || 0);
        }
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rag_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const createNewSession = () => {
    const newSessionId = `session_${Date.now()}`;
    const newSession: ConversationSession = {
      sessionId: newSessionId,
      title: `Conversation ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      contextUsage: 0,
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setContextUsage(0);
    setError(null);
  };

  const classifyQuestionType = (question: string): 'knowledge' | 'general' | 'clarification' => {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.startsWith('clarify') || lowerQuestion.includes('what do you mean')) {
      return 'clarification';
    }
    if (
      lowerQuestion.includes('how') ||
      lowerQuestion.includes('what') ||
      lowerQuestion.includes('explain') ||
      lowerQuestion.includes('about levboots')
    ) {
      return 'knowledge';
    }
    return 'general';
  };

  const submitMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
      questionType: classifyQuestionType(inputValue),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuestion: inputValue }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now(),
        sources: data.sources || [],
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Update context usage
      const newContextUsage = contextUsage + MESSAGE_TOKEN_ESTIMATE * 2;
      setContextUsage(Math.min(newContextUsage, MAX_CONTEXT_TOKENS));

      // Update session
      if (currentSessionId) {
        setSessions(
          sessions.map((s) =>
            s.sessionId === currentSessionId
              ? {
                  ...s,
                  messages: updatedMessages,
                  updatedAt: Date.now(),
                  contextUsage: newContextUsage,
                }
              : s
          )
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      const errorMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    if (currentSessionId) {
      setSessions(
        sessions.map((s) =>
          s.sessionId === currentSessionId
            ? { ...s, messages: [], contextUsage: 0, updatedAt: Date.now() }
            : s
        )
      );
      setMessages([]);
      setContextUsage(0);
      setError(null);
    }
    setShowClearModal(false);
  };

  const exportConversation = () => {
    if (!currentSessionId) return;
    const session = sessions.find((s) => s.sessionId === currentSessionId);
    if (!session) return;

    const exportData = {
      title: session.title,
      createdAt: new Date(session.createdAt).toISOString(),
      messages: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
        sources: m.sources,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      setMessages(session.messages);
      setContextUsage(session.contextUsage || 0);
    }
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter((s) => s.sessionId !== sessionId);
    setSessions(updatedSessions);
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        selectSession(updatedSessions[0].sessionId);
      } else {
        setCurrentSessionId(null);
        setMessages([]);
        setContextUsage(0);
      }
    }
  };

  const contextPercentage = (contextUsage / MAX_CONTEXT_TOKENS) * 100;
  const contextWarning = contextPercentage > 80;

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Conversational RAG
      </Title>

      <Tabs defaultValue="chat" orientation="vertical">
        <Tabs.List>
          <Tabs.Tab value="chat">Chat</Tabs.Tab>
          <Tabs.Tab value="sessions">Sessions ({sessions.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="chat" pl="md">
          <Stack gap="md">
            {/* Context Usage Indicator */}
            <Card withBorder p="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  Context Usage
                </Text>
                <Badge color={contextWarning ? 'red' : 'blue'} variant="light">
                  {contextUsage} / {MAX_CONTEXT_TOKENS} tokens
                </Badge>
              </Group>
              <Progress
                value={contextPercentage}
                color={contextWarning ? 'red' : 'blue'}
                size="md"
              />
              {contextWarning && (
                <Text size="xs" c="red" mt="xs">
                  ⚠️ Context window approaching limit. Consider clearing conversation.
                </Text>
              )}
            </Card>

            {/* Messages Display */}
            <Paper withBorder p="md" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <ScrollArea
                viewportRef={scrollViewportRef}
                style={{ flex: 1, marginBottom: '1rem' }}
                type="auto"
              >
                {messages.length === 0 ? (
                  <Center h="100%">
                    <Stack gap="sm" align="center">
                      <Loader size="lg" />
                      <Text c="dimmed">Start a conversation</Text>
                    </Stack>
                  </Center>
                ) : (
                  <Stack gap="sm">
                    {messages.map((msg) => (
                      <Paper
                        key={msg.id}
                        p="sm"
                        radius="md"
                        style={{
                          marginLeft: msg.role === 'user' ? '40%' : '0',
                          marginRight: msg.role === 'user' ? '0' : '40%',
                          backgroundColor:
                            msg.role === 'user' ? '#e7f5ff' : '#f8f9fa',
                        }}
                      >
                        <Group justify="space-between" mb="xs">
                          <Badge size="sm">
                            {msg.role === 'user' ? 'You' : 'Assistant'}
                          </Badge>
                          {msg.questionType && msg.role === 'user' && (
                            <Badge size="xs" variant="dot">
                              {msg.questionType}
                            </Badge>
                          )}
                          <Text size="xs" c="dimmed">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </Text>
                        </Group>
                        <Text size="sm">{msg.content}</Text>
                        {msg.sources && msg.sources.length > 0 && (
                          <>
                            <Divider my="xs" />
                            <Text size="xs" fw={500} c="dimmed">
                              Sources:
                            </Text>
                            <Stack gap="xs" mt="xs">
                              {msg.sources.map((source, idx) => (
                                <Text key={idx} size="xs" c="blue">
                                  • {source}
                                </Text>
                              ))}
                            </Stack>
                          </>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                )}
              </ScrollArea>
            </Paper>

            {/* Error Display */}
            {error && (
              <Paper p="sm" bg="red.1" withBorder>
                <Text size="sm" c="red">
                  {error}
                </Text>
              </Paper>
            )}

            {/* Input Area */}
            <Group gap="sm">
              <TextInput
                placeholder="Type your question... (Shift+Enter to send)"
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.shiftKey) {
                    submitMessage();
                  }
                }}
                disabled={isLoading}
                style={{ flex: 1 }}
              />
              <Tooltip label="Send message">
                <ActionIcon
                  onClick={submitMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="lg"
                  color="blue"
                >
                  {isLoading ? <Loader size="xs" /> : <IconSend size={18} />}
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* Action Buttons */}
            <Group>
              <Button
                size="sm"
                variant="light"
                onClick={() => setShowClearModal(true)}
                leftSection={<IconTrash size={16} />}
              >
                Clear Conversation
              </Button>
              <Button
                size="sm"
                variant="light"
                onClick={() => setShowExportModal(true)}
                leftSection={<IconDownload size={16} />}
              >
                Export
              </Button>
              <Button size="sm" variant="light" onClick={createNewSession}>
                New Conversation
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="sessions" pl="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Conversation History</Title>
              <Badge>{sessions.length} sessions</Badge>
            </Group>

            {sessions.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">No conversations yet</Text>
              </Center>
            ) : (
              <Stack gap="sm">
                {sessions.map((session) => (
                  <Card
                    key={session.sessionId}
                    p="md"
                    withBorder
                    style={{
                      backgroundColor:
                        currentSessionId === session.sessionId
                          ? '#e7f5ff'
                          : undefined,
                      cursor: 'pointer',
                    }}
                  >
                    <Group justify="space-between">
                      <div
                        style={{ flex: 1 }}
                        onClick={() => selectSession(session.sessionId)}
                      >
                        <Text fw={500}>{session.title}</Text>
                        <Text size="xs" c="dimmed">
                          {session.messages.length} messages •{' '}
                          {new Date(session.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <Group gap="xs">
                        <Tooltip label="Delete">
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => deleteSession(session.sessionId)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Clear Confirmation Modal */}
      <Modal
        opened={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Conversation"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to clear all messages in this conversation? This action cannot
            be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={clearConversation}>
              Clear
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Export Confirmation Modal */}
      <Modal
        opened={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Conversation"
      >
        <Stack gap="md">
          <Text>Export this conversation as a JSON file for backup or sharing.</Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={exportConversation} leftSection={<IconDownload size={16} />}>
              Download
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default ConversationalRAG;