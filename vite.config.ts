
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Enable fast refresh for all components
      fastRefresh: true,
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 8080,
    host: true,
    // Force strict port
    strictPort: true,
    // Add headers to prevent caching in development
    headers: {
      'Cache-Control': 'no-store',
    },
    // Enable HMR with overlay
    hmr: {
      overlay: true,
    },
    // Add watcher options
    watch: {
      // Use polling for more reliable file watching
      usePolling: true,
      interval: 100,
    },
  },
}))

