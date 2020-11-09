// @flow

import React, { useMemo } from 'react';
import { type INode } from './node';
import GraphUtils from '../utilities/graph-util';
import { DEFAULT_NODE_SIZE } from '../constants';

type NodeShapePropsT = {
  data: INode,
  nodeTypes: any,
  nodeSubtypes: any,
  nodeKey: string,
  nodeSize?: number,
  nodeWidth?: number,
  nodeHeight?: number,
  selected: boolean,
  hovered: boolean,
};

export function getShapeID(type?: null | string, types: any) {
  if (!!type && types[type]) {
    return types[type].shapeId;
  } else if (types.emptyNode) {
    return types.emptyNode.shapeId;
  }

  return null;
}

export default function NodeShape({
  data,
  nodeTypes,
  nodeSubtypes,
  nodeKey,
  nodeSize,
  nodeWidth,
  nodeHeight,
  selected = false,
  hovered = false,
}: NodeShapePropsT) {
  let height = nodeSize || nodeHeight || DEFAULT_NODE_SIZE;
  let width = nodeSize || nodeWidth || DEFAULT_NODE_SIZE;

  const nodeShapeContainerClassName = GraphUtils.classNames('shape');
  const nodeClassName = useMemo(
    () => GraphUtils.classNames('node', { selected, hovered }),
    [selected, hovered]
  );
  const nodeSubtypeClassName = useMemo(
    () =>
      GraphUtils.classNames('subtype-shape', {
        selected,
      }),
    [selected]
  );
  const nodeTypeHref = getShapeID(data.type, nodeTypes) || '';
  const nodeSubtypeHref = getShapeID(data.subtype, nodeSubtypes) || '';

  // get width and height defined on def element
  const defSvgNodeElement: any = useMemo(() => {
    return nodeTypeHref ? document.querySelector(`defs>${nodeTypeHref}`) : null;
  }, [nodeTypeHref]);
  const nodeWidthAttr = defSvgNodeElement
    ? defSvgNodeElement.getAttribute('width')
    : 0;
  const nodeHeightAttr = defSvgNodeElement
    ? defSvgNodeElement.getAttribute('height')
    : 0;

  width = nodeWidthAttr ? parseInt(nodeWidthAttr, 10) : width;
  height = nodeHeightAttr ? parseInt(nodeHeightAttr, 10) : height;

  return (
    <g
      className={nodeShapeContainerClassName}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {!!data.subtype && (
        <use
          className={nodeSubtypeClassName}
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          href={nodeSubtypeHref}
          xmlns="http://www.w3.org/2000/svg"
        />
      )}
      <use
        className={nodeClassName}
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        href={nodeTypeHref}
        xmlns="http://www.w3.org/2000/svg"
      />
    </g>
  );
}
