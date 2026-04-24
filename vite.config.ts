import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { copyFileSync, existsSync } from 'fs'

// Plugin personalizado para copiar _redirects después del build
const copyRedirectsPlugin = () => {
  return {
    name: 'copy-redirects',
    closeBundle() {
      const redirectsSource = path.resolve(__dirname, 'public/_redirects')
      const redirectsDest = path.resolve(__dirname, 'dist/_redirects')
      
      if (existsSync(redirectsSource)) {
        copyFileSync(redirectsSource, redirectsDest)
        console.log('✅ Archivo _redirects copiado a dist/')
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyRedirectsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    // Asegurar que se copien archivos de public
    copyPublicDir: true,
  },
  publicDir: 'public',
})
