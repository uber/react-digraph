const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  context: __dirname + '/src',
  entry: {
    main: './index.js',
    example: './examples/app.js',
    exampleCss: './examples/app.scss',
    css: './styles/main.scss'
  },

  // cheap is not the best for quality, but it speeds up the build. the downside
  // is the console doesn't report the correct line numbers, but the filenames are
  // correct and the links work.
  devtool: 'cheap-eval-source-map', //'source-map',

  output: {
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[name].js',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
    path: __dirname + '/dist',
    publicPath: '/dist/',
    library: 'ReactDigraph',
    libraryTarget: 'var' //'commonjs2' // ,
    // libraryExport: 'default'
  },

  devServer: {
    contentBase: [path.join(__dirname, 'src', 'examples'), path.join(__dirname, 'dist')],
    compress: true,
    port: 9000,
    watchContentBase: true
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
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              // presets: ['es2015']
            }
          },
          // Need to run the react preset first to strip flow annotations
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     babelrc: false,
          //     presets: ['react'],
          //     plugins: ['transform-class-properties']
          //   }
          // }
        ]
      },
      // All files with a '.ts' or '.tsx' extension will be handled by
      // 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },

      // All output '.js' files will have any sourcemaps re-processed by
      // 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
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
    new webpack.WatchIgnorePlugin([/\.d\.ts$/]),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {
        from: './examples/**/index.html',
        to: 'index.html'
      },
      {
        from: './examples/**/*.js',
        to: '[name].js'
      }
    ])
  ],

  externals: {
    // TODO: figure out how to deal with externals
    // react: 'React',
    // 'react-dom': 'ReactDOM',
    // d3: 'd3',
    tslib: 'tslib'
  }
};
