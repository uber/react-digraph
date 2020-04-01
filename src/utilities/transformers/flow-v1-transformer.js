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

import { type IEdge } from '../../components/edge';
import { type INode } from '../../components/node';
import Transformer, { type IGraphInput } from './transformer';

export default class FlowV1Transformer extends Transformer {
  static transform(input: any) {
    if (!input) {
      return {
        edges: [],
        nodes: [],
      };
    }

    const nodeNames = Object.keys(input);

    const nodes: INode[] = [];
    const edges: IEdge[] = [];

    nodeNames.forEach(name => {
      const currentNode = input[name];

      if (!currentNode || ['name', 'current', 'faqs'].includes(name)) {
        return;
      }

      const q = currentNode.question;

      const nodeToAdd: INode = {
        title: name,
        first: name === input.current,
        type: currentNode.Type,
        gnode: currentNode,
        x: currentNode.x || 0,
        y: currentNode.y || 0,
        // id: currentNode.id,
      };

      nodes.push(nodeToAdd);

      // create edges
      q.connections.forEach(connection => {
        if (input[connection.goto]) {
          const edge = edges.find(
            e => e.target === connection.goto && e.source === name
          );

          if (edge) {
            edge.conns.push(connection);
            edge.isDefault = edge.isDefault || connection.isDefault;
          } else {
            edges.push({
              source: name,
              target: connection.goto,
              sourceNode: nodeToAdd,
              conns: [connection],
              isDefault: connection.isDefault,
            });
          }
        }
      });
    });

    return {
      edges,
      nodes,
    };
  }

  static revert(graphInput: IGraphInput) {
    return graphInput;
  }
}
