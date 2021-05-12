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

import { type IEdge } from '../components/edge';
import { type INode } from '../components/node';
import { type IPoint } from '../components/graph-view-props';
import fastDeepEqual from 'fast-deep-equal';

export type INodeMapNode = {
  node: INode,
  originalArrIndex: number,
  incomingEdges: IEdge[],
  outgoingEdges: IEdge[],
  parents: INode[],
  children: INode[],
};

class GraphUtils {
  static getNodesMap(nodes: any, key: string) {
    const map = {};
    const arr = Object.keys(nodes).map(key => nodes[key]);
    let item = null;

    for (let i = 0; i < arr.length; i++) {
      item = arr[i];
      map[`key-${item[key]}`] = {
        children: [],
        incomingEdges: [],
        node: item,
        originalArrIndex: i,
        outgoingEdges: [],
        parents: [],
      };
    }

    return map;
  }

  static getEdgesMap(arr: IEdge[]) {
    const map = {};
    let item = null;

    for (let i = 0; i < arr.length; i++) {
      item = arr[i];

      if (item.target == null) {
        continue;
      }

      map[`${item.source != null ? item.source : ''}_${item.target}`] = {
        edge: item,
        originalArrIndex: i,
      };
    }

    return map;
  }

  static linkNodesAndEdges(nodesMap: any, edges: IEdge[]) {
    let nodeMapSourceNode = null;
    let nodeMapTargetNode = null;
    let edge = null;

    for (let i = 0; i < edges.length; i++) {
      edge = edges[i];

      if (edge.target == null) {
        continue;
      }

      const sourceID = `key-${edge.source != null ? edge.source : ''}`;
      const targetID = `key-${edge.target}`;

      nodeMapSourceNode = nodesMap[sourceID];
      nodeMapTargetNode = nodesMap[targetID];

      // avoid an orphaned edge
      if (nodeMapSourceNode && nodeMapTargetNode) {
        nodeMapSourceNode.outgoingEdges.push(edge);
        nodeMapTargetNode.incomingEdges.push(edge);
        nodeMapSourceNode.children.push(nodeMapTargetNode);
        nodeMapTargetNode.parents.push(nodeMapSourceNode);
      } else {
        // This can get noisy because linkNodesAndEdges runs a lot.
        // The consumer should have cleared out the edges before rendering react-digraph
        console.warn('react-digraph: Found orphaned edges');
      }
    }
  }

  static removeElementFromDom(id: string, searchElement?: any = document) {
    const container = searchElement.querySelector(`[id='${id}']`);

    if (container && container.parentNode) {
      container.parentNode.removeChild(container);

      return true;
    }

    return false;
  }

  static findParent(element: any, selector: string, stopAtSelector?: string) {
    if (!element || (stopAtSelector && element?.matches?.(stopAtSelector))) {
      return null;
    }

    if (element?.matches?.(selector)) {
      return element;
    } else if (element?.parentNode) {
      return GraphUtils.findParent(
        element.parentNode,
        selector,
        stopAtSelector
      );
    }

    return null;
  }

  static classNames(...args: any[]) {
    let className = '';

    for (const arg of args) {
      if (typeof arg === 'string' || typeof arg === 'number') {
        className += ` ${arg}`;
      } else if (
        typeof arg === 'object' &&
        !Array.isArray(arg) &&
        arg !== null
      ) {
        Object.keys(arg).forEach(key => {
          if (arg[key]) {
            className += ` ${key}`;
          }
        });
      } else if (Array.isArray(arg)) {
        className += ` ${arg.join(' ')}`;
      }
    }

    return className.trim();
  }

  static yieldingLoop(count, chunksize, callback, finished) {
    let i = 0;

    (function chunk() {
      const end = Math.min(i + chunksize, count);

      for (; i < end; ++i) {
        callback.call(null, i);
      }

      if (i < count) {
        setTimeout(chunk, 0);
      } else {
        finished && finished.call(null);
      }
    })();
  }

  // retained for backwards compatibility
  static hasNodeShallowChanged(prevNode: INode, newNode: INode) {
    return !this.isEqual(prevNode, newNode);
  }

  static isEqual(prevNode: any, newNode: any) {
    return fastDeepEqual(prevNode, newNode);
  }

  static findNodesWithinArea(
    start: IPoint,
    end: IPoint,
    nodes: INode[],
    nodeKey: string
  ): Map<string, INode> {
    const smallerX = Math.min(start.x, end.x);
    const smallerY = Math.min(start.y, end.y);
    const largerX = Math.max(end.x, start.x);
    const largerY = Math.max(end.y, start.y);

    const foundNodesMap = new Map();

    nodes.forEach(node => {
      if (
        node.x >= smallerX &&
        node.x <= largerX &&
        node.y >= smallerY &&
        node.y <= largerY
      ) {
        foundNodesMap.set(node[nodeKey], node);
      }
    });

    return foundNodesMap;
  }

  static findConnectedEdgesForNodes(
    nodes: Map<string, INode>,
    edgesMap: any,
    nodeKey: string
  ): Map<string, IEdge> {
    const foundEdgesMap = new Map();

    for (const nodeA of nodes) {
      for (const nodeB of nodes) {
        // nodeA and nodeB are map arrays: ["key", node]
        // Find edges where A is connected to B or B is connected to A
        const edgeAB = edgesMap[`${nodeA[1][nodeKey]}_${nodeB[1][nodeKey]}`];
        const edgeBA = edgesMap[`${nodeB[1][nodeKey]}_${nodeA[1][nodeKey]}`];

        if (edgeAB != null) {
          foundEdgesMap.set(
            `${edgeAB.edge.source}_${edgeAB.edge.target}`,
            edgeAB.edge
          );
        }

        if (edgeBA != null) {
          foundEdgesMap.set(
            `${edgeBA.edge.source}_${edgeBA.edge.target}`,
            edgeBA.edge
          );
        }
      }
    }

    return foundEdgesMap;
  }
}

export default GraphUtils;
