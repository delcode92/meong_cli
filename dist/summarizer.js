"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeFileContent = summarizeFileContent;
exports.readFileAndSummarize = readFileAndSummarize;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Extracts key structural elements from code to create a summary.
 * This helps in sending a more concise context to the LLM.
 *
 * @param content The source code content.
 * @param fileType The file extension (e.g., '.ts', '.js').
 * @returns A summarized string of the code.
 */
function summarizeFileContent(content, fileType) {
    if (!['.ts', '.js', '.tsx', '.jsx'].includes(fileType)) {
        // For non-code files, or languages not explicitly handled,
        // return the first 1000 characters as a basic summary.
        return content.slice(0, 1000);
    }
    const lines = content.split('\n');
    const summaryLines = [];
    const regexPatterns = [
        // Imports and exports
        /^import\s+.*?\s+from\s+['"].*['"];?$/,
        /^export\s+(default\s+)?(const|let|var|function|class|type|interface)\s+.*?{?$/,
        // Function and class declarations
        /^(async\s+)?function\s+\w+\(.*\)\s*\{?$/,
        /^class\s+\w+(\s+extends\s+\w+)?\s*\{?$/,
        // Arrow functions assigned to const/let/var
        /^(export\s+)?(const|let|var)\s+\w+\s*=\s*(\(.*\)|async\s*\(.*\))\s*=>\s*\{?$/,
        // Type and interface definitions
        /^type\s+\w+\s*=\s*.*?{?$/,
        /^interface\s+\w+\s*\{?$/,
    ];
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
            continue;
        }
        for (const pattern of regexPatterns) {
            if (pattern.test(trimmedLine)) {
                summaryLines.push(line);
                break; // Move to the next line once a pattern matches
            }
        }
    }
    // Add some context around the matched lines if needed, for now just join them
    return summaryLines.join('\n');
}
/**
 * Reads a file and generates a summary of its content.
 *
 * @param filePath The path to the file.
 * @returns The summarized content or an error message.
 */
function readFileAndSummarize(filePath) {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        if (!fs.existsSync(absolutePath)) {
            return `Error: File not found at ${absolutePath}`;
        }
        const content = fs.readFileSync(absolutePath, 'utf-8');
        const fileType = path.extname(absolutePath);
        const summarizedContent = summarizeFileContent(content, fileType);
        return `\nFile: ${path.basename(absolutePath)}\nType: ${fileType || 'unknown'}\n\n--- Important Code Snippets ---\n${summarizedContent}\n-----------------------------\n`;
    }
    catch (error) {
        return `Error reading or summarizing file: ${error instanceof Error ? error.message : String(error)}`;
    }
}
//# sourceMappingURL=summarizer.js.map