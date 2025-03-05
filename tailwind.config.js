/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './public/**/*.html',
      './src/**/*.{vue,js,ts,jsx,tsx}'
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#ff6600',
            50: '#fff3e6',
            100: '#ffe6cc',
            200: '#ffcc99',
            300: '#ffb366',
            400: '#ff9933',
            500: '#ff8000',
            600: '#ff6600',
            700: '#cc5200',
            800: '#993d00',
            900: '#662900'
          },
          secondary: {
            DEFAULT: '#343a40',
            50: '#f8f9fa',
            100: '#e9ecef',
            200: '#dee2e6',
            300: '#ced4da',
            400: '#adb5bd',
            500: '#6c757d',
            600: '#495057',
            700: '#343a40',
            800: '#212529',
            900: '#000000'
          }
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
          heading: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif']
        },
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem'
        },
        maxWidth: {
          '8xl': '88rem',
          '9xl': '96rem'
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '2rem'
        },
        boxShadow: {
          'soft': '0 2px 4px rgba(0,0,0,0.1)',
          'medium': '0 4px 6px rgba(0,0,0,0.1)',
          'hard': '0 10px 15px rgba(0,0,0,0.1)'
        },
        animation: {
          'spin-slow': 'spin 3s linear infinite',
          'bounce-slow': 'bounce 3s infinite',
          'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite'
        },
        transitionDuration: {
          '400': '400ms'
        },
        zIndex: {
          '60': '60',
          '70': '70',
          '80': '80',
          '90': '90',
          '100': '100'
        }
      }
    },
    plugins: [
      require('@tailwindcss/forms')({
        strategy: 'class'
      }),
      require('@tailwindcss/typography'),
      require('@tailwindcss/aspect-ratio'),
      require('@tailwindcss/line-clamp')
    ],
    variants: {
      extend: {
        opacity: ['disabled'],
        cursor: ['disabled'],
        backgroundColor: ['active', 'disabled'],
        textColor: ['active', 'disabled'],
        borderColor: ['active', 'disabled']
      }
    },
    darkMode: 'class',
    future: {
      removeDeprecatedGapUtilities: true,
      purgeLayersByDefault: true,
      defaultLineHeights: true,
      standardFontWeights: true
    }
  };
  