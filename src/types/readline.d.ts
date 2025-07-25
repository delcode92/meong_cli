// src/types/readline.d.ts

// Augment the existing readline.Interface to include the 'history' property
declare module 'readline' {
  interface Interface {
    history: string[];
  }
}
