import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production
    minify: 'esbuild', // Use esbuild for faster builds
    rollupOptions: {
      treeshake: true,
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          heroicons: ['@heroicons/react/24/outline'],
          utils: ['uuid']
        },
      },
    },
    // Use esbuild's built-in optimizations
  },
  server: {
    port: 3000,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', '@heroicons/react/24/outline'],
  },
})
