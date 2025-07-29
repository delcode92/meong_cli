import { Config } from './types';
import * as path from 'path';
import * as os from 'os';

import dotenv from 'dotenv';
// import path from 'path';

// Load .env from root directory
// dotenv.config({ path: path.resolve(__dirname, '../.env') });


console.log("history location: ", path.join(os.homedir(), '.ollama-cli-history.json') );

export const defaultConfig: Config = {
  apiUrl: 'https://curly-couscous-r5xwp9rw9xgfpjw5-11434.app.github.dev/api/chat',
  // apiUrl: 'http://localhost:11434/api/chat',
  model: 'smollm',
  maxHistory: 10,
  historyFile: path.join(os.homedir(), '.ollama-cli-history.json'),
  temperature: 0.2,
  top_p: 0.9,
  repeat_penalty: 1.2
};

export function getConfig(): Config {
  // In a real app, you might want to read from a config file
  // For now, we'll use the default config
  return defaultConfig;
}
