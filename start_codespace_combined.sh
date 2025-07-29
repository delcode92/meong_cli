#!/bin/bash

# This script combines port forwarding and starting the Ollama server in a GitHub Codespace.

# Define the Codespace name
CODESPACE_NAME="curly-couscous-r5xwp9rw9xgfpjw5"

# --- Port Visibility ---
# Make port 11434 public so it can be accessed via the github.dev URL.
echo "Setting up port visibility for Codespace: $CODESPACE_NAME"

# Retry loop to handle cases where the codespace is not immediately ready
for i in {1..3}; do
  gh codespace ports visibility 11434:public -c "$CODESPACE_NAME" && break
  echo "Command failed. Retrying in 5 seconds... (Attempt $i of 3)"
  sleep 5
done

gh codespace ports -c "$CODESPACE_NAME"

# It can take a moment for the port forwarding to be ready.
echo "Waiting for 5 seconds for port forwarding to establish..."
sleep 5

# --- Start Ollama Server in Codespace ---
# Connect to the codespace via SSH and execute commands.
echo "Connecting to codespace to start Ollama server..."
gh codespace ssh -c "$CODESPACE_NAME" -- '
  echo "Pulling smollm model to ensure it is available..."
  # Use "pull" instead of "run" to download the model non-interactively.
  ollama pull smollm

  echo "Starting Ollama server in the background..."
  # Start the server, listening on all network interfaces within the codespace.
  OLLAMA_HOST=0.0.0.0 ollama serve &
  
  echo "Ollama server has been started in the background."
  echo "You can now connect to it via the forwarded port 11434."
'

echo "Script finished."
