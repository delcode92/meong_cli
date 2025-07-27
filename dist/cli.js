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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const readline = __importStar(require("readline"));
const api_1 = require("./api");
const history_1 = require("./history");
const summarizer_1 = require("./summarizer");
const executor_1 = require("./executor");
class CLI {
    constructor() {
        this.api = new api_1.OllamaAPI();
        this.history = new history_1.HistoryManager();
        this.program = new commander_1.Command();
        this.setupCommands();
    }
    setupCommands() {
        this.program
            .name('meong-cli')
            .description('CLI for interacting with Ollama SmolLM')
            .version('1.0.0');
        this.program
            .command('chat')
            .description('Start an interactive chat session')
            .option('-s, --stream', 'Enable streaming responses', true)
            .action((options) => this.startChat(options.stream));
        this.program
            .command('ask <question>')
            .description('Ask a single question')
            .option('-s, --stream', 'Enable streaming responses', true)
            .action((question, options) => this.askQuestion(question, options.stream));
        this.program
            .command('read <file_path>')
            .description('Read and analyze a file. Summarization is optimized for .ts, .js, .tsx, and .jsx files.')
            .option('-s, --stream', 'Enable streaming responses', true)
            .action((filePath, options) => this.handleFileAnalysis(filePath, options.stream)); // <-- Updated
        this.program
            .command('exec <command>')
            .description('Execute a shell command and get help from the AI on error')
            .action((command) => this.handleExec(command));
        this.program
            .command('history')
            .description('Show conversation history')
            .action(() => this.showHistory());
        this.program
            .command('clear')
            .description('Clear current conversation')
            .action(() => this.clearConversation());
        this.program
            .command('new')
            .description('Start a new conversation')
            .action(() => this.newConversation());
        this.program
            .command('list')
            .description('List all conversations')
            .action(() => this.listConversations());
        this.program
            .command('switch <index>')
            .description('Switch to a specific conversation')
            .action((index) => this.switchConversation(parseInt(index)));
    }
    async startChat(streaming = true) {
        console.log(chalk_1.default.blue('🤖 Ollama SmolLM CLI'));
        console.log(chalk_1.default.gray('Type "exit" or press Ctrl+C to quit. Use up/down arrows for history.\n'));
        console.log(chalk_1.default.gray('Commands: "clear", "new", or use "@ <file_path>" to analyze a file.\n'));
        console.log(chalk_1.default.gray('          "!exec <command>" to execute a shell command.\n'));
        const conversation = this.history.getCurrentConversation();
        if (conversation.length > 0) {
            console.log(chalk_1.default.yellow('📚 Continuing previous conversation...\n'));
        }
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk_1.default.green('You: '),
            history: this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content).reverse(),
        });
        rl.prompt();
        rl.on('line', async (input) => {
            const trimmedInput = input.trim();
            if (trimmedInput.toLowerCase() === 'exit') {
                rl.close();
                return;
            }
            if (trimmedInput.startsWith('@')) {
                const parts = trimmedInput.substring(1).trim().split(/\s+/);
                const filePath = parts[0];
                const question = parts.slice(1).join(' ');
                const userMessage = { role: 'user', content: trimmedInput };
                this.history.addMessage(userMessage);
                await this.handleFileAnalysis(filePath, streaming, true, question); // In-chat analysis
                rl.history = this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content).reverse();
                rl.prompt();
                return;
            }
            if (trimmedInput.startsWith('!exec')) {
                const command = trimmedInput.substring(5).trim();
                if (command) {
                    const userMessage = { role: 'user', content: trimmedInput };
                    this.history.addMessage(userMessage);
                    await this.handleExec(command, true);
                    rl.history = this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content).reverse();
                }
                else {
                    console.log(chalk_1.default.red('Please provide a command to execute.'));
                }
                rl.prompt();
                return;
            }
            if (trimmedInput.toLowerCase() === 'clear') {
                this.clearConversation();
                rl.history = [];
                rl.prompt();
                return;
            }
            if (trimmedInput.toLowerCase() === 'new') {
                this.newConversation();
                rl.history = [];
                rl.prompt();
                return;
            }
            if (trimmedInput === '') {
                rl.prompt();
                return;
            }
            const userMessage = { role: 'user', content: trimmedInput };
            this.history.addMessage(userMessage);
            try {
                process.stdout.write(chalk_1.default.blue('SmolLM: '));
                if (streaming) {
                    await this.streamResponse();
                }
                else {
                    const response = await this.api.sendMessage(this.history.getCurrentConversation());
                    process.stdout.write(response);
                    const assistantMessage = { role: 'assistant', content: response };
                    this.history.addMessage(assistantMessage);
                }
                process.stdout.write('\n\n');
            }
            catch (error) {
                const err = error;
                console.log(chalk_1.default.red(`\n❌ Error: ${err.message}`));
            }
            rl.history = this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content).reverse();
            rl.prompt();
        }).on('close', () => {
            console.log(chalk_1.default.yellow('\n👋 Goodbye!'));
            process.exit(0);
        });
    }
    async streamResponse() {
        const messages = this.history.getCurrentConversation();
        let fullResponse = '';
        try {
            for await (const chunk of this.api.streamChat(messages)) {
                process.stdout.write(chunk);
                fullResponse += chunk;
            }
            const assistantMessage = {
                role: 'assistant',
                content: fullResponse,
            };
            this.history.addMessage(assistantMessage);
        }
        catch (error) {
            throw error;
        }
    }
    async askQuestion(question, streaming = true) {
        const userMessage = {
            role: 'user',
            content: question
        };
        console.log(chalk_1.default.green('Question: ') + question);
        process.stdout.write(chalk_1.default.blue('SmolLM: '));
        try {
            if (streaming) {
                let fullResponse = '';
                for await (const chunk of this.api.streamChat([userMessage])) {
                    process.stdout.write(chunk);
                    fullResponse += chunk;
                }
                console.log();
            }
            else {
                const response = await this.api.sendMessage([userMessage]);
                console.log(response);
            }
        }
        catch (error) {
            const err = error;
            console.log(chalk_1.default.red(`\n❌ Error: ${err.message}`));
        }
    }
    async handleExec(command, inChat = false) {
        if (!inChat) {
            console.log(chalk_1.default.yellow(`🚀 Executing: ${command}`));
        }
        else {
            process.stdout.write(chalk_1.default.yellow(`🚀 Executing: ${command}\n`));
        }
        const { error, stdout, stderr } = await (0, executor_1.executeCommand)(command);
        if (error) {
            console.log(chalk_1.default.red('❌ Command failed. Asking for help...'));
            const prompt = `The command "${command}" failed with the following error:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nPlease explain the error and suggest a solution.`;
            const messages = inChat
                ? [...this.history.getCurrentConversation().slice(0, -1), { role: 'user', content: prompt }]
                : [{ role: 'user', content: prompt }];
            process.stdout.write(chalk_1.default.blue('SmolLM: '));
            try {
                let fullResponse = '';
                for await (const chunk of this.api.streamChat(messages)) {
                    process.stdout.write(chunk);
                    fullResponse += chunk;
                }
                if (inChat) {
                    const assistantMessage = { role: 'assistant', content: fullResponse };
                    this.history.addMessage(assistantMessage);
                }
                process.stdout.write('\n\n');
            }
            catch (e) {
                const err = e;
                console.log(chalk_1.default.red(`\n❌ Error getting help: ${err.message}`));
            }
        }
        else {
            console.log(chalk_1.default.green('✅ Command successful!'));
            if (stdout) {
                console.log(chalk_1.default.blue('Output:\n') + stdout);
            }
        }
    }
    async handleFileAnalysis(filePath, streaming = true, inChat = false, question = '') {
        if (!inChat) {
            console.log(chalk_1.default.yellow(`📄 Reading and summarizing file: ${filePath}`));
        }
        else {
            process.stdout.write(chalk_1.default.yellow(`📄 Reading and summarizing file: ${filePath}\n`));
        }
        const summarizedContent = (0, summarizer_1.readFileAndSummarize)(filePath);
        if (summarizedContent.startsWith('Error:')) {
            console.log(chalk_1.default.red(`\n❌ ${summarizedContent}`));
            return;
        }
        if (!inChat) {
            console.log(chalk_1.default.blue('📝 Summary generated. Sending to SmolLM for analysis...'));
            console.log(summarizedContent);
        }
        const finalQuestion = question || 'What does this code do?';
        const prompt = `\nBased on the following summarized code from the file "${filePath}", please provide a brief explanation of its main purpose and functionality.\n\n${summarizedContent}\n\n${finalQuestion}\n`;
        const analysisMessages = [
            ...this.history.getCurrentConversation().slice(0, -1), // Get history *before* the @ command
            { role: 'user', content: prompt }
        ];
        process.stdout.write(chalk_1.default.blue('SmolLM: '));
        try {
            if (streaming) {
                let fullResponse = '';
                for await (const chunk of this.api.streamChat(analysisMessages)) {
                    process.stdout.write(chunk);
                    fullResponse += chunk;
                }
                const assistantMessage = { role: 'assistant', content: fullResponse };
                this.history.addMessage(assistantMessage);
                process.stdout.write('\n\n');
            }
            else {
                const response = await this.api.sendMessage(analysisMessages);
                const assistantMessage = { role: 'assistant', content: response };
                this.history.addMessage(assistantMessage);
                process.stdout.write(response + '\n\n');
            }
        }
        catch (error) {
            const err = error;
            console.log(chalk_1.default.red(`\n❌ Error: ${err.message}`));
        }
    }
    showHistory() {
        const conversation = this.history.getCurrentConversation();
        if (conversation.length === 0) {
            console.log(chalk_1.default.yellow('📝 No conversation history'));
            return;
        }
        console.log(chalk_1.default.blue('📚 Conversation History:\n'));
        conversation.forEach((message) => {
            const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
            const role = message.role === 'user' ? chalk_1.default.green('You') : chalk_1.default.blue('SmolLM');
            console.log(`${chalk_1.default.gray(`[${timestamp}]`)} ${role}:`);
            console.log(message.content + '\n');
        });
    }
    clearConversation() {
        this.history.clearCurrentConversation();
        console.log(chalk_1.default.yellow('🧹 Conversation cleared!'));
    }
    newConversation() {
        this.history.newConversation();
        console.log(chalk_1.default.yellow('🆕 Started new conversation!'));
    }
    listConversations() {
        const conversations = this.history.listConversations();
        console.log(chalk_1.default.blue('📋 All Conversations:\n'));
        conversations.forEach((conv) => {
            const indicator = conv.index === this.history['history'].currentIndex ? '→' : ' ';
            const preview = conv.lastMessage ? `: "${conv.lastMessage}..."` : ': (empty)';
            console.log(`${indicator} ${chalk_1.default.cyan(`[${conv.index}]`)} ` +
                `${conv.messageCount} messages${preview}`);
        });
    }
    switchConversation(index) {
        if (this.history.switchToConversation(index)) {
            console.log(chalk_1.default.yellow(`🔄 Switched to conversation ${index}`));
        }
        else {
            console.log(chalk_1.default.red(`❌ Invalid conversation index: ${index}`));
        }
    }
    run() {
        this.program.parse();
    }
}
exports.CLI = CLI;
//# sourceMappingURL=cli.js.map