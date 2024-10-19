import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { flushSync } from "react-dom";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
	  proxy: {
		'/api': {
		  target: 'http://localhost:8000', // Your backend server URL
		  changeOrigin: true,
		  rewrite: (path) => path.replace(/^\/api/, ''), // Optional: Adjust the path if necessary
		},
	  },
	},
  });
