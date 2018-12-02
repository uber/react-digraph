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

declare module "react-digraph" {

  export type INode = {
    title: string;
    x?: number | null;
    y?: number | null;
    type?: string;
    subtype?: string | null;
    [key: string]: any;
  };

  export type IPoint = {
    x: number;
    y: number;
  };

  export type INodeProps = {
    data: INode;
    id: string;
    nodeTypes: any; // TODO: make a nodeTypes interface
    nodeSubtypes: any; // TODO: make a nodeSubtypes interface
    opacity?: number;
    nodeKey: string;
    nodeSize?: number;
    onNodeMouseEnter: (event: any, data: any, hovered: boolean) => void;
    onNodeMouseLeave: (event: any, data: any) => void;
    onNodeMove: (point: IPoint, id: string, shiftKey: boolean) => void;
    onNodeSelected: (data: any, id: string, shiftKey: boolean) => void;
    onNodeUpdate: (point: IPoint, id: string, shiftKey: boolean) => void;
    renderNode?: (
      nodeRef: any,
      data: any,
      id: string,
      selected: boolean,
      hovered: boolean
    ) => any;
    renderNodeText?: (
      data: any,
      id: string | number,
      isSelected: boolean
    ) => any;
    isSelected: boolean;
    layoutEngine?: any;
    viewWrapperElem: HTMLDivElement;
  };

  export const Node: React.ComponentClass<INodeProps>;

  export type IEdge = {
    source: string;
    target: string;
    type?: string;
    handleText?: string;
    [key: string]: any;
  };

  export type ITargetPosition = {
    x: number;
    y: number;
  };

  export type IEdgeProps = {
    data: IEdge;
    edgeTypes: any; // TODO: create an edgeTypes interface
    edgeHandleSize?: number;
    nodeSize?: number;
    sourceNode: INode | null;
    targetNode: INode | ITargetPosition;
    isSelected: boolean;
    nodeKey: string;
    viewWrapperElem: HTMLDivElement;
  };

  export const Edge: React.Component<IEdgeProps>;

  export type IGraphViewProps = {
    backgroundFillId?: string;
    edges: any[];
    edgeArrowSize?: number;
    edgeHandleSize?: number;
    edgeTypes: any;
    gridDotSize?: number;
    gridSize?: number;
    gridSpacing?: number;
    layoutEngineType?: LayoutEngineType;
    maxTitleChars?: number;
    maxZoom?: number;
    minZoom?: number;
    nodeKey: string;
    nodes: any[];
    nodeSize?: number;
    nodeSubtypes: any;
    nodeTypes: any;
    readOnly?: boolean;
    selected: any;
    showGraphControls?: boolean;
    zoomDelay?: number;
    zoomDur?: number;
    canCreateEdge?: (startNode?: INode, endNode?: INode) => boolean;
    canDeleteEdge?: (selected: any) => boolean;
    canDeleteNode?: (selected: any) => boolean;
    onCopySelected?: () => void;
    onCreateEdge: (sourceNode: INode, targetNode: INode) => void;
    onCreateNode: (x: number, y: number) => void;
    onDeleteEdge: (selectedEdge: IEdge, edges: IEdge[]) => void;
    onDeleteNode: (selected: any, nodeId: string, nodes: any[]) => void;
    onPasteSelected?: () => void;
    onSelectEdge: (selectedEdge: IEdge) => void;
    onSelectNode: (node: INode | null) => void;
    onSwapEdge: (sourceNode: INode, targetNode: INode, edge: IEdge) => void;
    onUndo?: () => void;
    onUpdateNode: (node: INode) => void;
    renderBackground?: (gridSize?: number) => any;
    renderDefs?: () => any;
    renderNode?: (
      nodeRef: any,
      data: any,
      id: string,
      selected: boolean,
      hovered: boolean
    ) => any;
    afterRenderEdge?: (
      id: string,
      element: any,
      edge: IEdge,
      edgeContainer: any,
      isEdgeSelected: boolean
    ) => void;
    renderNodeText?: (
      data: any,
      id: string | number,
      isSelected: boolean
    ) => any;
  };

  export type IGraphInput = {
    nodes: INode[];
    edges: IEdge[];
  };

  export class BwdlTransformer extends Transformer {}

  export class Transformer {
    /**
     * Converts an input from the specified type to IGraphInput type.
     * @param input
     * @returns IGraphInput
     */
    static transform(input: any): IGraphInput;

    /**
     * Converts a graphInput to the specified transformer type.
     * @param graphInput
     * @returns any
     */
    static revert(graphInput: IGraphInput): any;
  }

  export type LayoutEngineType = "None" | "SnapToGrid" | "VerticalTree";

  export const GraphView: React.ComponentClass<IGraphViewProps>;
  export type INodeMapNode = {
    node: INode;
    originalArrIndex: number;
    incomingEdges: IEdge[];
    outgoingEdges: IEdge[];
    parents: INode[];
    children: INode[];
  };

  type ObjectMap<T> = { [key: string]: T };

  export type NodesMap = ObjectMap<INodeMapNode>;

  export type EdgesMap = ObjectMap<IEdgeMapNode>;

  export interface IEdgeMapNode {
    edge: IEdge;
    originalArrIndex: number;
  }

  export type Element = any;

  export class GraphUtils {
    static getNodesMap(arr: INode[], key: string): NodesMap;

    static getEdgesMap(arr: IEdge[]): EdgesMap;

    static linkNodesAndEdges(nodesMap: NodesMap, edges: IEdge[]): void;

    static removeElementFromDom(id: string): boolean;

    static findParent(element: Element, selector: string): Element | null;

    static classNames(...args: any[]): string;

    static yieldingLoop(
      count: number,
      chunksize: number,
      callback: (i: number) => void,
      finished?: () => void
    ): void;

    static hasNodeShallowChanged(prevNode: INode, newNode: INode): boolean;
  }
}
