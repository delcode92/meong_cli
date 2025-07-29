CODESPACE_NAME="curly-couscous-r5xwp9rw9xgfpjw5"

gh codespace ssh -c "$CODESPACE_NAME" -- -t '
  OLLAMA_HOST=0.0.0.0 ollama serve &
  ollama run smollm
'
