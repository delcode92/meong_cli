#!/bin/bash

CODESPACE_NAME="curly-couscous-r5xwp9rw9xgfpjw5"
REMOTE_SCRIPT="/tmp/start_ollama.sh"

# Generate the remote script to run in Codespace
cat << 'EOF' > start_ollama.sh
#!/bin/bash

echo "[*] Starting ollama serve in background..."
nohup OLLAMA_HOST=0.0.0.0 ollama serve > ollama-serve.log 2>&1 &

sleep 5

echo "[*] Warming up model: smollm..."
nohup ollama run smollm > ollama-smollm.log 2>&1 &

sleep 10

# Check logs for potential failure
if grep -q "error" ollama-smollm.log; then
  echo "[!] smollm model failed to start. Check ollama-smollm.log"
  exit 1
fi

echo "[✓] ollama serve and smollm running in background successfully."
EOF

# Upload the remote script to Codespace
gh codespace cp start_ollama.sh "$CODESPACE_NAME":"$REMOTE_SCRIPT"

# Execute the script in Codespace
gh codespace ssh -c "$CODESPACE_NAME" -- -t "chmod +x $REMOTE_SCRIPT && bash $REMOTE_SCRIPT"

# If the above succeeded, forward the port
if [ $? -eq 0 ]; then
  echo "[*] Forwarding port 11434..."
  gh codespace ports forward 11434:11434 -c "$CODESPACE_NAME"

  echo "[*] Making port 11434 public..."
  gh codespace ports visibility 11434:public -c "$CODESPACE_NAME"
  echo "[✓] Ollama is ready and public on port 11434!"
else
  echo "[✗] Something went wrong. Port will not be forwarded."
fi

# Clean up local script
rm start_ollama.sh

