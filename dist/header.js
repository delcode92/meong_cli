"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayHeader = displayHeader;
exports.displayWelcomeMessage = displayWelcomeMessage;
const chalk_1 = __importDefault(require("chalk"));
function displayHeader() {
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
        chalk_1.default.hex('#ff00ff'), // Magenta
        chalk_1.default.hex('#ff3399'), // Pink
        chalk_1.default.hex('#ff6600'), // Orange
        chalk_1.default.hex('#ffff00'), // Yellow
        chalk_1.default.hex('#00ff00'), // Green
        chalk_1.default.hex('#00ffff'), // Cyan
        chalk_1.default.hex('#0099ff'), // Blue
        chalk_1.default.hex('#9900ff'), // Purple
    ];
    console.log('');
    lines.forEach((line, index) => {
        if (line.trim()) {
            const colorIndex = index % colors.length;
            console.log(colors[colorIndex](line));
        }
        else {
            console.log(line);
        }
    });
    // Add subtitle with retro styling
    console.log(chalk_1.default.hex('#00ffff').bold('                    🤖 Powered by SmolLM via Ollama 🚀'));
    console.log(chalk_1.default.hex('#ff6600')('                      ═══════════════════════════════'));
    console.log('');
}
function displayWelcomeMessage() {
    console.log(chalk_1.default.hex('#00ff00')('🎯 Welcome to MEONG CLI - Your AI Assistant!'));
    console.log(chalk_1.default.hex('#ffff00')('💡 Type "exit" to quit, "clear" to clear conversation, "new" for new conversation'));
    console.log(chalk_1.default.hex('#ff00ff')('🔥 Streaming responses enabled for real-time interaction'));
    console.log('');
}
//# sourceMappingURL=header.js.map