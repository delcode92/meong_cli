import { Config, ApiProvider } from './types';
import * as path from 'path';
import * as os from 'os';
import dotenv from 'dotenv';

// Load .env from root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const defaultConfig: Config = {
  apiProvider: 'hf-inference',
  apiUrl: 'http://localhost:11434/api/chat',
  model: 'smollm',
  hfModel: 'HuggingFaceTB/SmolLM3-3B',
  hfEmbeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
  hfToken: undefined, // No default token
  maxHistory: 3,
  historyFile: path.join(os.homedir(), '.meong-cli-history.json'),
  temperature: 0.2,
  top_p: 0.9,
  repeat_penalty: 1.2
};

export function getConfig(options: Partial<Config> = {}): Config {
  // Create a cleaned-up options object that only contains defined values
  const cleanedOptions: Partial<Config> = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .reduce((obj, [key, value]) => {
      (obj as any)[key] = value;
      return obj;
    }, {} as Partial<Config>);

  // Precedence: 1. Env variables -> 2. CLI options -> 3. Default config
  const config: Config = {
    ...defaultConfig,
    // Environment variables provide a base
    apiProvider: (process.env.API_PROVIDER as ApiProvider) || defaultConfig.apiProvider,
    apiUrl: process.env.OLLAMA_API_URL || defaultConfig.apiUrl,
    model: process.env.OLLAMA_MODEL || defaultConfig.model,
    hfToken: process.env.HF_TOKEN || defaultConfig.hfToken,
    hfModel: process.env.HF_MODEL || defaultConfig.hfModel,
    hfEmbeddingModel: process.env.HF_EMBEDDING_MODEL || defaultConfig.hfEmbeddingModel,
    // CLI options override everything else
    ...cleanedOptions,
  };

  // Special handling for hfToken to ensure CLI doesn't nullify it
  if (cleanedOptions.apiProvider === 'huggingface' && !config.hfToken) {
    config.hfToken = process.env.HF_TOKEN;
  }

  return config;
}
