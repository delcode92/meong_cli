export interface CommandOutput {
    stdout: string;
    stderr: string;
    error: Error | null;
}
export declare function executeCommand(command: string): Promise<CommandOutput>;
//# sourceMappingURL=executor.d.ts.map