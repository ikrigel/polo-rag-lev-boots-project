import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Card,
  Modal,
  TextInput,
  Textarea,
  Table,
  Progress,
  ActionIcon,
  Tooltip,
  Center,
  Loader,
  Tabs,
  SimpleGrid,
  LineChart,
  BarChart,
  Select,
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconPlay,
  IconDownload,
} from '@tabler/icons-react';

interface GroundTruthPair {
  id: string;
  question: string;
  expectedAnswer: string;
  createdAt: number;
}

interface EvaluationResult {
  pairId: string;
  actualAnswer: string;
  ragas_score: number;
  faithfulness: number;
  relevance: number;
  coherence: number;
  timestamp: number;
}

interface EvaluationMetrics {
  totalEvaluations: number;
  avgRagasScore: number;
  avgFaithfulness: number;
  avgRelevance: number;
  avgCoherence: number;
  results: EvaluationResult[];
}

interface ScoreTrend {
  date: string;
  avgScore: number;
  count: number;
}

const RagAs: React.FC = () => {
  const [groundTruthPairs, setGroundTruthPairs] = useState<GroundTruthPair[]>([]);
  const [evaluationMetrics, setEvaluationMetrics] = useState<EvaluationMetrics>({
    totalEvaluations: 0,
    avgRagasScore: 0,
    avgFaithfulness: 0,
    avgRelevance: 0,
    avgCoherence: 0,
    results: [],
  });
  const [scoreTrends, setScoreTrends] = useState<ScoreTrend[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  const [newQuestion, setNewQuestion] = useState('');
  const [newExpectedAnswer, setNewExpectedAnswer] = useState('');

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [pairToDelete, setPairToDelete] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedPairs = localStorage.getItem('ragas_ground_truth_pairs');
    const storedMetrics = localStorage.getItem('ragas_evaluation_metrics');
    const storedTrends = localStorage.getItem('ragas_score_trends');

    if (storedPairs) {
      try {
        setGroundTruthPairs(JSON.parse(storedPairs));
      } catch (e) {
        console.error('Failed to load ground truth pairs:', e);
      }
    }

    if (storedMetrics) {
      try {
        setEvaluationMetrics(JSON.parse(storedMetrics));
      } catch (e) {
        console.error('Failed to load evaluation metrics:', e);
      }
    }

    if (storedTrends) {
      try {
        setScoreTrends(JSON.parse(storedTrends));
      } catch (e) {
        console.error('Failed to load score trends:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('ragas_ground_truth_pairs', JSON.stringify(groundTruthPairs));
  }, [groundTruthPairs]);

  useEffect(() => {
    localStorage.setItem('ragas_evaluation_metrics', JSON.stringify(evaluationMetrics));
  }, [evaluationMetrics]);

  useEffect(() => {
    localStorage.setItem('ragas_score_trends', JSON.stringify(scoreTrends));
  }, [scoreTrends]);

  const addGroundTruthPair = () => {
    if (!newQuestion.trim() || !newExpectedAnswer.trim()) return;

    const newPair: GroundTruthPair = {
      id: `pair_${Date.now()}`,
      question: newQuestion,
      expectedAnswer: newExpectedAnswer,
      createdAt: Date.now(),
    };

    setGroundTruthPairs([...groundTruthPairs, newPair]);
    setNewQuestion('');
    setNewExpectedAnswer('');
    setShowAddModal(false);
  };

  const deleteGroundTruthPair = () => {
    if (!pairToDelete) return;
    setGroundTruthPairs(groundTruthPairs.filter((p) => p.id !== pairToDelete));
    setShowDeleteModal(false);
    setPairToDelete(null);
  };

  const calculateScores = (actual: string, expected: string): Omit<EvaluationResult, 'pairId' | 'timestamp'> => {
    // Simplified RAGAS scoring - in production, use proper RAGAS evaluation library
    const actualWords = actual.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
    const expectedWords = expected.toLowerCase().split(/\s+/).filter((w) => w.length > 0);

    // Faithfulness: How much of the actual answer is supported by expected
    const intersection = actualWords.filter((w) => expectedWords.includes(w)).length;
    const faithfulness = intersection > 0 ? (intersection / actualWords.length) * 100 : 0;

    // Relevance: How much of expected answer is in actual
    const relevance = intersection > 0 ? (intersection / expectedWords.length) * 100 : 0;

    // Coherence: Basic coherence based on sentence structure
    const sentenceCount = actual.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const coherence = Math.min(sentenceCount * 20, 100);

    // RAGAS score: Average of all metrics
    const ragasScore = (faithfulness + relevance + coherence) / 3;

    return {
      actualAnswer: actual,
      ragas_score: Math.round(ragasScore * 100) / 100,
      faithfulness: Math.round(faithfulness * 100) / 100,
      relevance: Math.round(relevance * 100) / 100,
      coherence: Math.round(coherence * 100) / 100,
    };
  };

  const runEvaluation = async () => {
    if (groundTruthPairs.length === 0) return;

    setIsEvaluating(true);
    setEvaluationProgress(0);

    const newResults: EvaluationResult[] = [];

    for (let i = 0; i < groundTruthPairs.length; i++) {
      const pair = groundTruthPairs[i];
      setEvaluationProgress(((i + 1) / groundTruthPairs.length) * 100);

      try {
        // Call the API to get actual answer
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userQuestion: pair.question }),
        });

        if (response.ok) {
          const data = await response.json();
          const scores = calculateScores(data.answer || '', pair.expectedAnswer);

          newResults.push({
            pairId: pair.id,
            ...scores,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        console.error('Evaluation error:', err);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Update metrics
    if (newResults.length > 0) {
      const avgRagasScore =
        newResults.reduce((sum, r) => sum + r.ragas_score, 0) / newResults.length;
      const avgFaithfulness =
        newResults.reduce((sum, r) => sum + r.faithfulness, 0) / newResults.length;
      const avgRelevance =
        newResults.reduce((sum, r) => sum + r.relevance, 0) / newResults.length;
      const avgCoherence =
        newResults.reduce((sum, r) => sum + r.coherence, 0) / newResults.length;

      setEvaluationMetrics({
        totalEvaluations: evaluationMetrics.totalEvaluations + newResults.length,
        avgRagasScore,
        avgFaithfulness,
        avgRelevance,
        avgCoherence,
        results: [...evaluationMetrics.results, ...newResults].slice(-50), // Keep last 50
      });

      // Update trends
      const today = new Date().toISOString().split('T')[0];
      const existingTrend = scoreTrends.find((t) => t.date === today);

      if (existingTrend) {
        existingTrend.avgScore =
          (existingTrend.avgScore * existingTrend.count + avgRagasScore) /
          (existingTrend.count + 1);
        existingTrend.count += 1;
        setScoreTrends([...scoreTrends]);
      } else {
        setScoreTrends([
          ...scoreTrends,
          { date: today, avgScore: avgRagasScore, count: 1 },
        ]);
      }
    }

    setIsEvaluating(false);
    setShowEvaluationModal(false);
  };

  const exportMetrics = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: evaluationMetrics,
      trends: scoreTrends,
      groundTruthPairs: groundTruthPairs.length,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ragas_metrics_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const chartData =
    scoreTrends.length > 0
      ? scoreTrends.map((trend) => ({
          date: trend.date,
          score: Math.round(trend.avgScore * 100) / 100,
        }))
      : [];

  const metricsChartData = [
    { metric: 'RAGAS', value: Math.round(evaluationMetrics.avgRagasScore * 100) / 100 },
    {
      metric: 'Faithfulness',
      value: Math.round(evaluationMetrics.avgFaithfulness * 100) / 100,
    },
    { metric: 'Relevance', value: Math.round(evaluationMetrics.avgRelevance * 100) / 100 },
    { metric: 'Coherence', value: Math.round(evaluationMetrics.avgCoherence * 100) / 100 },
  ];

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        RAGAS Evaluation
      </Title>

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="ground-truth">Ground Truth Pairs ({groundTruthPairs.length})</Tabs.Tab>
          <Tabs.Tab value="results">Evaluation Results ({evaluationMetrics.results.length})</Tabs.Tab>
          <Tabs.Tab value="trends">Trends</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={3}>Evaluation Summary</Title>
                <Text c="dimmed" size="sm">
                  Total evaluations: {evaluationMetrics.totalEvaluations}
                </Text>
              </div>
              <Group>
                <Button
                  onClick={() => setShowEvaluationModal(true)}
                  leftSection={<IconPlay size={16} />}
                >
                  Run Evaluation
                </Button>
                <Button
                  variant="light"
                  onClick={exportMetrics}
                  leftSection={<IconDownload size={16} />}
                >
                  Export Metrics
                </Button>
              </Group>
            </Group>

            {/* Metrics Cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      RAGAS Score
                    </Text>
                    <Badge
                      color={getScoreColor(evaluationMetrics.avgRagasScore)}
                      variant="light"
                    >
                      {Math.round(evaluationMetrics.avgRagasScore * 100) / 100}
                    </Badge>
                  </Group>
                  <Progress
                    value={evaluationMetrics.avgRagasScore}
                    color={getScoreColor(evaluationMetrics.avgRagasScore)}
                    size="lg"
                  />
                </Stack>
              </Card>

              <Card withBorder p="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Faithfulness
                    </Text>
                    <Badge
                      color={getScoreColor(evaluationMetrics.avgFaithfulness)}
                      variant="light"
                    >
                      {Math.round(evaluationMetrics.avgFaithfulness * 100) / 100}
                    </Badge>
                  </Group>
                  <Progress
                    value={evaluationMetrics.avgFaithfulness}
                    color={getScoreColor(evaluationMetrics.avgFaithfulness)}
                    size="lg"
                  />
                </Stack>
              </Card>

              <Card withBorder p="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Relevance
                    </Text>
                    <Badge
                      color={getScoreColor(evaluationMetrics.avgRelevance)}
                      variant="light"
                    >
                      {Math.round(evaluationMetrics.avgRelevance * 100) / 100}
                    </Badge>
                  </Group>
                  <Progress
                    value={evaluationMetrics.avgRelevance}
                    color={getScoreColor(evaluationMetrics.avgRelevance)}
                    size="lg"
                  />
                </Stack>
              </Card>

              <Card withBorder p="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Coherence
                    </Text>
                    <Badge
                      color={getScoreColor(evaluationMetrics.avgCoherence)}
                      variant="light"
                    >
                      {Math.round(evaluationMetrics.avgCoherence * 100) / 100}
                    </Badge>
                  </Group>
                  <Progress
                    value={evaluationMetrics.avgCoherence}
                    color={getScoreColor(evaluationMetrics.avgCoherence)}
                    size="lg"
                  />
                </Stack>
              </Card>
            </SimpleGrid>

            {/* Metrics Bar Chart */}
            {metricsChartData.length > 0 && (
              <Paper withBorder p="md">
                <Title order={4} mb="md">
                  Metrics Comparison
                </Title>
                <BarChart data={metricsChartData} dataKey="metric" series={[{ name: 'Score', color: 'blue' }]} />
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="ground-truth" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={3}>Ground Truth Q&A Pairs</Title>
                <Text c="dimmed" size="sm">
                  Define the expected behavior for evaluation
                </Text>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                leftSection={<IconPlus size={16} />}
              >
                Add Pair
              </Button>
            </Group>

            {groundTruthPairs.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <Text c="dimmed">No ground truth pairs yet</Text>
                  <Button size="sm" variant="light" onClick={() => setShowAddModal(true)}>
                    Create First Pair
                  </Button>
                </Stack>
              </Center>
            ) : (
              <Stack gap="sm">
                {groundTruthPairs.map((pair) => (
                  <Card key={pair.id} withBorder p="md">
                    <Group justify="space-between" mb="sm">
                      <Badge>Q&A Pair</Badge>
                      <Tooltip label="Delete">
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => {
                            setPairToDelete(pair.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <Stack gap="sm">
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Question
                        </Text>
                        <Paper p="sm" bg="gray.1">
                          <Text size="sm">{pair.question}</Text>
                        </Paper>
                      </div>
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Expected Answer
                        </Text>
                        <Paper p="sm" bg="gray.1">
                          <Text size="sm">{pair.expectedAnswer}</Text>
                        </Paper>
                      </div>
                      <Text size="xs" c="dimmed">
                        Added: {new Date(pair.createdAt).toLocaleDateString()}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="results" pt="md">
          <Stack gap="md">
            <Title order={3}>Recent Evaluation Results</Title>

            {evaluationMetrics.results.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">No evaluation results yet. Run an evaluation to see results.</Text>
              </Center>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Question ID</Table.Th>
                    <Table.Th>RAGAS Score</Table.Th>
                    <Table.Th>Faithfulness</Table.Th>
                    <Table.Th>Relevance</Table.Th>
                    <Table.Th>Coherence</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {evaluationMetrics.results.slice(-20).map((result) => (
                    <Table.Tr key={`${result.pairId}_${result.timestamp}`}>
                      <Table.Td>
                        <Text size="sm" c="blue">
                          {result.pairId.slice(0, 10)}...
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getScoreColor(result.ragas_score)}>
                          {Math.round(result.ragas_score * 100) / 100}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getScoreColor(result.faithfulness)} variant="light">
                          {Math.round(result.faithfulness * 100) / 100}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getScoreColor(result.relevance)} variant="light">
                          {Math.round(result.relevance * 100) / 100}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getScoreColor(result.coherence)} variant="light">
                          {Math.round(result.coherence * 100) / 100}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {new Date(result.timestamp).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="trends" pt="md">
          <Stack gap="md">
            <Title order={3}>Score Trends</Title>

            {chartData.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">No trend data yet. Run evaluations to see trends.</Text>
              </Center>
            ) : (
              <Paper withBorder p="md">
                <LineChart
                  data={chartData}
                  dataKey="date"
                  series={[{ name: 'Average Score', color: 'blue' }]}
                  curveType="monotone"
                  height={300}
                />
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Add Ground Truth Modal */}
      <Modal
        opened={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Ground Truth Q&A Pair"
      >
        <Stack gap="md">
          <Textarea
            label="Question"
            placeholder="Enter the test question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.currentTarget.value)}
            minRows={3}
          />
          <Textarea
            label="Expected Answer"
            placeholder="Enter the expected answer"
            value={newExpectedAnswer}
            onChange={(e) => setNewExpectedAnswer(e.currentTarget.value)}
            minRows={4}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={addGroundTruthPair}>Add Pair</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Ground Truth Pair"
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete this ground truth pair?</Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={deleteGroundTruthPair}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Evaluation Modal */}
      <Modal
        opened={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        title="Run Evaluation"
      >
        <Stack gap="md">
          {isEvaluating ? (
            <>
              <Text>Evaluating {groundTruthPairs.length} Q&A pairs...</Text>
              <Progress value={evaluationProgress} />
              <Text size="sm" c="dimmed" ta="center">
                {Math.round(evaluationProgress)}% complete
              </Text>
            </>
          ) : (
            <>
              <Text>
                This will run evaluations on all {groundTruthPairs.length} ground truth pairs.
              </Text>
              <Text size="sm" c="dimmed">
                This may take several minutes depending on the number of pairs.
              </Text>
              <Group justify="flex-end">
                <Button variant="light" onClick={() => setShowEvaluationModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={runEvaluation}
                  disabled={groundTruthPairs.length === 0}
                  leftSection={<IconPlay size={16} />}
                >
                  Start Evaluation
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </Container>
  );
};

export default RagAs;