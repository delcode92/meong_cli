curl https://curly-couscous-r5xwp9rw9xgfpjw5-11434.app.github.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "smollm",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "What is quantum entanglement?" },
      { "role": "assistant", "content": "Quantum entanglement is a phenomenon where particles remain connected..." },
      { "role": "user", "content": "Can you explain it with an analogy?" }
    ],
    "temperature": 0.2,
    "top_p": 0.9,
    "repeat_penalty": 1.2
  }'
