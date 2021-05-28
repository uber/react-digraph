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

import * as d3 from 'd3';
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
// This works in Typescript but causes an import loop for Flowtype. We'll just use `any` below.
// import { type LayoutEngine } from '../utilities/layout-engine/layout-engine-config';
import GraphUtils from '../utilities/graph-util';
import NodeText from './node-text';
import NodeShape from './node-shape';
import {
  DEFAULT_NODE_SIZE,
  DEFAULT_NODE_TEXT_MAX_TITLE_CHARS,
} from '../constants';
import { calculateOffset } from '../helpers/edge-helpers';
import { type IPoint } from './graph-view-props';

export type INode = {
  title: string,
  x?: number | null,
  y?: number | null,
  type?: string | null,
  subtype?: string | null,
  [key: string]: any,
};

type INodeProps = {
  data: INode,
  id: string,
  nodeTypes: any, // TODO: make a nodeTypes interface
  nodeSubtypes: any, // TODO: make a nodeSubtypes interface
  opacity?: number,
  nodeKey: string,
  nodeSize?: number,
  nodeWidth?: number,
  nodeHeight?: number,
  onNodeMouseEnter: (event: any, data: any) => void,
  onNodeMouseLeave: (event: any, data: any) => void,
  onNodeMove: (point: IPoint, id: string, shiftKey: boolean) => void,
  onNodeSelected: (
    data: any,
    id: string,
    shiftKey: boolean,
    event?: any
  ) => void,
  onNodeUpdate: (point: IPoint, id: string, shiftKey: boolean) => Promise<any>,
  renderNode?: (
    nodeRef: any,
    data: any,
    id: string,
    selected: boolean,
    hovered: boolean
  ) => any,
  renderNodeText?: (data: any, id: string | number, isSelected: boolean) => any,
  isSelected: boolean,
  layoutEngine?: any,
  viewWrapperElem: HTMLDivElement,
  centerNodeOnMove?: boolean,
  maxTitleChars?: number,
};

