# Meong CLI Documentation

This document provides an overview of the Meong CLI, a command-line interface for interacting with an Ollama language model.

## 1. Project Structure

The project is organized into the following files and directories:

```
.
├── dist/                     # Compiled JavaScript files
├── docs/                     # Documentation files
│   └── doc.md
├── node_modules/             # Project dependencies
├── src/                      # TypeScript source code
│   ├── api.ts                # Handles communication with the Ollama API
│   ├── cli.ts                # Defines the command-line interface
│   ├── config.ts             # Contains application configuration
│   ├── history.ts            # Manages conversation history
│   ├── index.ts              # Entry point of the application
│   └── types.ts              # TypeScript type definitions
├── .gitignore                # Git ignore file
├── package.json              # Project metadata and dependencies
├── package-lock.json         # Exact versions of dependencies
└── tsconfig.json             # TypeScript compiler options
```

## 2. Core Components

### 2.1. `index.ts` (Entry Point)

This is the main entry point of the application. It creates an instance of the `CLI` class and executes it. The `#!/usr/bin/env node` shebang at the top allows the script to be executed directly from the command line.

### 2.2. `cli.ts` (Command-Line Interface)

This file is the heart of the CLI application. It uses the `commander` library to define and manage the available commands.

**Key Responsibilities:**

*   **Command Definitions:** Defines commands such as `chat`, `ask`, `history`, `clear`, `new`, `list`, and `switch`.
*   **User Interaction:** Handles user input using `readline-sync` and displays output to the console using `chalk` for styling.
*   **Orchestration:** Coordinates the `OllamaAPI` and `HistoryManager` to process user requests.

### 2.3. `api.ts` (Ollama API Interaction)

This component is responsible for all communication with the Ollama API endpoint.

**Key Methods:**

*   **`streamChat(messages)`:** Sends a request to the API and streams the response back to the user in real-time.
*   **`sendMessage(messages)`:** Sends a request to the API and returns the entire response at once.

It uses `node-fetch` to make HTTP requests to the API endpoint specified in the configuration.

### 2.4. `config.ts` (Configuration)

This file provides the default configuration for the application.

**Default Configuration:**

*   **`apiUrl`:** `http://103.145.126.158:3012/api/chat`
*   **`model`:** `smollm`
*   **`maxHistory`:** `100` (maximum number of messages to store per conversation)
*   **`historyFile`:** `~/.ollama-cli-history.json` (path to the history file)

### 2.5. `history.ts` (History Management)

This component manages the conversation history.

**Key Features:**

*   **Persistence:** Loads and saves conversation history to a JSON file (`.ollama-cli-history.json` in the user's home directory).
*   **Multiple Conversations:** Supports multiple, separate conversations.
*   **History Operations:** Provides methods to:
    *   Get the current conversation.
    *   Add a new message.
    *   Start a new conversation.
    *   Clear the current conversation.
    *   List all conversations.
    *   Switch between conversations.

### 2.6. `types.ts` (Type Definitions)

This file contains all the TypeScript type definitions used throughout the application, ensuring type safety and providing clear data structures.

**Key Interfaces:**

*   `Message`: Represents a single message in a conversation.
*   `ChatRequest`: Defines the structure of a request to the Ollama API.
*   `ChatResponse`: Defines the structure of a response from the Ollama API.
*   `Config`: Defines the structure of the application configuration.
*   `ConversationHistory`: Defines the structure of the history data stored in the JSON file.

## 3. How It Works

1.  **Initialization:** When you run the CLI, the `index.ts` file creates a new `CLI` instance.
2.  **Command Parsing:** The `CLI` constructor sets up all the commands using `commander`. The `run()` method then parses the command-line arguments provided by the user.
3.  **Command Execution:** Based on the command, the corresponding action is executed.
    *   For `chat`, an interactive session is started.
    *   For `ask`, a single question is sent to the API.
    *   Other commands interact with the `HistoryManager` to manage conversations.
4.  **API Request:** When a user sends a message, the `OllamaAPI` class sends a formatted request to the Ollama API endpoint.
5.  **API Response:** The API's response is either streamed to the console or displayed all at once.
6.  **History Update:** The user's message and the assistant's response are saved to the conversation history by the `HistoryManager`.

This architecture separates concerns, making the codebase modular and easier to maintain. The `CLI` class handles user interaction, the `OllamaAPI` class handles network communication, and the `HistoryManager` handles data persistence.
