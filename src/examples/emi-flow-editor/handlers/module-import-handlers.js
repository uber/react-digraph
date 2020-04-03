import { STG_BUCKET, PROD_BUCKET } from '../cognito';

const STG = 'staging';
const PROD = 'production';
const ENVS = [STG, PROD];
const ENV_BUCKETS = {
  [STG]: STG_BUCKET,
  [PROD]: PROD_BUCKET,
};

const moduleRegex = /(.*)_v(\d+)\.flib$/;

const getModuleImportHandlers = bwdlEditable => {
  bwdlEditable.getModules = function() {
    return new Promise(
      function(resolve, reject) {
        this.props.s3.listObjects(
          {
            Bucket: ENV_BUCKETS[STG],
            Delimiter: '/',
            Prefix: 'libs/modules/test/',
          },
          function(err, data) {
            if (err) {
              reject(err);
            } else {
              const modulesDict = {};

              data.Contents.filter(m => m.Key.endsWith('.flib')).forEach(m => {
                const [, name, version, ..._] = moduleRegex.exec(m.Key); // eslint-disable-line no-unused-vars

                modulesDict.get(name, {})[version] = { name, version, m };
              });

              resolve(modulesDict);
            }
          }
        );
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export { getModuleImportHandlers, STG, PROD, ENVS };
