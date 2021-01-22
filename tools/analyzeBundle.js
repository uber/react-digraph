import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import config from '../webpack.config';

config.plugins.push(new BundleAnalyzerPlugin());
process.env.NODE_ENV = 'development';

const compiler = webpack(config);

compiler.run((error, stats) => {
  if (error) {
    throw new Error(error);
  }

  console.log(stats);
});
