/** @type {import('tailwindcss').Config} */
export default {
	content: [
	  "./index.html",
	  "./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
	  extend: {colors: {
        pin: 'red', // replace with your desired color
      }},
	},
	plugins: [],
  }