function Node({
  data,
  id,
  nodeKey,
  opacity,
  nodeTypes,
  nodeSubtypes,
  isSelected = false,
  nodeSize,
  nodeHeight,
  nodeWidth,
  maxTitleChars = DEFAULT_NODE_TEXT_MAX_TITLE_CHARS,
  centerNodeOnMove = true,
  layoutEngine,
  viewWrapperElem,
  renderNodeText,
  renderNode,
  onNodeMouseEnter = () => {},
  onNodeMouseLeave = () => {},
  onNodeMove = () => {},
  onNodeSelected = () => {},
  onNodeUpdate = () => Promise.resolve(),
}: INodeProps) {
  const draggingEdge = useRef(false);
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef();
  const oldSibling = useRef();
  const position = useRef();

  // We have to use a ref for x, y state because the handleDragEnd
  // function doesn't know about the updated values
  // when the mouse moves if we're using state.
  position.current = { x: data.x || 0, y: data.y || 0, pointerOffset: null };

  const handleMouseOver = useCallback(
    (event: any) => {
      const isHovered = true;

      setHovered(isHovered);
      onNodeMouseEnter(event, data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onNodeMouseEnter, data]
  );

  const handleMouseOut = useCallback(
    (event: any) => {
      if (
        (event && !event.relatedTarget) ||
        (event &&
          !event.relatedTarget?.matches('.edge-overlay-path') &&
          !GraphUtils.findParent(event.relatedTarget, 'g.node', 'svg.graph'))
      ) {
        setHovered(false);
        onNodeMouseLeave(event, data);
      }
    },
    [onNodeMouseLeave, data]
  );

  const handleDragStart = useCallback(() => {
    if (!nodeRef.current) {
      return;
    }

    if (!oldSibling.current) {
      oldSibling.current = nodeRef.current.parentElement.nextSibling;
    }

    // Moves child to the end of the element stack to re-arrange the z-index
    nodeRef.current.parentElement.parentElement.appendChild(
      nodeRef.current.parentElement
    );
  }, []);

  const handleDragEnd = useCallback(
    (event: any) => {
      if (!nodeRef.current) {
        return;
      }

      const { sourceEvent } = event;

      const shiftKey = sourceEvent.shiftKey || draggingEdge.current;

      draggingEdge.current = false;
      position.current.pointerOffset = null;

      if (oldSibling.current?.parentElement) {
        oldSibling.current.parentElement.insertBefore(
          nodeRef.current.parentElement,
          oldSibling.current
        );
      }

      const nodeUpdate = onNodeUpdate(
        position.current,
        data[nodeKey],
        shiftKey
      );

      const onFinally = () =>
        onNodeSelected(data, data[nodeKey], shiftKey, sourceEvent);

      nodeUpdate.then(onFinally).catch(onFinally);
    },
    [onNodeUpdate, data, nodeKey, onNodeSelected]
  );

  const handleMouseMove = useCallback(
    (event: any) => {
      const shiftKey = event.sourceEvent.shiftKey;

      const newState = {
        x: event.x,
        y: event.y,
        pointerOffset: position.current.pointerOffset,
      };

      if (!centerNodeOnMove) {
        newState.pointerOffset = newState.pointerOffset || {
          x: event.x - (data.x || 0),
          y: event.y - (data.y || 0),
        };
        newState.x -= newState.pointerOffset.x;
        newState.y -= newState.pointerOffset.y;
      }

      if (shiftKey) {
        draggingEdge.current = true;
        // draw edge
        // undo the target offset subtraction done by Edge
        const off = calculateOffset(
          nodeSize || DEFAULT_NODE_SIZE,
          data,
          newState,
          nodeKey,
          true,
          viewWrapperElem
        );

        newState.x += off.xOff;
        newState.y += off.yOff;
        // now tell the graph that we're actually drawing an edge
      } else if (!draggingEdge.current && layoutEngine) {
        // move node using the layout engine
        Object.assign(newState, layoutEngine.getPositionForNode(newState));
      }

      position.current = {
        x: newState.x,
        y: newState.y,
        pointerOffset: newState.pointerOffset,
      };

      onNodeMove(newState, data[nodeKey], shiftKey || draggingEdge.current);
    },
    [
      centerNodeOnMove,
      data,
      layoutEngine,
      nodeKey,
      nodeSize,
      onNodeMove,
      viewWrapperElem,
    ]
  );

  useEffect(() => {
    const dragFunction = d3
      .drag()
      .on('drag', () => handleMouseMove(d3.event))
      .on('start', handleDragStart)
      .on('end', () => handleDragEnd(d3.event));

    d3.select(nodeRef.current).call(dragFunction);
  }, [handleDragEnd, handleDragStart, handleMouseMove, handleMouseOver]);

  const className = useMemo(
    () =>
      GraphUtils.classNames('node', data.type, {
        hovered,
        isSelected,
      }),
    [data.type, hovered, isSelected]
  );

  const { x, y } = position.current;

  return (
    <g
      className={className}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      id={id}
      ref={nodeRef}
      opacity={opacity}
      transform={`translate(${x}, ${y})`}
      style={{ transform: `matrix(1, 0, 0, 1, ${x}, ${y})` }}
    >
      {renderNode ? (
        renderNode(nodeRef, data, data[nodeKey], isSelected, hovered)
      ) : (
        <NodeShape
          data={data}
          nodeKey={nodeKey}
          nodeTypes={nodeTypes}
          nodeSubtypes={nodeSubtypes}
          nodeSize={nodeSize}
          nodeHeight={nodeHeight}
          nodeWidth={nodeWidth}
          selected={isSelected}
          hovered={hovered}
        />
      )}
      {renderNodeText ? (
        renderNodeText(data, id, isSelected)
      ) : (
        <NodeText
          data={data}
          nodeTypes={nodeTypes}
          isSelected={isSelected}
          maxTitleChars={maxTitleChars}
        />
      )}
    </g>
  );
}

export default Node;
