// src/dev-main.js

// 1. Register all production components so you can test them too
import './main.js';

// 2. Auto-import any experimental components under src/dev
import.meta.glob('./dev/**/*.ce.svelte', { eager: true });
