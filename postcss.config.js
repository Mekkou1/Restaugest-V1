module.exports = {
    plugins: {
      'tailwindcss': {},
      'autoprefixer': {},
      'postcss-preset-env': {
        stage: 3,
        features: {
          'nesting-rules': true,
          'custom-properties': true,
          'custom-media-queries': true,
          'custom-selectors': true,
          'gap-properties': true,
          'media-query-ranges': true
        }
      },
      'cssnano': process.env.NODE_ENV === 'production' ? {
        preset: ['default', {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: false
        }]
      } : false
    }
  };
  