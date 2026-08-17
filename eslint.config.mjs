import antfu from "@antfu/eslint-config";
import reactCompiler from "eslint-plugin-react-compiler";

export default antfu(
  {
    type: "app",
    typescript: {
      parserOptions: {
        project: null,
      },
    },
    react: true,
    stylistic: {
      indent: 2,
      quotes: "double",
      semi: true,
    },
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/ios/**",
      "**/android/**",
      "**/coverage/**",
      "**/.maestro/**",
      "**/*.md",
      "**/*.d.ts",
      "**/babel.config.js",
      "**/metro.config.js",
      "**/app.config.ts",
      "**/env.ts",
    ],
  },
  {
    name: "react-compiler",
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
  {
    name: "react-rules",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    name: "disable-typed-rules",
    files: ["**/*.{ts,tsx,js}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    name: "custom-rules",
    rules: {
      "no-console": "off",
      "curly": ["error", "all"],
      "style/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "style/operator-linebreak": ["error", "after"],
      "style/max-statements-per-line": "off",
      "style/jsx-one-expression-per-line": "off",
      "style/multiline-ternary": "off",
      "style/arrow-parens": "off",
      "antfu/if-newline": "off",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "ts/no-explicit-any": "warn",
      "ts/no-require-imports": "off",
      "ts/no-use-before-define": "off",
      "ts/consistent-type-definitions": "off",
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-imports": "off",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    name: "config-files",
    files: ["**/app.config.ts", "**/env.ts", "**/env.js"],
    rules: {
      "antfu/no-import-dist": "off",
      "node/prefer-global/process": "off",
    },
  },
  {
    name: "api-client",
    files: ["**/lib/api/client.ts"],
    rules: {
      "node/prefer-global/process": "off",
    },
  },
);
