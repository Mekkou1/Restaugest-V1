const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Development server configuration
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      },
      '/uploads': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },

  // Build configuration
  configureWebpack: {
    performance: {
      hints: false
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000
      }
    }
  },

  // PWA configuration
  pwa: {
    name: 'Restaugest',
    themeColor: '#ff6600',
    msTileColor: '#ff6600',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true
    }
  },

  // CSS configuration
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/styles/variables.scss";
        `
      }
    }
  },

  // Chain webpack configuration
  chainWebpack: config => {
    // SVG Loader
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('vue-loader')
      .loader('vue-loader-v16')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

    // Set app title
    config.plugin('html').tap(args => {
      args[0].title = 'Restaugest';
      return args;
    });
  },

  // Production source maps
  productionSourceMap: process.env.NODE_ENV !== 'production'
});
