// Make sure you've reviewed the README.md file to understand the task and the RAG flow

export { loadAllData, clearKnowledgeBase } from './dataLoader.js';
export { askAI, getQuestionStats } from '../BusinessLogic/AskAI.js';

export const ask = async (userQuestion: string) => {
  try {
    const response = await (await import('../BusinessLogic/AskAI.js')).askAI(userQuestion);

    if (response.error) {
      return {
        answer: '',
        sources: [],
        bibliography: [],
        error: response.error,
      };
    }

    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      answer: '',
      sources: [],
      bibliography: [],
      error: `Failed to get answer: ${errorMsg}`,
    };
  }
};
