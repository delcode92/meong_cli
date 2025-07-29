import { Message } from './types';
import { OllamaAPI } from './api';

/**
 * Calculates the cosine similarity between two vectors.
 * @param vecA The first vector.
 * @param vecB The second vector.
 * @returns The cosine similarity score.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    // This shouldn't happen if embeddings are from the same model
    return 0;
  }
  const dotProduct = vecA.map((val, i) => val * vecB[i]).reduce((sum, curr) => sum + curr, 0);
  const magnitudeA = Math.sqrt(vecA.map(val => val * val).reduce((sum, curr) => sum + curr, 0));
  const magnitudeB = Math.sqrt(vecB.map(val => val * val).reduce((sum, curr) => sum + curr, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the most relevant messages from history based on the current message.
 * @param currentMessage The current user message.
 * @param history The entire chat history.
 * @param maxHistory The maximum number of history messages to return.
 * @param api The OllamaAPI instance to use for generating embeddings.
 * @returns A promise that resolves to an array of the most relevant messages.
 */
export async function getRelevantHistory(
  currentMessage: Message,
  history: Message[],
  maxHistory: number,
  api: OllamaAPI
): Promise<Message[]> {
  if (history.length === 0 || maxHistory === 0) {
    return [];
  }

  try {
    // Get embedding for the current message
    const currentEmbedding = await api.getEmbedding(currentMessage.content);

    // We only care about previous user questions and their corresponding answers.
    // Let's pair them up. A simple way is to assume history is [user, assistant, user, assistant, ...].
    const conversationPairs: { user: Message; assistant: Message }[] = [];
    for (let i = 0; i < history.length - 1; i += 2) {
      if (history[i].role === 'user' && history[i+1].role === 'assistant') {
        conversationPairs.push({ user: history[i], assistant: history[i+1] });
      }
    }

    if (conversationPairs.length === 0) {
        return [];
    }

    // Get embeddings for all past user messages
    const historyEmbeddings = await Promise.all(
      conversationPairs.map(pair => api.getEmbedding(pair.user.content))
    );

    // Calculate similarity scores
    const similarities = historyEmbeddings.map(histEmbedding => 
      cosineSimilarity(currentEmbedding, histEmbedding)
    );

    // Combine pairs with their scores
    const scoredPairs = conversationPairs.map((pair, index) => ({
      ...pair,
      score: similarities[index],
    }));

    // Sort by score in descending order
    scoredPairs.sort((a, b) => b.score - a.score);

    // Get the top N pairs
    const topPairs = scoredPairs.slice(0, maxHistory);

    // Flatten the pairs back into a single message array
    const relevantHistory: Message[] = topPairs.flatMap(pair => [pair.user, pair.assistant]);
    
    console.log(`\n[INFO] Selected ${topPairs.length} most relevant conversations from history.`);

    return relevantHistory;
  } catch (error) {
    console.error('\n[Error] Could not determine relevant history, falling back to recent history.', error);
    // Fallback to just taking the most recent items if embedding fails
    const historyCount = Math.min(history.length, maxHistory * 2); // *2 for user/assistant pairs
    return history.slice(-historyCount);
  }
}