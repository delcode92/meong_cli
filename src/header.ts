import chalk from 'chalk';

export function displayHeader(): void {
  const header = `
███╗   ███╗███████╗ ██████╗ ███╗   ██╗ ██████╗      ██████╗██╗     ██╗
████╗ ████║██╔════╝██╔═══██╗████╗  ██║██╔════╝     ██╔════╝██║     ██║
██╔████╔██║█████╗  ██║   ██║██╔██╗ ██║██║  ███╗    ██║     ██║     ██║
██║╚██╔╝██║██╔══╝  ██║   ██║██║╚██╗██║██║   ██║    ██║     ██║     ██║
██║ ╚═╝ ██║███████╗╚██████╔╝██║ ╚████║╚██████╔╝    ╚██████╗███████╗██║
╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝      ╚═════╝╚══════╝╚═╝
  `;

  // Create gradient effect with retro colors
  const lines = header.split('\n');
  const colors = [
    chalk.hex('#00ff00'), // Magenta
    chalk.hex('#00ffff'), // Pink
    chalk.hex('#00ff00'), // Orange
    chalk.hex('#00ffff'), // Yellow
    chalk.hex('#00ff00'), // Green
    chalk.hex('#00ffff'), // Cyan
    chalk.hex('#0099ff'), // Blue
    chalk.hex('#9900ff'), // Purple
  ];

  console.log('');
  lines.forEach((line, index) => {
    if (line.trim()) {
      const colorIndex = index % colors.length;
      console.log(colors[colorIndex](line));
    } else {
      console.log(line);
    }
  });

  // Add subtitle with retro styling
  console.log(chalk.hex('#00ffff').bold('                    🤖 Powered by SmolLM via Ollama 🚀'));
  console.log(chalk.hex('#ff6600')('                      ═══════════════════════════════'));
  console.log('');
}

export function displayWelcomeMessage(): void {
  console.log(chalk.hex('#00ff00')('🎯 Welcome to MEONG CLI - Your AI Assistant!'));
  console.log(chalk.hex('#ffff00')('💡 Type "exit" to quit, "clear" to clear conversation, "new" for new conversation'));
  console.log(chalk.hex('#ff00ff')('🔥 Streaming responses enabled for real-time interaction'));
  console.log('');
}
