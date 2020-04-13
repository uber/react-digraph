import { STG_BUCKET, PROD_BUCKET } from '../cognito';
import { getErrorMessage } from '../components/common';

const STG = 'staging';
const PROD = 'production';
const ENVS = [STG, PROD];
const ENV_BUCKETS = {
  [STG]: STG_BUCKET,
  [PROD]: PROD_BUCKET,
};

const moduleRegex = /libs\/modules\/test\/(.*)_v(\d+)\.json$/;
const slotsRegex = /"slot_name": "(.*)",/g;
const slotContextVarsRegex = /"setContext": {[^}]*?"(slot_.*?)"[^}]*?}/g;
const slotContextVarsPrefix = 'slot_';

const getModuleNodeHandlers = bwdlEditable => {
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

              data.Contents.filter(m => m.Key.endsWith('.json')).forEach(m => {
                const { name, version } = this.parseImportPath(m.Key);

                if (!modulesDict.name) {
                  modulesDict[name] = {};
                }

                modulesDict[name][version] = { path: m.Key, name, version };
              });

              resolve(modulesDict);
            }
          }.bind(bwdlEditable)
        );
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  bwdlEditable.getModule = function(importPath, VersionId) {
    return this.props.s3
      .getObject({ Bucket: ENV_BUCKETS[STG], Key: importPath, VersionId })
      .promise()
      .then(data => data.Body.toString());
  }.bind(bwdlEditable);

  bwdlEditable.parseImportPath = function(importPath) {
    try {
      if (importPath) {
        const [, name, version, ..._] = moduleRegex.exec(importPath); // eslint-disable-line no-unused-vars

        return { name, version };
      }
    } catch (err) {
      this.alert.error(
        `Can't parse module path '${importPath}': ${getErrorMessage(err)}`
      );
    }

    return { name: null, version: null };
  }.bind(bwdlEditable);

  bwdlEditable._changeModuleIndex = function(json, prevState, newIndex) {
    this._changeJsonIndex(json, prevState, newIndex);
  }.bind(bwdlEditable);

  bwdlEditable.getModuleDef = function(modulesDict, name, version) {
    version = version || Object.keys(modulesDict[name]).slice(-1);

    return modulesDict[name][version];
  }.bind(bwdlEditable);

  bwdlEditable.importModule = function(module) {
    return this.getModule(module.path).then(contents => {
      const slots = [
        ...new Set(Array.from(contents.matchAll(slotsRegex)).map(m => m[1])),
      ];
      const slotContextVars = [
        ...new Set(
          Array.from(contents.matchAll(slotContextVarsRegex)).map(m => m[1])
        ),
      ];

      this.changeJson(
        function(json, prevState) {
          const { newIndex } = this.getAvailableIndex(json, module.name, '-');

          this._changeModuleIndex(json, prevState, newIndex);
          json[newIndex] = {
            ...json[newIndex],
            slots,
            slotContextVars,
            importPath: module.path,
          };
        }.bind(bwdlEditable)
      );
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeModulePrefix = function(newPrefix) {
    this.changeSelectedNode((node, index, newJson) => {
      const nodeNames = Object.keys(newJson);
      const updatedEdges = new Set();
      const oldSlotPrefix = node.prefix ? `${node.prefix}-` : node.prefix;
      const newSlotPrefix = newPrefix ? `${newPrefix}-` : newPrefix;
      const updatePrefix = slotContextVar =>
        `${slotContextVarsPrefix}${newSlotPrefix}${slotContextVar.substr(
          slotContextVarsPrefix.length + oldSlotPrefix.length
        )}`;

      nodeNames.forEach(name => {
        const aNode = newJson[name];

        if (!aNode || ['name', 'current', 'faqs'].includes(name)) {
          return;
        }

        const q = aNode.question;

        q.connections.forEach(
          function(connection) {
            const { context } = connection;

            this.getFilterItems(context)
              .filter(
                ({ key, op, value }) =>
                  node.slotContextVars.includes(key) &&
                  key.startsWith(slotContextVarsPrefix)
              )
              .forEach(({ key, op, value }) => {
                delete context[`${key}_${op}`];
                context[`${updatePrefix(key)}_${op}`] = value;

                updatedEdges.add(
                  this.state.edges.find(
                    e => e.target === connection.goto && e.source === name
                  )
                );
              });
          }.bind(bwdlEditable)
        );
      });
      updatedEdges.forEach(e => this.GraphView.asyncRenderEdge(e));

      node.slotContextVars = node.slotContextVars.map(s => updatePrefix(s));
      node.prefix = newPrefix;
    });
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export { getModuleNodeHandlers, STG, PROD, ENVS };
