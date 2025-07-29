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
exports.defaultConfig = void 0;
exports.getConfig = getConfig;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
// import path from 'path';
// Load .env from root directory
// dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log("history location: ", path.join(os.homedir(), '.ollama-cli-history.json'));
exports.defaultConfig = {
    apiUrl: 'https://curly-couscous-r5xwp9rw9xgfpjw5-11434.app.github.dev/api/chat',
    // apiUrl: 'http://localhost:11434/api/chat',
    model: 'smollm',
    maxHistory: 10,
    historyFile: path.join(os.homedir(), '.ollama-cli-history.json'),
    temperature: 0.2,
    top_p: 0.9,
    repeat_penalty: 1.2
};
function getConfig() {
    // In a real app, you might want to read from a config file
    // For now, we'll use the default config
    return exports.defaultConfig;
}
//# sourceMappingURL=config.js.map