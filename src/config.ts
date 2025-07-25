import { Config } from './types';
import * as path from 'path';
import * as os from 'os';

export const defaultConfig: Config = {
  apiUrl: '',
  model: 'smollm',
  maxHistory: 100,
  historyFile: path.join(os.homedir(), '.ollama-cli-history.json')
};

export function getConfig(): Config {
  // In a real app, you might want to read from a config file
  // For now, we'll use the default config
  return defaultConfig;
}
