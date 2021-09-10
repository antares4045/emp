const isDev = process.env.NODE_ENV === "development";

const path = require("path");

const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const fs = require("fs");
let config = JSON.parse(fs.readFileSync("./configs/build_configs.json"));
config = Object.fromEntries(
  Object.entries(config).map(([key, value]) => {
    if (key.match(/.+Path$/)) return [key, path.resolve(__dirname, value)];
    else return [key, value];
  })
);

const fileName = (ext) =>
  isDev ? `${ext}/[name].${ext}` : `${ext}/[name]-[hash].${ext}`;

const { srcPath, distPath, publicPath } = config;

const jsReg = /\.(m?js|jsx)$/;
const imgReg = /\.(png|jpg|svg|gif|ico)$/;
const fontReg = /\.(ttf|woof|woof2|eot)$/;

let plugins = [
  new HtmlWebPackPlugin({
    template: path.resolve(publicPath, "index.html"),
    title: config.title,
  }),
  new CopyPlugin({
    patterns: [
      {
        from: publicPath,
        to: distPath,
        filter: async (resourcePath) =>
          path.normalize(resourcePath) !=
          path.normalize(path.resolve(publicPath, "index.html")),
      },
    ],
  }),
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin({
    filename: fileName("css"),
  }),
];

plugins.push(new webpack.HotModuleReplacementPlugin());

module.exports = {
  context: srcPath,
  entry: {
    main: ["@babel/polyfill", "./index.js"],
  },
  output: {
    path: distPath,
    filename: fileName("js"),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    minimizer: isDev
      ? []
      : [new OptimizeCssAssetsPlugin(), new TerserWebpackPlugin()],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: config.resolveExtentions,
    alias: {
      "@": srcPath,
      "@config": config.configPath,
      "@assets": config.assetsPath,
    },
  },
  module: {
    rules: [
      {
        test: /\.(c|sa|sc)ss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader, options: { publicPath: "/" } },
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: imgReg,
        use: [{ loader: "file-loader", options: { outputPath: "imgs" } }],
      },
      {
        test: fontReg,
        use: [{ loader: "file-loader", options: { outputPath: "fonts" } }],
      },
      {
        test: jsReg,
        exclude: /node_modules/,

        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          },
        },
      },
    ],
  },
  devtool : isDev ? 'source-map' : 'hidden-source-map',
  plugins,
  devServer: {
    port: process.env.PORT || "3000",
    host: process.env.HOST || 'localhost',
    disableHostCheck: true,   
    hot: isDev,
    watchOptions: {
        poll: 1000,
        aggregateTimeout: 1000
    },
    

  },
};
