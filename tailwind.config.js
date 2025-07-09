/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        junga: "Kanchenjunga",
        montserrat: "Montserrat",
        lexend: "Lexend",
        comfortaa: "Comfortaa",
      },
    },
    screens: {
      sm: "340px",
      md: "540px",
      lg: "768px",
      xl: "1180px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "12px",
        md: "24px",
      },
    },
    keyframes: {
      "up-down": {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-5px)" },
      },
    },
    animation: {
      "up-down": "up-down 2s ease-in-out infinite",
    },
  },
  plugins: [require("tailwindcss-text-stroke")],
};
