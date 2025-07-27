/**
 * Extracts key structural elements from code to create a summary.
 * This helps in sending a more concise context to the LLM.
 *
 * @param content The source code content.
 * @param fileType The file extension (e.g., '.ts', '.js').
 * @returns A summarized string of the code.
 */
export declare function summarizeFileContent(content: string, fileType: string): string;
/**
 * Reads a file and generates a summary of its content.
 *
 * @param filePath The path to the file.
 * @returns The summarized content or an error message.
 */
export declare function readFileAndSummarize(filePath: string): string;
//# sourceMappingURL=summarizer.d.ts.map