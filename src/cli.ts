import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'readline';
import { OllamaAPI } from './api';
import { HistoryManager } from './history';
import { Message } from './types';

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
      .name('ollama-cli')
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
    console.log(chalk.blue('🤖 Ollama SmolLM CLI'));
    console.log(chalk.gray('Type "exit" or press Ctrl+C to quit. Use up/down arrows for history.\n'));
    console.log(chalk.gray('Commands: "clear" to clear conversation, "new" for new conversation.\n'));

    const conversation = this.history.getCurrentConversation();
    if (conversation.length > 0) {
      console.log(chalk.yellow('📚 Continuing previous conversation...\n'));
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.green('You: '),
      history: this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content).reverse(),
    });

    rl.prompt();

    rl.on('line', async (input) => {
      const command = input.trim().toLowerCase();

      if (command === 'exit') {
        rl.close();
        return;
      }

      if (command === 'clear') {
        this.clearConversation();
        rl.history = []; // Clear readline's internal history
        rl.prompt();
        return;
      }

      if (command === 'new') {
        this.newConversation();
        rl.history = []; // Clear readline's internal history
        rl.prompt();
        return;
      }

      if (input.trim() === '') {
        rl.prompt();
        return;
      }

      const userMessage: Message = { role: 'user', content: input };
      this.history.addMessage(userMessage);

      try {
        process.stdout.write(chalk.blue('SmolLM: '));
        if (streaming) {
          await this.streamResponse();
        } else {
          const response = await this.api.sendMessage(this.history.getCurrentConversation());
          process.stdout.write(response);
          const assistantMessage: Message = { role: 'assistant', content: response };
          this.history.addMessage(assistantMessage);
        }
        process.stdout.write('\n\n');
      } catch (error) {
        const err = error as Error;
        console.log(chalk.red(`\n❌ Error: ${err.message}`));
      }

      // Refresh history for the next prompt
      rl.history = this.history.getCurrentConversation().filter(m => m.role === 'user').map(m => m.content).reverse();
      rl.prompt();

    }).on('close', () => {
      console.log(chalk.yellow('\n👋 Goodbye!'));
      process.exit(0);
    });
  }

  private async streamResponse(): Promise<void> {
    const messages = this.history.getCurrentConversation();
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
      // The error handling in startChat will catch this.
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
        console.log(); // Newline after streaming
      } else {
        const response = await this.api.sendMessage([userMessage]);
        console.log(response);
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