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
import { type IEdge, type ITargetPosition } from './edge';
import { type INode } from './node';

export type IGraphViewProps = {
  nodes: any[];
  edges: any[];
  minZoom?: number;
  maxZoom?: number;
  readOnly?: boolean;
  maxTitleChars?: number;
  nodeSize?: number;
  edgeHandleSize?: number;
  edgeArrowSize?: number;
  zoomDelay?: number;
  zoomDur?: number;
  showGraphControls?: boolean;
  nodeKey: string;
  gridSize?: number;
  gridSpacing?: number;
  gridDotSize?: number;
  backgroundFillId?: string;
  nodeTypes: any;
  nodeSubtypes: any;
  edgeTypes: any;
  selected: any;
  onDeleteNode: (selected: any, originalArrIndex: number, nodes: any[]) => void;
  onSelectNode: (node: INode | null) => void;
  onCreateNode: (x: number, y: number) => void;
  onCreateEdge: (sourceNode: INode, targetNode: INode) => void;
  onDeleteEdge: (selectedEdge: IEdge, index: number, edges: IEdge[]) => void;
  onUpdateNode: (node: INode) => void;
  onSwapEdge: (sourceNode: INode, targetNode: INode, edge: IEdge) => void;
  onSelectEdge: (selectedEdge: IEdge) => void;
  canDeleteNode?: (selected: any) => boolean;
  canDeleteEdge?: (selected: any) => boolean;
  canCreateEdge?: () => boolean;
  onUndo?: () => void;
  onCopySelected?: () => void;
  onPasteSelected?: () => void;
  renderBackground?: (gridSize?: number) => any;
  renderDefs?: () => any;
  renderNode?: (
    nodeRef: any,
    data: any,
    index: number,
    selected: boolean,
    hovered: boolean
  ) => any;
  renderNodeText?: (data: any, index: number, id: string | number, isSelected: boolean) => any;
  layoutEngineType?: LayoutEngineType;
};
