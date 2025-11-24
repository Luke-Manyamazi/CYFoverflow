import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import pluginReact from "eslint-plugin-react";
import globals from "globals";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs,jsx}"],
		plugins: { js },
		extends: ["js/recommended"],
		languageOptions: { globals: globals.node },
	},
	pluginReact.configs.flat.recommended,
]);
