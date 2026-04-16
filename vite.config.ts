import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Configurazione server di sviluppo
  server: {
    host: '0.0.0.0',
    port: 8080
  },
  // Configurazione server di produzione (Preview/Cloud Run)
  preview: {
    host: '0.0.0.0', // Obbligatorio per Docker/Cloud Run
    port: Number(process.env.PORT) || 8080, // Usa la porta iniettata da Cloud Run o 8080
  }
});