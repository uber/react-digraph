// @flow

import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import GraphUtils from '../utilities/graph-util';
import { type INode } from './node';
import {
  DEFAULT_NODE_TEXT_MAX_TITLE_CHARS,
  DEFAULT_NODE_TEXT_LINE_OFFSET,
  NODE_TEXT_LINE_OFFSET,
} from '../constants';

type INodeTextProps = {
  data: INode,
  nodeTypes: any, // TODO: create a nodeTypes interface
  isSelected: boolean,
  isFiltered: boolean,
  maxTitleChars?: number,
  lineOffset?: number,
};

// function getTypeText(data: INode, nodeTypes: any) {
//   if (data.type && nodeTypes[data.type]) {
//     return nodeTypes[data.type].typeText;
//   } else if (nodeTypes.emptyNode) {
//     return nodeTypes.emptyNode.typeText;
//   } else {
//     return null;
//   }
// }

function NodeText({
  data,
  nodeTypes,
  isSelected,
  isFiltered,
  maxTitleChars = DEFAULT_NODE_TEXT_MAX_TITLE_CHARS,
  lineOffset = DEFAULT_NODE_TEXT_LINE_OFFSET,
}: INodeTextProps) {
  const nodeTextRef = useRef();

  const title = data.title;
  const className = useMemo(
    () =>
      GraphUtils.classNames('node-text', {
        selected: isSelected,
        filtered: isFiltered,
      }),
    [isSelected, isFiltered]
  );

  // prevents the SVG click event from firing when the node text is selected
  const handleTextClick = useCallback((event: any) => {
    event.stopPropagation();
  }, []);

  // const typeText = useMemo(() => getTypeText(data, nodeTypes), [
  //   data,
  //   nodeTypes,
  // ]);

  if (data.type in NODE_TEXT_LINE_OFFSET) {
    lineOffset = NODE_TEXT_LINE_OFFSET[data.type];
  }

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
      {/* {!!typeText && <tspan opacity="0.5">{typeText}</tspan>} */}
      {title && (
        <tspan
          x={0}
          dy={lineOffset}
          fontSize="20px"
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
