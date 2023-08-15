/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // extend: {},
    extend: {
      animation: {
        moveUpDown: 'moveUpDown 10s ease-in-out infinite', // Adjust the duration as needed
      },
      keyframes: {
        moveUpDown: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-115px)', // Adjust the distance the image moves up
          }
        }
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["night", 'bumblebee'],
  }
}