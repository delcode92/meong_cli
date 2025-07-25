import fetch from 'node-fetch';
import { ChatRequest, ChatResponse, Message } from './types';
import { getConfig } from './config';

export class OllamaAPI {
  private config = getConfig();

  async *streamChat(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const request: ChatRequest = {
      model: this.config.model,
      stream: true,
      messages: messages
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

      const reader = response.body;
      let buffer = '';

      reader.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data: ChatResponse = JSON.parse(line);
              if (data.message && data.message.content) {
                // Emit each content chunk
                process.stdout.write(data.message.content);
              }
            } catch (error) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      });

      // Return a promise that resolves when the stream is complete
      return new Promise<void>((resolve, reject) => {
        let fullResponse = '';
        
        reader.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data: ChatResponse = JSON.parse(line);
                if (data.message && data.message.content) {
                  fullResponse += data.message.content;
                }
                if (data.done) {
                  resolve();
                  return;
                }
              } catch (error) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        });

        reader.on('error', reject);
        reader.on('end', () => resolve());
      });

    } catch (error) {
      throw new Error(`Failed to connect to Ollama API: ${error}`);
    }
  }

  async sendMessage(messages: Message[]): Promise<string> {
    const request: ChatRequest = {
      model: this.config.model,
      stream: false,
      messages: messages
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