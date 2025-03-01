const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // URL de votre backend
        changeOrigin: true, // Nécessaire pour éviter les problèmes CORS
        pathRewrite: { '^/api': '' }, // Facultatif : Réécrit l'URL pour supprimer le préfixe /api
      },
    },
  },
});

