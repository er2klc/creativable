
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
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize chunk size and memory usage
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap')) {
              return 'tiptap-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
    // Increase memory limit for build
    chunkSizeWarningLimit: 1000,
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
  // Optimize dependency handling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-mention',
      '@tiptap/suggestion',
    ],
  },
}))
