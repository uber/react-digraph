const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  context: __dirname + '/src',
  entry: {
    main: './index.js',
    css: './styles/main.scss'
  },

  output: {
    filename: '[name].min.js',
    chunkFilename: '[name].min.js',
    path: __dirname + '/dist',
    publicPath: '/dist/',
    library: 'ReactDigraph',
    libraryTarget: 'commonjs2'
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          configFile: '.eslintrc',
        }
      },
      {
        test: /\.jsx?$/,
        // Don't exclude the node_modules directory, otherwise the error is:
        // [21:23:59] GulpUglifyError: unable to minify JavaScript
        // Caused by: SyntaxError: Unexpected token: name (e)
        // exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true
            }
          },
        ]
      },
      // All files with a '.ts' or '.tsx' extension will be handled by
      // 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },

      // All scss files
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader' // creates style nodes from JS strings
          },
          {
            loader: 'css-loader' // translates CSS into CommonJS
          },
          {
            loader: 'sass-loader' // compiles Sass to CSS
          }
        ]
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  },

  externals: {
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
    tslib: 'tslib'
  }
};
