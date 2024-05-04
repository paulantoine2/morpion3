/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        main: "url('./bg_desktop.png'), linear-gradient(215deg, #1e293b 0%, #0f172a 85%);",
      },
    },
    fontFamily: {
      sans: ["Lilita One"],
    },
  },
  plugins: [],
};
