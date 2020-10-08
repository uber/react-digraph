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

import type { IEdge } from '../components/edge';
import type { INode } from '../components/node';
import fastDeepEqual from 'fast-deep-equal';

export type INodeMapNode = {
  node: INode;
  originalArrIndex: number;
  incomingEdges: IEdge[];
  outgoingEdges: IEdge[];
  parents: INode[];
  children: INode[];
};

class GraphUtils {
  static getNodesMap(nodes: any, key: string) {
    const map: {
      [key: string]: {
        children: any[];
        incomingEdges: any[];
        node: typeof nodes[0];
        originalArrIndex: number;
        outgoingEdges: any[];
        parents: any[];
      };
    } = {};

    const arr = Object.keys(nodes).map((key) => nodes[key]);
    let item: any;

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
    const map: {
      [key: string]: {
        edge: IEdge;
        originalArrIndex: number;
      };
    } = {};
    let item: IEdge;

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

      nodeMapSourceNode =
        nodesMap[`key-${edge.source != null ? edge.source : ''}`];
      nodeMapTargetNode = nodesMap[`key-${edge.target}`];

      // avoid an orphaned edge
      if (nodeMapSourceNode && nodeMapTargetNode) {
        nodeMapSourceNode.outgoingEdges.push(edge);
        nodeMapTargetNode.incomingEdges.push(edge);
        nodeMapSourceNode.children.push(nodeMapTargetNode);
        nodeMapTargetNode.parents.push(nodeMapSourceNode);
      }
    }
  }

  static removeElementFromDom(id: string, searchElement: any = document) {
    const container = searchElement.querySelector(`#${id}`);

    if (container && container.parentNode) {
      container.parentNode.removeChild(container);

      return true;
    }

    return false;
  }

  static findParent(element: any, selector: string): any {
    if (element && element.matches && element.matches(selector)) {
      return element;
    } else if (element && element.parentNode) {
      return this.findParent(element.parentNode, selector);
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
        Object.keys(arg).forEach((key) => {
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

  static yieldingLoop(
    count: number,
    chunksize: number,
    callback: Function,
    finished?: Function
  ) {
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
}

export default GraphUtils;
