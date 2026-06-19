import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Plugin que simula as API routes da Vercel em dev
function apiRoutesPlugin() {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Rota: /api/radio/:slug
        const match = req.url.match(/^\/api\/radio\/([a-z0-9_-]+)$/i);
        if (!match) return next();

        const slug = match[1];
        const filePath = join(process.cwd(), 'api', 'radios', `${slug}.json`);

        res.setHeader('Content-Type', 'application/json');

        if (!existsSync(filePath)) {
          res.statusCode = 404;
          res.end(JSON.stringify({
            error: 'Rádio não encontrada',
            message: `Nenhuma rádio com slug "${slug}" foi cadastrada.`,
          }));
          return;
        }

        try {
          const data = readFileSync(filePath, 'utf-8');
          res.statusCode = 200;
          res.end(data);
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Erro ao carregar dados', message: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiRoutesPlugin()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/stream': {
        target: 'http://servidor28-1.brlogic.com:8028',
        changeOrigin: true,
        rewrite: (path) => '/live',
      },
    },
  },
});
