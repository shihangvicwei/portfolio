import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// ISO date of the last git commit, resolved at build/dev-server start.
// Drives the footer's copyright year and "Last updated" — so both refresh
// automatically on every commit (CI rebuilds on each push to main). Falls
// back to the current date if git isn't available (e.g. a source tarball).
function lastCommitDate() {
  try {
    return execSync('git log -1 --format=%cI').toString().trim();
  } catch {
    return new Date().toISOString();
  }
}

export default defineConfig({
  plugins: [
    react(),
    legacy({ targets: ['defaults', 'not IE 11'] }),
  ],
  base: './',
  define: {
    __LAST_UPDATED__: JSON.stringify(lastCommitDate()),
  },
});
