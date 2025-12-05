// src/main.js
const modules = import.meta.glob('./lib/**/*.ce.svelte', { eager: true });

// TEMP: log what got pulled in so we can confirm
console.log('Loaded components:', Object.keys(modules));
