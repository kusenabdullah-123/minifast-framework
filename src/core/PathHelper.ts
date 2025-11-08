import { fileURLToPath } from 'url';
import path from 'path';

/**
 * 🧭 miniDir(import.meta.url)
 * 
 * Mendapatkan direktori file yang sedang dijalankan (ESM-safe).
 * Setara dengan __dirname di CommonJS.
 * 
 * @example
 * const dir = miniDir(import.meta.url);
 * console.log(dir); // /home/kusena/project/app
 */
export function miniDir(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl));
}

/**
 * 🗂️ miniFile(import.meta.url)
 * 
 * Mendapatkan path absolut file yang sedang dijalankan (ESM-safe).
 * Setara dengan __filename di CommonJS.
 * 
 * @example
 * const file = miniFile(import.meta.url);
 * console.log(file); // /home/kusena/project/app/test.mjs
 */
export function miniFile(importMetaUrl: string): string {
  return fileURLToPath(importMetaUrl);
}
