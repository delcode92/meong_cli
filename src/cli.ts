import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'readline';
import { OllamaAPI } from './api';
import { HistoryManager } from './history';
import { Message } from './types';
import { readFileAndSummarize } from './summarizer';
import { executeCommand } from './executor';
import { getRelevantHistory } from './relevance';
import { getConfig } from './config';

export class CLI {
  private api: OllamaAPI;
  private history: HistoryManager;
  private program: Command;

  constructor() {
    this.api = new OllamaAPI();
    this.history = new HistoryManager();
    this.program = new Command();
    this.setupCommands();
  }

  private setupCommands(): void {
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

  async startChat(streaming: boolean = true): Promise<void> {
    if (process.stdin.isTTY) {
      // Interactive mode
      this.runInteractiveChat(streaming);
    } else {
      // Piped mode
      await this.runPipedChat(streaming);
    }
  }

  private async runPipedChat(streaming: boolean): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false // Explicitly set terminal to false for piped input
    });

    let fullInput = '';
    for await (const line of rl) {
      fullInput += line + '\n';
    }

    if (fullInput.trim()) {
      await this.askQuestion(fullInput.trim(), streaming);
    }
  }

  private runInteractiveChat(streaming: boolean): void {
    console.log(chalk.blue('🤖 Ollama SmolLM CLI'));
    console.log(chalk.gray('Type "exit" or press Ctrl+C to quit. Use up/down arrows for history.\n'));
    console.log(chalk.gray('Commands: "clear", "new", or use "@ <file_path>" to analyze a file.\n'));
    console.log(chalk.gray('          "!exec <command>" to execute a shell command.\n'));

    const conversation = this.history.getCurrentConversation();
    if (conversation.length > 0) {
      console.log(chalk.yellow('📚 Continuing previous conversation...\n'));
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.green('You: '),
      history: this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content),
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

        const userMessage: Message = { role: 'user', content: trimmedInput };
        this.history.addMessage(userMessage);
        await this.handleFileAnalysis(filePath, streaming, true, question); // In-chat analysis
        rl.history = this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content);
        rl.prompt();
        return;
      }

      if (trimmedInput.startsWith('!exec')) {
        const command = trimmedInput.substring(5).trim();
        if (command) {
            const userMessage: Message = { role: 'user', content: trimmedInput };
            this.history.addMessage(userMessage);
            await this.handleExec(command, true);
            rl.history = this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content);
        } else {
            console.log(chalk.red('Please provide a command to execute.'));
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

      const userMessage: Message = { role: 'user', content: trimmedInput };
      this.history.addMessage(userMessage);

      try {
        process.stdout.write(chalk.blue('SmolLM: '));
        
        const config = getConfig();
        const relevantHistory = await getRelevantHistory(
          userMessage,
          this.history.getCurrentConversation().slice(0, -1), // History before the new message
          config.maxHistory,
          this.api
        );
        
        const messages: Message[] = [...relevantHistory, userMessage];

        if (streaming) {
          await this.streamResponse(messages);
        } else {
          const response = await this.api.sendMessage(messages);
          process.stdout.write(response);
          const assistantMessage: Message = { role: 'assistant', content: response };
          this.history.addMessage(assistantMessage);
        }
        process.stdout.write('\n\n');
      } catch (error) {
        const err = error as Error;
        console.log(chalk.red(`\n❌ Error: ${err.message}`));
      }

      rl.history = this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content);
      rl.prompt();

    }).on('close', () => {
      console.log(chalk.yellow('\n👋 Goodbye!'));
      process.exit(0);
    });
  }

  private async streamResponse(messages: Message[]): Promise<void> {
    let fullResponse = '';
    try {
      for await (const chunk of this.api.streamChat(messages)) {
        process.stdout.write(chunk);
        fullResponse += chunk;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
      };
      this.history.addMessage(assistantMessage);
    } catch (error) {
      throw error;
    }
  }

  async askQuestion(question: string, streaming: boolean = true): Promise<void> {
    const userMessage: Message = {
      role: 'user',
      content: question
    };

    console.log(chalk.green('Question: ') + question);
    process.stdout.write(chalk.blue('SmolLM: '));

    try {
      if (streaming) {
        let fullResponse = '';
        for await (const chunk of this.api.streamChat([userMessage])) {
            process.stdout.write(chunk);
            fullResponse += chunk;
        }
        console.log();
      } else {
        const response = await this.api.sendMessage([userMessage]);
        console.log(response);
      }
    } catch (error) {
        const err = error as Error;
        console.log(chalk.red(`\n❌ Error: ${err.message}`));
    }
  }

  async handleExec(command: string, inChat: boolean = false): Promise<void> {
    if (!inChat) {
        console.log(chalk.yellow(`🚀 Executing: ${command}`));
    } else {
        process.stdout.write(chalk.yellow(`🚀 Executing: ${command}\n`));
    }

    const { error, stdout, stderr } = await executeCommand(command);

    if (error) {
        console.log(chalk.red('❌ Command failed. Asking for help...'));
        
        const maxOutputLength = 1000;
        const truncatedStdout = stdout.length > maxOutputLength ? stdout.substring(0, maxOutputLength) + "\n[...TRUNCATED...]" : stdout;
        const truncatedStderr = stderr.length > maxOutputLength ? stderr.substring(0, maxOutputLength) + "\n[...TRUNCATED...]" : stderr;

        const prompt = `The command "${command}" failed with the following error:\n\nSTDOUT:\n${truncatedStdout}\n\nSTDERR:\n${truncatedStderr}\n\nPlease explain the error and suggest a solution.`;
        
        const messages: Message[] = inChat 
            ? [...this.history.getCurrentConversation().slice(0, -1), { role: 'user', content: prompt }]
            : [{ role: 'user', content: prompt }];

        process.stdout.write(chalk.blue('SmolLM: '));
        try {
            let fullResponse = '';
            for await (const chunk of this.api.streamChat(messages)) {
                process.stdout.write(chunk);
                fullResponse += chunk;
            }
            if (inChat) {
                const assistantMessage: Message = { role: 'assistant', content: fullResponse };
                this.history.addMessage(assistantMessage);
            }
            process.stdout.write('\n\n');
        } catch (e) {
            const err = e as Error;
            console.log(chalk.red(`\n❌ Error getting help: ${err.message}`));
        }
    } else {
        console.log(chalk.green('✅ Command successful!'));
        if (stdout) {
            console.log(chalk.blue('Output:\n') + stdout);
        }
    }
  }

  async handleFileAnalysis(filePath: string, streaming: boolean = true, inChat: boolean = false, question: string = ''): Promise<void> {
    if (!inChat) {
      console.log(chalk.yellow(`📄 Reading and summarizing file: ${filePath}`));
    } else {
      process.stdout.write(chalk.yellow(`📄 Reading and summarizing file: ${filePath}\n`));
    }

    let summarizedContent = readFileAndSummarize(filePath);

    if (summarizedContent.startsWith('Error:')) {
      console.log(chalk.red(`\n❌ ${summarizedContent}`));
      return;
    }

    const maxSummaryLength = 1500;
    if (summarizedContent.length > maxSummaryLength) {
        summarizedContent = summarizedContent.substring(0, maxSummaryLength) + "\n[...SUMMARY TRUNCATED...]";
    }

    if (!inChat) {
        console.log(chalk.blue('📝 Summary generated. Sending to SmolLM for analysis...'));
        console.log(summarizedContent);
    }

    const finalQuestion = question || 'What does this code do?';

    const prompt = `\nBased on the following summarized code from the file "${filePath}", please provide a brief explanation of its main purpose and functionality.\n\n${summarizedContent}\n\n${finalQuestion}\n`;

    const analysisMessages: Message[] = [
      ...this.history.getCurrentConversation().slice(0, -1), // Get history *before* the @ command
      { role: 'user', content: prompt }
    ];

    process.stdout.write(chalk.blue('SmolLM: '));

    try {
      if (streaming) {
        let fullResponse = '';
        for await (const chunk of this.api.streamChat(analysisMessages)) {
            process.stdout.write(chunk);
            fullResponse += chunk;
        }
        const assistantMessage: Message = { role: 'assistant', content: fullResponse };
        this.history.addMessage(assistantMessage);
        process.stdout.write('\n\n');
      } else {
        const response = await this.api.sendMessage(analysisMessages);
        const assistantMessage: Message = { role: 'assistant', content: response };
        this.history.addMessage(assistantMessage);
        process.stdout.write(response + '\n\n');
      }
    } catch (error) {
        const err = error as Error;
        console.log(chalk.red(`\n❌ Error: ${err.message}`));
    }
  }

  showHistory(): void {
    const conversation = this.history.getCurrentConversation();
    
    if (conversation.length === 0) {
      console.log(chalk.yellow('📝 No conversation history'));
      return;
    }

    console.log(chalk.blue('📚 Conversation History:\n'));
    
    conversation.forEach((message) => {
      const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
      const role = message.role === 'user' ? chalk.green('You') : chalk.blue('SmolLM');
      
      console.log(`${chalk.gray(`[${timestamp}]`)} ${role}:`);
      console.log(message.content + '\n');
    });
  }

  clearConversation(): void {
    this.history.clearCurrentConversation();
    console.log(chalk.yellow('🧹 Conversation cleared!'));
  }

  newConversation(): void {
    this.history.newConversation();
    console.log(chalk.yellow('🆕 Started new conversation!'));
  }

  listConversations(): void {
    const conversations = this.history.listConversations();
    
    console.log(chalk.blue('📋 All Conversations:\n'));
    
    conversations.forEach((conv) => {
      const indicator = conv.index === this.history['history'].currentIndex ? '→' : ' ';
      const preview = conv.lastMessage ? `: "${conv.lastMessage}..."` : ': (empty)';
      
      console.log(
        `${indicator} ${chalk.cyan(`[${conv.index}]`)} ` +
        `${conv.messageCount} messages${preview}`
      );
    });
  }

  switchConversation(index: number): void {
    if (this.history.switchToConversation(index)) {
      console.log(chalk.yellow(`🔄 Switched to conversation ${index}`));
    } else {
      console.log(chalk.red(`❌ Invalid conversation index: ${index}`));
    }
  }

  run(): void {
    this.program.parse();
  }
}