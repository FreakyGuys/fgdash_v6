/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'yellow-freaky': '#FFDD00',
        'black-freaky': '#000000',
        'dark-blue': '#0A0E17',
        'gray-dark': '#333333',
        'gray-light': '#CCCCCC',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderColor: {
        'yellow-freaky': '#FFDD00',
      },
      textColor: {
        'yellow-freaky': '#FFDD00',
      },
      backgroundColor: {
        'yellow-freaky': '#FFDD00',
        'black-freaky': '#000000',
      }
    }
  },
  plugins: [],
}
