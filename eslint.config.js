const globals = require("globals");
const js = require("@eslint/js");

const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // https://eslint.org/docs/latest/use/configure/language-options#predefined-global-variables
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "prefer-const": "off",
      "no-console": "off",
      "no-async-promise-executor": "off",
      // https://eslint.org/docs/latest/rules/no-unused-vars
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "none", // ignore catch block variables
          ignoreRestSiblings: false,
          reportUsedIgnorePattern: false,
        },
      ],
    },
  },
  {
    ignores: ["coverage/**", "test/webroot/**"],
  },
];
