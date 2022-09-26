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

import { type LayoutEngineType } from '../utilities/layout-engine/layout-engine-types';
import { type IEdge } from './edge';
import { type INode } from './node';

export type IPoint = {
  x: number,
  y: number,
};

export type IBBox = {
  x: number,
  y: number,
  width: number,
  height: number,
};

export type SelectionT = {
  nodes: Map<string, INode> | null,
  edges: Map<string, IEdge> | null,
};

export type IGraphViewProps = {
  allowCopyEdges?: boolean,
  allowMultiselect?: boolean,
  backgroundFillId?: string,
  disableBackspace?: boolean,
  edges: any[],
  edgeArrowSize?: number,
  edgeHandleSize?: number,
  edgeTypes: any,
  gridDotSize?: number,
  gridSize?: number,
  gridSpacing?: number,
  layoutEngineType?: LayoutEngineType,
  maxTitleChars?: number,
  maxZoom?: number,
  minZoom?: number,
  nodeKey: string,
  nodes: any[],
  nodeSize?: number,
  nodeHeight?: number,
  nodeWidth?: number,
  nodeSpacingMultiplier?: number,
  nodeSubtypes: any,
  nodeTypes: any,
  readOnly?: boolean,
  selected?: null | SelectionT,
  showGraphControls?: boolean,
  zoomDelay?: number,
  zoomDur?: number,
  canCreateEdge?: (startNode?: INode, endNode?: INode) => boolean,
  canDeleteSelected?: (selected: SelectionT) => boolean,
  canSwapEdge?: (
    sourceNode: INode,
    hoveredNode: INode | null,
    swapEdge: IEdge
  ) => boolean,
  onBackgroundClick?: (x: number, y: number, event: any) => void,
  onCopySelected?: () => void,
  onCreateEdge?: (sourceNode: INode, targetNode: INode) => void,
  onCreateNode?: (x: number, y: number, event: any) => void,
  onContextMenu?: (x: number, y: number, event: any) => void,
  onDeleteSelected?: (selected: SelectionT) => void,
  onPasteSelected?: (selected?: SelectionT | null, xyCoords?: IPoint) => void,
  onSelect?: (selected: SelectionT, event?: any) => void,
  onSwapEdge?: (sourceNode: INode, targetNode: INode, edge: IEdge) => void,
  onUndo?: () => void,
  onUpdateNode?: (
    node: INode,
    updatedNodes?: Map<string, INode> | null,
    updatedNodePoistion?: Object
  ) => void | Promise<any>,
  onArrowClicked?: (selectedEdge: IEdge) => void,
  renderBackground?: (gridSize?: number) => any,
  renderDefs?: () => any,
  renderNode?: (
    nodeRef: any,
    data: any,
    id: string,
    selected: boolean,
    hovered: boolean
  ) => any,
  afterRenderEdge?: (
    id: string,
    element: any,
    edge: IEdge,
    edgeContainer: any,
    isEdgeSelected: boolean
  ) => void,
  renderNodeText?: (data: any, id: string | number, isSelected: boolean) => any,
  rotateEdgeHandle?: boolean,
  centerNodeOnMove?: boolean,
  initialBBox?: IBBox,
  nodeLocationOverrides?: Object,
};
