##!/bin/bash
#
#CODESPACE_NAME="curly-couscous-r5xwp9rw9xgfpjw5"
#
## SSH and run the commands inside Codespace
#gh codespace ssh -c "$CODESPACE_NAME" -- -t '
#  echo "[*] Starting ollama serve..."
#  nohup ollama serve > ollama.log 2>&1 &
#  sleep 8
#  echo "[*] Running smollm..."
#  ollama run smollm
#' 
#
##sleep 10
#
#
#echo "[*] forwarding  port 11434..."
#gh codespace ports forward  11434:11434 -c "$CODESPACE_NAME"
#
## Now expose the port
#echo "[*] Making port 11434 public..."
#gh codespace ports visibility 11434:public -c "$CODESPACE_NAME"
#




CODESPACE_NAME="curly-couscous-r5xwp9rw9xgfpjw5"

# SSH and run ollama in the background inside Codespace
#gh codespace ssh -c "$CODESPACE_NAME" -- -t '
#  echo "[*] Starting ollama serve on 0.0.0.0..."
#  nohup ollama serve > ollama.log 2>&1 &
#  sleep 5
#  echo "[*] Starting smollm chat (non-blocking)..."
#  nohup ollama run smollm > smollm.log 2>&1 &
#' 

#gh codespace ssh -c "$CODESPACE_NAME" -- -t '
#  nohup OLLAMA_HOST=0.0.0.0 ollama serve > ollama.log 2>&1 &
#  sleep 5
#  nohup ollama run smollm > smollm.log 2>&1 &
#  echo "[*] Background setup complete."
#'
#
#
#
## Wait a bit to let ollama boot
#sleep 5
#
## Forward and make port public
#echo "[*] Forwarding port 11434 to local machine..."
#gh codespace ports forward 11434:11434 -c "$CODESPACE_NAME"
#
#echo "[*] Making port 11434 public..."
#gh codespace ports visibility 11434:public -c "$CODESPACE_NAME"
#
#echo "[*] Listing open ports..."
#gh codespace ports -c "$CODESPACE_NAME"
#



#!/bin/bash

CODESPACE_NAME="curly-couscous-r5xwp9rw9xgfpjw5"

# Start ollama serve + warm up model
gh codespace ssh -c "$CODESPACE_NAME" -- -t '
  echo "[*] Starting ollama serve in background..."
  nohup OLLAMA_HOST=0.0.0.0 ollama serve > ollama.log 2>&1 &
  sleep 8
  echo "[*] Warming up smollm..."
  ollama run smollm <<< "exit"
  echo "[*] smollm loaded, exiting remote session."
'

# Forward and expose port
echo "[*] Forwarding port 11434..."
gh codespace ports forward 11434:11434 -c "$CODESPACE_NAME"

echo "[*] Making port 11434 public..."
gh codespace ports visibility 11434:public -c "$CODESPACE_NAME"

echo "[*] Done. Ollama is ready and port is public."

