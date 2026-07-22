/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        surface: "#f3f4f6",
        border: "#e5e7eb",
        textPrimary: "#1f2937",
        textSecondary: "#6b7280",
      },
    },
  },
  plugins: [],
};
