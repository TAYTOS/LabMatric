// vite.config.ts
import { defineConfig } from "file:///D:/Proyectos/Plataformas/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Proyectos/Plataformas/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///D:/Proyectos/Plataformas/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  server: { host: "0.0.0.0" },
  plugins: [react(), VitePWA({
    registerType: "prompt",
    includeAssets: ["icons/*.png", "icons/*.svg"],
    manifest: {
      id: "/",
      name: "CourseLabEnroll \u2014 Matr\xEDcula de laboratorios",
      short_name: "CourseLab",
      description: "Consulta grupos y horarios y gestiona tus matr\xEDculas de laboratorio.",
      lang: "es-PE",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#F7F7F8",
      theme_color: "#7A1F2B",
      categories: ["education"],
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
      ]
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
      navigateFallback: "/index.html",
      cleanupOutdatedCaches: true,
      clientsClaim: true
    },
    devOptions: { enabled: true, navigateFallback: "/" }
  })]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm95ZWN0b3NcXFxcUGxhdGFmb3JtYXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFByb3llY3Rvc1xcXFxQbGF0YWZvcm1hc1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJveWVjdG9zL1BsYXRhZm9ybWFzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHsgaG9zdDogJzAuMC4wLjAnIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBWaXRlUFdBKHtcbiAgICByZWdpc3RlclR5cGU6ICdwcm9tcHQnLFxuICAgIGluY2x1ZGVBc3NldHM6IFsnaWNvbnMvKi5wbmcnLCAnaWNvbnMvKi5zdmcnXSxcbiAgICBtYW5pZmVzdDoge1xuICAgICAgaWQ6ICcvJyxcbiAgICAgIG5hbWU6ICdDb3Vyc2VMYWJFbnJvbGwgXHUyMDE0IE1hdHJcdTAwRURjdWxhIGRlIGxhYm9yYXRvcmlvcycsXG4gICAgICBzaG9ydF9uYW1lOiAnQ291cnNlTGFiJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29uc3VsdGEgZ3J1cG9zIHkgaG9yYXJpb3MgeSBnZXN0aW9uYSB0dXMgbWF0clx1MDBFRGN1bGFzIGRlIGxhYm9yYXRvcmlvLicsXG4gICAgICBsYW5nOiAnZXMtUEUnLFxuICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICBzY29wZTogJy8nLFxuICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNGN0Y3RjgnLFxuICAgICAgdGhlbWVfY29sb3I6ICcjN0ExRjJCJyxcbiAgICAgIGNhdGVnb3JpZXM6IFsnZWR1Y2F0aW9uJ10sXG4gICAgICBpY29uczogW1xuICAgICAgICB7IHNyYzogJy9pY29ucy9pY29uLTE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInLCB0eXBlOiAnaW1hZ2UvcG5nJywgcHVycG9zZTogJ2FueScgfSxcbiAgICAgICAgeyBzcmM6ICcvaWNvbnMvaWNvbi01MTIucG5nJywgc2l6ZXM6ICc1MTJ4NTEyJywgdHlwZTogJ2ltYWdlL3BuZycsIHB1cnBvc2U6ICdhbnknIH0sXG4gICAgICAgIHsgc3JjOiAnL2ljb25zL2ljb24tbWFza2FibGUtNTEyLnBuZycsIHNpemVzOiAnNTEyeDUxMicsIHR5cGU6ICdpbWFnZS9wbmcnLCBwdXJwb3NlOiAnbWFza2FibGUnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAgd29ya2JveDoge1xuICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLHBuZyxzdmcsd29mZjJ9J10sXG4gICAgICBuYXZpZ2F0ZUZhbGxiYWNrOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgY2xlYW51cE91dGRhdGVkQ2FjaGVzOiB0cnVlLFxuICAgICAgY2xpZW50c0NsYWltOiB0cnVlLFxuICAgIH0sXG4gICAgZGV2T3B0aW9uczogeyBlbmFibGVkOiB0cnVlLCBuYXZpZ2F0ZUZhbGxiYWNrOiAnLycgfSxcbiAgfSldLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1EsU0FBUyxvQkFBb0I7QUFDN1IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRLEVBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxRQUFRO0FBQUEsSUFDekIsY0FBYztBQUFBLElBQ2QsZUFBZSxDQUFDLGVBQWUsYUFBYTtBQUFBLElBQzVDLFVBQVU7QUFBQSxNQUNSLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLGFBQWE7QUFBQSxNQUNiLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULGtCQUFrQjtBQUFBLE1BQ2xCLGFBQWE7QUFBQSxNQUNiLFlBQVksQ0FBQyxXQUFXO0FBQUEsTUFDeEIsT0FBTztBQUFBLFFBQ0wsRUFBRSxLQUFLLHVCQUF1QixPQUFPLFdBQVcsTUFBTSxhQUFhLFNBQVMsTUFBTTtBQUFBLFFBQ2xGLEVBQUUsS0FBSyx1QkFBdUIsT0FBTyxXQUFXLE1BQU0sYUFBYSxTQUFTLE1BQU07QUFBQSxRQUNsRixFQUFFLEtBQUssZ0NBQWdDLE9BQU8sV0FBVyxNQUFNLGFBQWEsU0FBUyxXQUFXO0FBQUEsTUFDbEc7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxjQUFjLENBQUMsa0NBQWtDO0FBQUEsTUFDakQsa0JBQWtCO0FBQUEsTUFDbEIsdUJBQXVCO0FBQUEsTUFDdkIsY0FBYztBQUFBLElBQ2hCO0FBQUEsSUFDQSxZQUFZLEVBQUUsU0FBUyxNQUFNLGtCQUFrQixJQUFJO0FBQUEsRUFDckQsQ0FBQyxDQUFDO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
