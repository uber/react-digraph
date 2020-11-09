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

import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import GraphUtils from '../utilities/graph-util';
import { type INode } from './node';
import {
  DEFAULT_NODE_TEXT_MAX_TITLE_CHARS,
  DEFAULT_NODE_TEXT_LINE_OFFSET,
} from '../constants';

type INodeTextProps = {
  data: INode,
  nodeTypes: any, // TODO: create a nodeTypes interface
  isSelected: boolean,
  maxTitleChars?: number,
  lineOffset?: number,
};

function getTypeText(data: INode, nodeTypes: any) {
  if (data.type && nodeTypes[data.type]) {
    return nodeTypes[data.type].typeText;
  } else if (nodeTypes.emptyNode) {
    return nodeTypes.emptyNode.typeText;
  } else {
    return null;
  }
}

function NodeText({
  data,
  nodeTypes,
  isSelected,
  maxTitleChars = DEFAULT_NODE_TEXT_MAX_TITLE_CHARS,
  lineOffset = DEFAULT_NODE_TEXT_LINE_OFFSET,
}: INodeTextProps) {
  const nodeTextRef = useRef();

  const title = data.title;
  const className = useMemo(
    () =>
      GraphUtils.classNames('node-text', {
        selected: isSelected,
      }),
    [isSelected]
  );

  // prevents the SVG click event from firing when the node text is selected
  const handleTextClick = useCallback((event: any) => {
    event.stopPropagation();
  }, []);

  const typeText = useMemo(() => getTypeText(data, nodeTypes), [
    data,
    nodeTypes,
  ]);

  useEffect(() => {
    d3.select(nodeTextRef.current).on('click', () => handleTextClick(d3.event));
  }, [handleTextClick]);

  return (
    <text
      ref={nodeTextRef}
      className={className}
      textAnchor="middle"
      xmlns="http://www.w3.org/2000/svg"
    >
      {!!typeText && <tspan opacity="0.5">{typeText}</tspan>}
      {title && (
        <tspan
          x={0}
          dy={lineOffset}
          fontSize="10px"
          xmlns="http://www.w3.org/2000/svg"
        >
          {title.length > maxTitleChars
            ? title.substr(0, maxTitleChars)
            : title}
        </tspan>
      )}
      {title && <title>{title}</title>}
    </text>
  );
}

export default NodeText;
