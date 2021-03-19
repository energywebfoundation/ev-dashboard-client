// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@rushstack/eslint-config/profile/node'],
  parserOptions: { tsconfigRootDir: __dirname }
};

// module.exports = {
//   parser: "@typescript-eslint/parser",
//   parserOptions: {
//     project: "tsconfig.json",
//     sourceType: "module",
//   },
//   plugins: ["@typescript-eslint/eslint-plugin"],
//   extends: [
//     "plugin:@typescript-eslint/eslint-recommended",
//     "plugin:@typescript-eslint/recommended",
//     "prettier",
//     "prettier/@typescript-eslint",
//   ],
//   root: true,
//   env: {
//     node: true,
//     jest: true,
//   },
//   rules: {
//     "@typescript-eslint/interface-name-prefix": "off",
//   },
// };
