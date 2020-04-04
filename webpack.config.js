const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const webpack = require("webpack");

module.exports = env => {
  const { project, NODE_ENV, mockApi } = env || {};

  if (!project) throw Error("no project environment variable set.");

  const sharedConfig = {
    // devtool: "inline-source-map",
    mode: NODE_ENV || "development",
    context: path.resolve(__dirname, project),
    output: {
      filename: "[name].js"
    },
    resolve: { extensions: [".js", ".jsx", ".tsx", ".ts"] },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    plugins: []
  };

  const serverConfig = {
    ...sharedConfig,
    entry: {
      serverLib: "./src/server/serverLib"
    },
    output: {
      ...sharedConfig.output,
      library: "ServerLib",
      path: path.resolve(__dirname, project, "dist/server")
    },
    plugins: [
      new CleanWebpackPlugin(),
      ...(sharedConfig.plugins || []),
      // Copies the raw server.js file, that is facade for serverlib (needed to satisfy gapps requirements)
      new CopyPlugin([{ from: "./src/server/server.js" }])
    ]
  };

  const mockedApiPlugins = mockApi
    ? [
        new webpack.NormalModuleReplacementPlugin(
          /\.shared\\api\.ts/,
          `..\\${project}\\src\\client\\apiMock.ts`
        )
      ]
    : [];

  const clientConfig = {
    ...sharedConfig,
    devServer: {
      index: "./client/index.html",
      open: true
    },
    entry: {
      clientApp: "./src/client/clientApp"
    },
    output: {
      ...sharedConfig.output,
      // To support legacy knockout code we export Client side code as global variable
      // This enables mocking support when running locally because we can mock api.ts
      library: "ClientLib",
      path: path.resolve(__dirname, project, "dist/client")
    },
    plugins: [
      new CleanWebpackPlugin(),
      ...(sharedConfig.plugins || []),
      ...mockedApiPlugins,
      new HtmlWebpackPlugin({
        template: "./src/client/index.html",
        title: project,
        inlineSource: ".(js|css)$"
      }),
      new HtmlWebpackInlineSourcePlugin()
    ]
  };

  return [clientConfig, serverConfig];
};
