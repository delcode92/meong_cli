#!/bin/bash

# This is an attempt to disable thinking by passing an empty think block.
# If this doesn't work, you may need to restart your llama-server
# with the `--think-budget 0` command-line flag.

# curl https://curly-couscous-r5xwp9rw5xgfpjw5-11434.app.github.dev/completion \
#   -N \
#   -X POST \
#   -H "Content-Type: application/json" \
#   -d '{
#     "prompt": "What is the capital of Indonesia?",
#     "n_predict": 100,
#     "stream": true
#   }'


curl https://curly-couscous-r5xwp9rw9xgfpjw5-11434.app.github.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "smollm",
    "stream":false,
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is gravity in simple words?"}
    ]
  }'



# curl https://curly-couscous-r5xwp9rw9xgfpjw5-11434.app.github.dev/api/chat \
#   -H "Content-Type: application/json" \
#   -d '{
#     "model": "smollm",
#     "prompt": "what is gravity ?"
#   }'

  # curl https://curly-couscous-r5xwp9rw9xgfpjw5-11434.app.github.dev/api/generation \
  # -X POST \
  # -H "Content-Type: application/json" \
  # -d '{
  #   "model": "smollm",
  #   "stream": false,
  #   "n_predict":200,
  #   "messages": [
  #     {
  #       "role": "user",
  #       "content": "What is the capital of Indonesia?"
  #     }
  #   ]
  # }'

