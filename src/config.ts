import { Config } from './types';
import * as path from 'path';
import * as os from 'os';

import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });



export const defaultConfig: Config = {
  apiUrl: process.env.OLLAMA_ENDPOINT,
  model: 'smollm',
  maxHistory: 100,
  historyFile: path.join(os.homedir(), '.ollama-cli-history.json')
};

export function getConfig(): Config {
  // In a real app, you might want to read from a config file
  // For now, we'll use the default config
  return defaultConfig;
}
