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

import React, { useRef } from 'react';
import GraphUtils from '../utilities/graph-util';
import { EdgeHandleText } from './edge-handle-text';
import { EdgeLabelText } from './edge-label-text';
import { DEFAULT_EDGE_HANDLE_SIZE } from '../constants';
import {
  getShapeId,
  getPathDescription,
  getEdgeHandleRotation,
  getEdgeOffsetHandleTranslation,
  getEdgeHandleTranslation,
  getEdgeHandleTransformation,
} from '../helpers/edge-helpers';

export type IEdge = {
  source: string,
  target: string,
  type?: null | string,
  handleText?: string,
  handleTooltipText?: string,
  label_from?: string,
  label_to?: string,
  isUsingTargetPosition?: Boolean,
  [key: string]: any,
};

export type ITargetPosition = {
  x: number,
  y: number,
  [key: string]: any,
};

type IEdgeProps = {
  data: IEdge,
  edgeTypes: any, // TODO: create an edgeTypes interface
  edgeHandleSize?: number,
  nodeSize?: number,
  sourceNode: ITargetPosition | null,
  targetNode: ITargetPosition,
  isSelected: boolean,
  nodeKey: string,
  viewWrapperElem: HTMLDivElement,
  rotateEdgeHandle?: boolean,
  isBeingDragged: boolean,
};

function Edge({
  data,
  edgeTypes,
  viewWrapperElem,
  edgeHandleSize = DEFAULT_EDGE_HANDLE_SIZE,
  isSelected = false,
  rotateEdgeHandle = true,
  nodeSize = 0,
  sourceNode,
  targetNode,
  nodeKey,
  isBeingDragged = false,
}: IEdgeProps) {
  const edgePathRef = useRef();
  const edgeOverlayRef = useRef();

  const edgeHandleOffsetTranslation = getEdgeOffsetHandleTranslation(
    edgeHandleSize
  );

  const edgeHandleRotation = getEdgeHandleRotation(
    false,
    sourceNode,
    targetNode
  );

  const pathDescription = getPathDescription(
    data,
    sourceNode,
    targetNode,
    nodeKey,
    nodeSize,
    viewWrapperElem
  );

  const edgeHandleTranslation = getEdgeHandleTranslation(pathDescription);

  const edgeHandleTransformation = getEdgeHandleTransformation(
    edgeHandleTranslation,
    edgeHandleOffsetTranslation,
    edgeHandleRotation,
    rotateEdgeHandle
  );

  if (!viewWrapperElem) {
    return null;
  }

  const id = `${data.source != null ? data.source : ''}_${data.target}`;
  const className = GraphUtils.classNames('edge', data.type, {
    selected: isSelected,
  });
  const isBeingDraggedStyle = {
    pointerEvents: isBeingDragged ? 'none' : 'auto',
  };

  return (
    <g
      className="edge-container"
      data-source={data.source}
      data-target={data.target}
    >
      <g className={className}>
        <path
          ref={edgePathRef}
          className="edge-path"
          d={pathDescription || undefined}
          style={{
            ...isBeingDraggedStyle,
          }}
        />
        <use
          href={getShapeId(edgeTypes, data)}
          width={edgeHandleSize}
          height={edgeHandleSize}
          transform={edgeHandleTransformation}
          style={{
            transform: edgeHandleTransformation,
            ...isBeingDraggedStyle,
          }}
        />
        {data.handleText && (
          <EdgeHandleText
            handleText={data.handleText}
            edgeHandleTranslation={edgeHandleTranslation}
          />
        )}
        {data.label_from && data.label_to && (
          <EdgeLabelText
            data={data}
            edgeHandleRotation={edgeHandleRotation}
            edgeHandleTranslation={edgeHandleTranslation}
          />
        )}
      </g>
      <g className="edge-mouse-handler">
        <title>{data.handleTooltipText}</title>
        <path
          className="edge-overlay-path"
          ref={edgeOverlayRef}
          id={id}
          data-source={data.source}
          data-target={data.target}
          d={pathDescription || undefined}
          style={{
            ...isBeingDraggedStyle,
          }}
        />
      </g>
    </g>
  );
}

export default Edge;
