CODESPACE_NAME="curly-couscous-r5xwp9rw9xgfpjw5"

gh codespace ports forward 11434:11434 -c "$CODESPACE_NAME" &
gh codespace ports visibility 11434:public -c "$CODESPACE_NAME" &
gh codespace ports -c "$CODESPACE_NAME"
