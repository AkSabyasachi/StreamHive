/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
  extend: {
    colors: {
      primary: "#3B82F6", // or any brand color you prefer
    },
  },
},
  plugins: [],
}

