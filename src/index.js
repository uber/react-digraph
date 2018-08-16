// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import Edge from './components/edge';
import GraphUtils from './components/graph-util';
import GraphView from './components/graph-view';
import Node from './components/node';
import { type LayoutEngine as LayoutEngineConfigTypes } from './utilities/layout-engine/layout-engine-config';
import BwdlTransformer from './utilities/transformers/bwdl-transformer';

export const ReactDigraph = {
  BwdlTransformer,
  Edge,
  GraphUtils,
  GraphView,
  Node
};
export type LayoutEngineType = LayoutEngineConfigTypes;
export default ReactDigraph;
