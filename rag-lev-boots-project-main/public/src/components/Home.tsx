import { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Text, Loader, Flex, TextInput, Paper, Title, Button, Alert } from '@mantine/core';
import { IconSend, IconAlertCircle, IconCheck } from '@tabler/icons-react';

interface ApiResponse {
  answer: string;
  sources?: string[];
  bibliography?: string[];
}

const RAGInterface = observer(() => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loadDataMessage, setLoadDataMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if data is already loaded on component mount
  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      // Check if knowledge base has entries by making a test query
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuestion: 'test' }),
      });
      const data = await response.json();

      // Data is only loaded if we get a proper answer (not empty)
      // Empty answer with "No entries in knowledge base" means KB is not ready
      if (data.answer && data.answer.trim() && !data.answer.includes('No entries')) {
        setIsDataLoaded(true);
      } else {
        setIsDataLoaded(false);
      }
    } catch {
      setIsDataLoaded(false);
    }
  };

  const loadData = async () => {
    setIsLoadingData(true);
    setLoadDataMessage('');
    setError('');

    try {
      console.log('📍 Calling /api/load_data endpoint...');

      // Create abort controller with 5 minute timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

      const response = await fetch('/api/load_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const text = await response.text();
      console.log('Response body:', text);

      if (!text) {
        throw new Error('Server returned an empty response');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Failed to parse response: ${text}`);
      }

      console.log('Parsed data:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.ok || data.success) {
        setIsDataLoaded(true);
        setLoadDataMessage('✅ Data loaded successfully! You can now ask questions.');
        setTimeout(() => setLoadDataMessage(''), 5000);
      } else {
        throw new Error(data.error || 'Failed to load data');
      }
    } catch (err) {
      let errorMsg = 'Failed to load data';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMsg = 'Request timed out after 5 minutes. The server may be experiencing issues. Please try again.';
        } else {
          errorMsg = err.message;
        }
      }

      console.error('❌ Error loading data:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleQuestionClick = (questionText: string) => {
    setQuestion(questionText);
    inputRef.current?.focus();
  };

  const submitQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userQuestion: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      submitQuestion();
    }
  };

  const renderGuidingQuestion = (question: string) => (
    <span
      className='guiding-question'
      onClick={() => handleQuestionClick(question)}
    >
      {question}
    </span>
  );

  return (
    <Flex
      w={'100%'}
      p={'xl'}
      align={'center'}
      style={{ justifySelf: 'center' }}
      direction={'column'}
      gap={'xl'}
    >
      <Title order={3}>Basic RAG Interface</Title>

      {!isDataLoaded && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Knowledge Base Not Loaded"
          color="yellow"
          w={'100%'}
        >
          <Flex direction={'column'} gap={'sm'}>
            <Text size={'sm'}>
              Load the knowledge base first to start asking questions about Lev-Boots.
            </Text>
            <Button
              onClick={loadData}
              loading={isLoadingData}
              disabled={isLoadingData}
              size={'sm'}
              w={'fit-content'}
            >
              {isLoadingData ? 'Loading Data...' : 'Load Knowledge Base'}
            </Button>
          </Flex>
        </Alert>
      )}

      {loadDataMessage && (
        <Alert
          icon={<IconCheck size={16} />}
          title="Success"
          color="green"
          w={'100%'}
        >
          {loadDataMessage}
        </Alert>
      )}

      <Flex direction={'column'} gap={'xs'}>
        <TextInput
          ref={inputRef}
          w={'100%'}
          size={'lg'}
          radius={'xl'}
          variant='filled'
          placeholder={isDataLoaded ? 'Ask anything about LevBoots' : 'Load data first...'}
          value={question}
          onChange={(event) => setQuestion(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          disabled={!isDataLoaded}
          rightSection={
            <IconSend
              style={{ cursor: isDataLoaded ? 'pointer' : 'not-allowed', opacity: isDataLoaded ? 1 : 0.5 }}
              size={16}
              onClick={submitQuestion}
            />
          }
          autoFocus={isDataLoaded}
        />
        <Text fz={'xs'} c={'dimmed'}>
          Suggestions: {renderGuidingQuestion('How do levboots work?')}
          {' • '}
          {renderGuidingQuestion('What are some safety features?')}
          {' • '}
          {renderGuidingQuestion(
            'How much is the custom bootskin market worth?'
          )}
        </Text>
      </Flex>

      {isLoading && (
        <Flex align='center' gap='md'>
          <Loader size='sm' />
          <Text>Getting your answer...</Text>
        </Flex>
      )}

      {error && (
        <Paper p='md' bg='red.1' c='red.8' w='100%'>
          <Text size='sm'>{error}</Text>
        </Paper>
      )}

      {response && !isLoading && response.answer && (
        <Flex p='lg' direction={'column'} align={'start'} w={'100%'} gap={'lg'}>
          <div style={{ width: '100%' }}>
            <Title order={4} mb={'sm'}>Answer</Title>
            <Paper p='md' style={{ width: '100%' }}>
              <Text style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{response.answer}</Text>
            </Paper>
          </div>
          {response.bibliography && response.bibliography.length > 0 && (
            <div style={{ width: '100%' }}>
              <Title order={4} mb={'sm'}>Bibliography</Title>
              <Paper p='md' style={{ width: '100%' }}>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.6', margin: 0 }}>
                  {response.bibliography.map((source, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>
                      {source}
                    </li>
                  ))}
                </ol>
              </Paper>
            </div>
          )}
        </Flex>
      )}
    </Flex>
  );
});

export default RAGInterface;
