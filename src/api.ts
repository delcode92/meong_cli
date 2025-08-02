import fetch from 'node-fetch';
import { Readable } from 'stream';
import { InferenceClient } from '@huggingface/inference';
import { ChatRequest, ChatResponse, Message, EmbeddingRequest, EmbeddingResponse, Config } from './types';
import { getConfig } from './config';

export class OllamaAPI {
  private config: Config;
  private hfClient?: InferenceClient;

  constructor(config?: Config) {
    this.config = config || getConfig();
    if (this.config.apiProvider === 'huggingface' || this.config.apiProvider === 'hf-inference') {
      this.hfClient = new InferenceClient(this.config.hfToken);
    }
  }

  /**
   * Gets the messages formatted for the API request, including a system prompt
   * and a limited history (windowed history).
   * @param messages The full array of chat messages.
   * @returns A new array of messages formatted for the API.
   */
  private getWindowedMessages(messages: Message[]): Message[] {
    const systemMessage: Message = { 
      role: 'system', 
      content: '/no_think You are a command-line assistant. answer with english.' 
      // content: '/no_think' 
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
    if (this.config.apiProvider === 'huggingface' || this.config.apiProvider === 'hf-inference') {
      yield* this.streamChatHuggingFace(messages);
    } else {
      yield* this.streamChatOllama(messages);
    }
  }

  private async *streamChatHuggingFace(messages: Message[]): AsyncGenerator<string> {
    if (!this.hfClient) {
      throw new Error("Hugging Face client is not initialized.");
    }
    // console.log("here ....");
    // First, create a version of messages without the timestamp for windowing
    const baseMessages = messages.map(({ role, content }) => ({ role, content }));
    const windowedMessages = this.getWindowedMessages(baseMessages);

    // Final clean for the API call
    const finalMessages = windowedMessages.map(({ role, content }) => ({ role, content }));
    // console.log(finalMessages);

    // const params: any = {
    //   model: this.config.hfModel, // Use model from config
    //   messages: finalMessages,
    //   temperature: this.config.temperature,
    //   top_p: this.config.top_p,
    // };

    // if (this.config.apiProvider === 'hf-inference') {
    //   params.provider = 'hf-inference';
    // }
    
    const stream = this.hfClient.chatCompletionStream({
      provider: "hf-inference",
      model: "HuggingFaceTB/SmolLM3-3B",
      messages: finalMessages
    });

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta?.content;
        if (newContent) {
          yield newContent;
        }
      }
    }
  }

  private async *streamChatOllama(messages: Message[]): AsyncGenerator<string> {
    const cleanMessages = messages.map(({ role, content }) => ({ role, content }));
    const request: ChatRequest = {
      model: this.config.model,
      stream: true,
      messages: this.getWindowedMessages(cleanMessages),
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
    if (this.config.apiProvider === 'huggingface') {
      if (!this.hfClient) {
        throw new Error("Hugging Face client is not initialized.");
      }
      try {
        const embedding = await this.hfClient.featureExtraction({
          model: this.config.hfEmbeddingModel,
          inputs: text,
        });
        return Array.isArray(embedding[0]) ? embedding[0] as number[] : embedding as number[];
      } catch (error) {
        throw new Error(`Failed to generate Hugging Face embedding: ${error}`);
      }
    }

    const request: EmbeddingRequest = {
      model: this.config.model,
      prompt: text,
    };

    try {
      const url = new URL(this.config.apiUrl);
      url.pathname = '/api/embeddings';
      const embeddingApiUrl = url.toString();
      
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
      throw new Error(`Failed to generate Ollama embedding: ${error}`);
    }
  }

  /**
   * Sends a request to the Ollama API and waits for the full response.
   * @param messages The array of messages to send.
   * @returns The content of the assistant's response.
   */
  async sendMessage(messages: Message[]): Promise<string> {
    if (this.config.apiProvider === 'huggingface' || this.config.apiProvider === 'hf-inference') {
      let fullResponse = '';
      for await (const chunk of this.streamChatHuggingFace(messages)) {
        fullResponse += chunk;
      }
      return fullResponse;
    } else {
      const cleanMessages = messages.map(({ role, content }) => ({ role, content }));
      const request: ChatRequest = {
        model: this.config.model,
        stream: false,
        messages: this.getWindowedMessages(cleanMessages),
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
}
