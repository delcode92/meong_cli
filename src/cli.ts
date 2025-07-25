import { Command } from 'commander';
import chalk from 'chalk';
import * as readlineSync from 'readline-sync';
import { OllamaAPI } from './api';
import { HistoryManager } from './history';
import { Message } from './types';
import { displayHeader, displayWelcomeMessage } from './header';

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
    displayHeader();
    displayWelcomeMessage();

    const conversation = this.history.getCurrentConversation();
    if (conversation.length > 0) {
      console.log(chalk.hex('#ffaa00')('📚 Continuing previous conversation...\n'));
    }

    while (true) {
      const input = readlineSync.question(chalk.green('You: '));

      if (input.toLowerCase() === 'exit') {
        console.log(chalk.hex('#ff6600')('👋 Goodbye from MEONG CLI! See you next time! 🐱'));
        break;
      }

      if (input.toLowerCase() === 'clear') {
        this.clearConversation();
        continue;
      }

      if (input.toLowerCase() === 'new') {
        this.newConversation();
        continue;
      }

      if (input.trim() === '') {
        continue;
      }

      const userMessage: Message = {
        role: 'user',
        content: input
      };

      this.history.addMessage(userMessage);

      try {
        console.log(chalk.hex('#00ffff')('🤖 SmolLM: '), { newline: false });
        
        if (streaming) {
          await this.streamResponse();
        } else {
          const response = await this.api.sendMessage(this.history.getCurrentConversation());
          console.log(response);
          
          const assistantMessage: Message = {
            role: 'assistant',
            content: response
          };
          this.history.addMessage(assistantMessage);
        }
        
        console.log('\n');
      } catch (error) {
        console.log(chalk.red(`\n❌ Error: ${error}`));
      }
    }
  }

  private async streamResponse(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const messages = this.history.getCurrentConversation();
      let fullResponse = '';
      let buffer = '';

      // Make the API call
      this.api.sendMessage(messages)
        .then(response => {
          fullResponse = response;
          console.log(response);
          
          const assistantMessage: Message = {
            role: 'assistant',
            content: fullResponse
          };
          this.history.addMessage(assistantMessage);
          resolve();
        })
        .catch(reject);
    });
  }

  async askQuestion(question: string, streaming: boolean = true): Promise<void> {
    const userMessage: Message = {
      role: 'user',
      content: question
    };

    console.log(chalk.green('Question: ') + question);
    console.log(chalk.blue('SmolLM: '), { newline: false });

    try {
      if (streaming) {
        const response = await this.api.sendMessage([userMessage]);
        console.log(response);
      } else {
        const response = await this.api.sendMessage([userMessage]);
        console.log(response);
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Error: ${error}`));
    }
  }

  showHistory(): void {
    const conversation = this.history.getCurrentConversation();
    
    if (conversation.length === 0) {
      console.log(chalk.yellow('📝 No conversation history'));
      return;
    }

    console.log(chalk.blue('📚 Conversation History:\n'));
    
    conversation.forEach((message, index) => {
      const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
      const role = message.role === 'user' ? chalk.green('You') : chalk.blue('SmolLM');
      const content = message.content.length > 100 
        ? message.content.substring(0, 100) + '...' 
        : message.content;
      
      console.log(`${chalk.gray(`[${timestamp}]`)} ${role}: ${content}\n`);
    });
  }

  clearConversation(): void {
    this.history.clearCurrentConversation();
    console.log(chalk.hex('#00ff00')('🧹 Conversation cleared! Ready for a fresh start! ✨'));
  }

  newConversation(): void {
    this.history.newConversation();
    console.log(chalk.hex('#ff00ff')('🆕 Started new conversation! Let\'s chat! 💬'));
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