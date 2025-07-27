
import { exec } from 'child_process';

export interface CommandOutput {
  stdout: string;
  stderr: string;
  error: Error | null;
}

export function executeCommand(command: string): Promise<CommandOutput> {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}
