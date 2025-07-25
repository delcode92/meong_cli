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
exports.HistoryManager = void 0;
const fs = __importStar(require("fs"));
const config_1 = require("./config");
class HistoryManager {
    constructor() {
        this.config = (0, config_1.getConfig)();
        this.history = this.loadHistory();
    }
    loadHistory() {
        try {
            if (fs.existsSync(this.config.historyFile)) {
                const data = fs.readFileSync(this.config.historyFile, 'utf-8');
                return JSON.parse(data);
            }
        }
        catch (error) {
            console.warn('Could not load history file, starting fresh');
        }
        return {
            conversations: [[]],
            currentIndex: 0
        };
    }
    saveHistory() {
        try {
            fs.writeFileSync(this.config.historyFile, JSON.stringify(this.history, null, 2));
        }
        catch (error) {
            console.warn('Could not save history file');
        }
    }
    getCurrentConversation() {
        return this.history.conversations[this.history.currentIndex] || [];
    }
    addMessage(message) {
        const conversation = this.getCurrentConversation();
        conversation.push({
            ...message,
            timestamp: Date.now()
        });
        // Limit conversation length
        if (conversation.length > this.config.maxHistory) {
            conversation.splice(0, conversation.length - this.config.maxHistory);
        }
        this.saveHistory();
    }
    newConversation() {
        this.history.conversations.push([]);
        this.history.currentIndex = this.history.conversations.length - 1;
        this.saveHistory();
    }
    clearCurrentConversation() {
        this.history.conversations[this.history.currentIndex] = [];
        this.saveHistory();
    }
    clearAllHistory() {
        this.history = {
            conversations: [[]],
            currentIndex: 0
        };
        this.saveHistory();
    }
    getConversationCount() {
        return this.history.conversations.length;
    }
    switchToConversation(index) {
        if (index >= 0 && index < this.history.conversations.length) {
            this.history.currentIndex = index;
            this.saveHistory();
            return true;
        }
        return false;
    }
    listConversations() {
        return this.history.conversations.map((conv, index) => ({
            index,
            messageCount: conv.length,
            lastMessage: conv.length > 0 ? conv[conv.length - 1].content.substring(0, 50) : undefined
        }));
    }
}
exports.HistoryManager = HistoryManager;
//# sourceMappingURL=history.js.map