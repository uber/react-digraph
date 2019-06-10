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

export default class BwdlTransformer extends Transformer {
  static transform(input: any) {
    if (!input.States) {
      return {
        edges: [],
        nodes: [],
      };
    }

    const nodeNames = Object.keys(input.States);

    const nodes: INode[] = [];
    const edges: IEdge[] = [];

    nodeNames.forEach(name => {
      const currentNode = input.States[name];

      if (!currentNode) {
        return;
      }

      const nodeToAdd: INode = {
        title: name,
        type: currentNode.Type,
        x: currentNode.x || 0,
        y: currentNode.y || 0,
      };

      if (name === input.StartAt) {
        nodes.unshift(nodeToAdd);
      } else {
        nodes.push(nodeToAdd);
      }

      // create edges
      if (currentNode.Type === 'Choice') {
        // multiple edges
        currentNode.Choices.forEach(choice => {
          if (input.States[choice.Next]) {
            edges.push({
              source: name,
              target: choice.Next,
            });
          }
        });

        // Choice nodes carry both a Choices list and an optional Default value which is not part of the list.
        if (currentNode.Default) {
          edges.push({
            source: name,
            target: currentNode.Default,
          });
        }
      } else if (currentNode.Next) {
        if (input.States[currentNode.Next]) {
          // single edge
          edges.push({
            source: name,
            target: currentNode.Next,
          });
        }
      }
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
