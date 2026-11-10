import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Endereço da API .NET (launchSettings.json do backend: http://localhost:5045).
  const alvoApi = env.VITE_PROXY_TARGET || "http://localhost:5045";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // O backend envia no e-mail links para http://localhost:5173 (Frontend:BaseUrl).
      // strictPort evita o Vite trocar de porta em silêncio e quebrar esses links.
      port: 5173,
      strictPort: true,
      // O backend não habilita CORS. Em desenvolvimento, o navegador fala só com o Vite
      // (mesma origem) e o Vite repassa /api/* para a API — sem alterar o backend.
      proxy: {
        "/api": { target: alvoApi, changeOrigin: true },
      },
    },
  };
});
