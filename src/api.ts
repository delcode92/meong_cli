import fetch from 'node-fetch';
import { Readable } from 'stream';
import { ChatRequest, ChatResponse, Message, EmbeddingRequest, EmbeddingResponse } from './types';
import { getConfig } from './config';

export class OllamaAPI {
  private config = getConfig();

  /**
   * Gets the messages formatted for the API request, including a system prompt
   * and a limited history (windowed history).
   * @param messages The full array of chat messages.
   * @returns A new array of messages formatted for the API.
   */
  private getWindowedMessages(messages: Message[]): Message[] {
    const systemMessage: Message = { 
      role: 'system', 
      content: 'You are a command-line assistant. Be extremely concise. No chatter. No explanations. Just the answer.' 
    };

    const maxChars = 2048;
    let usedChars = systemMessage.content.length;
    const context: Message[] = [];

    // Always include the most recent message, even if it's very long.
    const latestMessage = messages[messages.length - 1];
    if (latestMessage) {
        // Truncate the latest message if it alone exceeds the limit.
        if (latestMessage.content.length > maxChars) {
            latestMessage.content = latestMessage.content.substring(0, maxChars) + "\n[...TRUNCATED...]";
        }
        context.unshift(latestMessage);
        usedChars += latestMessage.content.length;
    }

    // Add older messages until the character limit is reached.
    for (let i = messages.length - 2; i >= 0; i--) {
      const message = messages[i];
      const messageLength = message.content.length;
      if (usedChars + messageLength > maxChars) {
        break; // Stop if adding the next message would exceed the limit
      }
      context.unshift(message);
      usedChars += messageLength;
    }

    return [systemMessage, ...context];
  }

  /**
   * Sends a request to the Ollama API and streams the response.
   * This is a generator function that yields content chunks as they arrive.
   * @param messages The array of messages to send.
   */
  async *streamChat(messages: Message[]): AsyncGenerator<string> {
    const request: ChatRequest = {
      model: this.config.model,
      stream: true,
      messages: this.getWindowedMessages(messages),
      temperature: this.config.temperature,
      top_p: this.config.top_p,
      repeat_penalty: this.config.repeat_penalty
    };

    try {

      
      
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });



      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body as Readable;
      const decoder = new TextDecoder();
      let buffer = '';

      for await (const chunk of reader) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data: ChatResponse = JSON.parse(line);
              if (data.message && data.message.content) {
                yield data.message.content;
              }
              if (data.done) {
                return; // End the generator
              }
            } catch (error) {
              console.error('\n[Error] Failed to parse stream chunk:', line);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to connect to Ollama API: ${error}`);
    }
  }

  /**
   * Generates an embedding for a given text.
   * @param text The text to generate an embedding for.
   * @returns The embedding vector.
   */
  async getEmbedding(text: string): Promise<number[]> {
    const request: EmbeddingRequest = {
      model: this.config.model,
      prompt: text,
    };

    try {
      // The embeddings endpoint is usually at /api/embeddings
      const embeddingApiUrl = this.config.apiUrl.replace('/api/chat', '/api/embeddings');
      
      const response = await fetch(embeddingApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      const data: EmbeddingResponse = await response.json();
      return data.embedding;
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error}`);
    }
  }

  /**
   * Sends a request to the Ollama API and waits for the full response.
   * @param messages The array of messages to send.
   * @returns The content of the assistant's response.
   */
  async sendMessage(messages: Message[]): Promise<string> {
    const request: ChatRequest = {
      model: this.config.model,
      stream: false,
      messages: this.getWindowedMessages(messages),
      temperature: this.config.temperature,
      top_p: this.config.top_p,
      repeat_penalty: this.config.repeat_penalty
    };

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data.message.content;
    } catch (error) {
      throw new Error(`Failed to connect to Ollama API: ${error}`);
    }
  }
}
