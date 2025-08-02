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
exports.defaultConfig = void 0;
exports.getConfig = getConfig;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load .env from root directory
dotenv_1.default.config({ path: path.resolve(process.cwd(), '.env') });
exports.defaultConfig = {
    apiProvider: 'huggingface',
    apiUrl: 'http://localhost:11434/api/chat',
    model: 'smollm',
    hfModel: 'HuggingFaceTB/SmolLM3-3B',
    hfEmbeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
    hfToken: undefined, // No default token
    maxHistory: 3,
    historyFile: path.join(os.homedir(), '.meong-cli-history.json'),
    temperature: 0.2,
    top_p: 0.9,
    repeat_penalty: 1.2
};
function getConfig(options = {}) {
    // Create a cleaned-up options object that only contains defined values
    const cleanedOptions = Object.entries(options)
        .filter(([, value]) => value !== undefined)
        .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});
    // Precedence: 1. Env variables -> 2. CLI options -> 3. Default config
    const config = {
        ...exports.defaultConfig,
        // Environment variables provide a base
        apiProvider: process.env.API_PROVIDER || exports.defaultConfig.apiProvider,
        apiUrl: process.env.OLLAMA_API_URL || exports.defaultConfig.apiUrl,
        model: process.env.OLLAMA_MODEL || exports.defaultConfig.model,
        hfToken: process.env.HF_TOKEN || exports.defaultConfig.hfToken,
        hfModel: process.env.HF_MODEL || exports.defaultConfig.hfModel,
        hfEmbeddingModel: process.env.HF_EMBEDDING_MODEL || exports.defaultConfig.hfEmbeddingModel,
        // CLI options override everything else
        ...cleanedOptions,
    };
    // Special handling for hfToken to ensure CLI doesn't nullify it
    if (cleanedOptions.apiProvider === 'huggingface' && !config.hfToken) {
        config.hfToken = process.env.HF_TOKEN;
    }
    return config;
}
//# sourceMappingURL=config.js.map