import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true, // allows describe, it, expect without import
		environment: "node", // Node environment for Express tests
		include: ["**/__tests__/**/*.test.js"],
	},
});
