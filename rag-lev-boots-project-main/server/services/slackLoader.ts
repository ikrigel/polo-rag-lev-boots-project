import axios from 'axios';

interface SlackMessage {
  channel: string;
  text: string;
  timestamp: string;
}

interface SlackAPIResponse {
  messages: Array<{
    text: string;
    ts: string;
  }>;
  has_more: boolean;
}

const SLACK_API_BASE_URL = 'https://lev-boots-slack-api.jona-581.workers.dev';
const CHANNELS = ['lab-notes', 'engineering', 'offtopic'];
const DELAY_BETWEEN_REQUESTS = 200; // ms to avoid rate limiting

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const loadSlackMessages = async (): Promise<SlackMessage[]> => {
  const results: SlackMessage[] = [];

  for (const channel of CHANNELS) {
    let page = 1;
    let hasMore = true;

    console.log(`\nLoading Slack channel: ${channel}`);

    while (hasMore) {
      try {
        const url = `${SLACK_API_BASE_URL}/?channel=${channel}&page=${page}`;
        await delay(DELAY_BETWEEN_REQUESTS); // Rate limiting

        const response = await axios.get<SlackAPIResponse>(url, { timeout: 10000 });
        const { messages, has_more } = response.data;

        if (!messages || messages.length === 0) {
          hasMore = false;
          break;
        }

        for (const msg of messages) {
          if (msg.text && msg.text.trim()) {
            results.push({
              channel,
              text: msg.text,
              timestamp: msg.ts,
            });
          }
        }

        console.log(`  ✓ Page ${page}: ${messages.length} messages loaded`);

        hasMore = has_more;
        page++;
      } catch (error) {
        console.error(
          `✗ Error loading Slack channel ${channel} page ${page}:`,
          error instanceof Error ? error.message : error
        );
        throw error;
      }
    }

    console.log(`  Total messages from ${channel}: ${results.filter(m => m.channel === channel).length}`);
  }

  return results;
};
