module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        require.resolve("babel-plugin-module-resolver"),
        {
          alias: {
            "@": "./",
          },
          root: ["./"],
        },
      ],
      [
        "module:react-native-dotenv",
        {
          envName: "CODE_PUSH_DEPLOYMENT_KEY",
          moduleName: "@env",
          path: ".env",
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
    ],
  };
};
