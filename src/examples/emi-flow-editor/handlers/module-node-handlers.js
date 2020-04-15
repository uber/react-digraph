import { STG_BUCKET, PROD_BUCKET } from '../cognito';
import { NON_NODE_KEYS } from '../../../utilities/transformers/flow-v1-transformer';

const STG = 'staging';
const PROD = 'production';
const ENVS = [STG, PROD];
const ENV_BUCKETS = {
  [STG]: STG_BUCKET,
  [PROD]: PROD_BUCKET,
};

const moduleRegex = /libs\/modules\/(.*)\/(.*)_v(\d+)\.json$/;
const slotContextVarsPrefix = 'slot_';

const getModuleNodeHandlers = bwdlEditable => {
  bwdlEditable.getLatestVersionModuleDef = function(folder, name) {
    return this.getModuleDefs(folder, name).then(modulesDict =>
      this.getModuleDef(modulesDict, name)
    );
  }.bind(bwdlEditable);

  bwdlEditable.getModuleFolders = function() {
    const Prefix = `libs/modules/`;

    return this.props.s3
      .listObjectsV2({
        Bucket: ENV_BUCKETS[STG],
        Delimiter: '/',
        Prefix,
      })
      .promise()
      .then(data =>
        data.CommonPrefixes.map(cp => cp.Prefix).map(p =>
          p.slice(Prefix.length, -1)
        )
      );
  }.bind(bwdlEditable);

  bwdlEditable.getModuleDefs = function(folder, name) {
    const prefix = name ? `${name}_v` : '';

    return this.props.s3
      .listObjectsV2({
        Bucket: ENV_BUCKETS[STG],
        Delimiter: '/',
        Prefix: `libs/modules/${folder}/${prefix}`,
      })
      .promise()
      .then(
        function(data) {
          const modulesDict = {};

          data.Contents.filter(m => m.Key.endsWith('.json')).forEach(m => {
            const { name, version } = this.parseImportPath(m.Key);

            if (!modulesDict.name) {
              modulesDict[name] = {};
            }

            modulesDict[name][version] = { path: m.Key, name, version };
          });

          return modulesDict;
        }.bind(bwdlEditable)
      );
  }.bind(bwdlEditable);

  bwdlEditable._getModule = function(importPath, VersionId) {
    return this.props.s3
      .getObject({ Bucket: ENV_BUCKETS[STG], Key: importPath, VersionId })
      .promise()
      .then(data => data.Body.toString());
  }.bind(bwdlEditable);

  bwdlEditable.parseImportPath = function(importPath) {
    try {
      if (importPath) {
        const [, folder, name, version, ..._] = moduleRegex.exec(importPath); // eslint-disable-line no-unused-vars

        return { folder, name, version };
      } else {
        return { folder: null, name: null, version: null };
      }
    } catch (err) {
      throw Error(`Can't parse module path '${importPath}'`, err);
    }
  }.bind(bwdlEditable);

  bwdlEditable._changeModuleIndex = function(json, prevState, newIndex) {
    this._changeJsonIndex(json, prevState, newIndex);
  }.bind(bwdlEditable);

  bwdlEditable.getModuleDef = function(modulesDict, name, version) {
    version = version || Object.keys(modulesDict[name]).slice(-1);

    return modulesDict[name][version];
  }.bind(bwdlEditable);

  bwdlEditable.getModuleOutput = function(moduleDef) {
    return this._getModule(moduleDef.path).then(contents => {
      const moduleJson = JSON.parse(contents || '{}');

      const nodeKeys = Object.keys(moduleJson).filter(
        k => !NON_NODE_KEYS.includes(k)
      );
      const slotContextVars = [
        ...new Set(
          nodeKeys
            .map(k => moduleJson[k])
            .map(n => n.question.connections)
            .flat(1)
            .map(conn => conn.setContext)
            .map(c => Object.keys(c))
            .flat(1)
            .filter(cvar => cvar.startsWith(slotContextVarsPrefix))
        ),
      ];

      const size = nodeKeys.length;

      return { slotContextVars, size };
    });
  }.bind(bwdlEditable);

  bwdlEditable.importModule = function(moduleDef) {
    return this.getModuleOutput(moduleDef).then(
      function({ slotContextVars, size }) {
        this.changeJson(
          function(json, prevState) {
            const { newIndex } = this.getAvailableIndex(
              json,
              moduleDef.name,
              '-'
            );

            this._changeModuleIndex(json, prevState, newIndex);
            json[newIndex] = {
              ...json[newIndex],
              slotContextVars,
              size,
              importPath: moduleDef.path,
            };
          }.bind(bwdlEditable)
        );
      }.bind(bwdlEditable)
    );
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

        if (!aNode || NON_NODE_KEYS.includes(name)) {
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
