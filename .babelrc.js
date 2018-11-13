module.exports = function(api) {
  return {
    compact: true,

    plugins: [
      "@babel/plugin-transform-object-assign",
      "@babel/plugin-transform-destructuring",
      "@babel/plugin-proposal-object-rest-spread",
      ["@babel/plugin-proposal-class-properties", { loose: true }],

      // Stage 2
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      "@babel/plugin-proposal-function-sent",
      "@babel/plugin-proposal-export-namespace-from",
      "@babel/plugin-proposal-numeric-separator",
      "@babel/plugin-proposal-throw-expressions",

      // Stage 3
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-syntax-import-meta",
      "@babel/plugin-proposal-json-strings"
    ],
    presets: [
      "@babel/preset-env",
      "@babel/preset-flow",
      ["@babel/preset-react", { development: api.env('development') }],
    ],
  };
}
