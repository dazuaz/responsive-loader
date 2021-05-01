module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["examples/*"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
  },
}
