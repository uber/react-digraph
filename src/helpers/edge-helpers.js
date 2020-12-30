// @flow
import * as d3 from 'd3';
import React from 'react';
import { type IEdge, type ITargetPosition } from '../components/edge';
import {
  getRotatedRectIntersect,
  getPathIntersect,
  getCircleIntersect,
} from './intersect-helpers';

export function getShapeId(edgeTypes: any, data: any) {
  if (data.type && edgeTypes[data.type]) {
    return edgeTypes[data.type].shapeId;
  } else if (edgeTypes.emptyEdge) {
    return edgeTypes.emptyEdge.shapeId;
  }

  return null;
}

export function getDefaultIntersectResponse() {
  return {
    xOff: 0,
    yOff: 0,
    intersect: {
      type: 'none',
      point: {
        x: 0,
        y: 0,
      },
    },
  };
}

export function parsePathToXY(edgePathElement: Element | null) {
  const response = {
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
  };

  if (edgePathElement) {
    let d = edgePathElement.getAttribute('d');

    d = d && d.replace(/^M/, '');
    d = d && d.replace(/L/, ',');
    let dArr = (d && d.split(',')) || [];

    dArr = dArr.map(dimension => {
      return parseFloat(dimension);
    });

    if (dArr.length === 4) {
      response.source.x = dArr[0];
      response.source.y = dArr[1];
      response.target.x = dArr[2];
      response.target.y = dArr[3];
    }
  }

  return response;
}

export function getEdgePathElement(
  edge: IEdge,
  viewWrapperElem: HTMLDivElement
) {
  return viewWrapperElem.querySelector(
    `[id='edge-${edge.source}-${edge.target}-container']>.edge-container>.edge>.edge-path`
  );
}

export function getLine(srcTrgDataArray: ITargetPosition[]) {
  // Provides API for curved lines using .curve() Example:
  // https://bl.ocks.org/d3indepth/64be9fc39a92ef074034e9a8fb29dcce
  return d3
    .line()
    .x((d: any) => {
      return d.x;
    })
    .y((d: any) => {
      return d.y;
    })(srcTrgDataArray);
}

// TODO: consider passing nodeRefs somehow instead of using the DOM.
export function calculateOffset(
  nodeSize: any,
  src: any,
  trg: any,
  nodeKey: string,
  includesArrow?: boolean = true,
  viewWrapperElem: React.RefObject<HTMLDivElement>
) {
  let response = getDefaultIntersectResponse();

  if (trg == null || trg[nodeKey] == null) {
    return response;
  }

  // Note: document.getElementById is by far the fastest way to get a node.
  // compare 2.82ms for querySelector('#node-a2 use.node') vs
  // 0.31ms and 99us for document.getElementById()
  // Although it doesn't allow multiple graphs.
  // We can use viewWrapperElem to scope the querySelector to a smaller set of elements to improve the speed
  const nodeElem = viewWrapperElem.querySelector(`[id='node-${trg[nodeKey]}']`);

  if (!nodeElem) {
    return response;
  }

  const trgNode = nodeElem.querySelector(`use.node`);

  // the test for trgNode.getAttributeNS makes sure we really have a node and not some other type of object
  if (!trgNode || (trgNode && !trgNode.getAttribute)) {
    return response;
  }

  let href = trgNode.getAttribute('href');

  if (!href) {
    href = trgNode.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
  }

  if (!href) {
    return response;
  }

  const defSvgRectElement: SVGRectElement | null = viewWrapperElem.querySelector(
    `defs>${href} rect:not([data-intersect-ignore=true])`
  );
  // Conditionally trying to select the element in other ways is faster than trying to
  // do the selection.
  const defSvgPathElement: SVGPathElement | null = !defSvgRectElement
    ? viewWrapperElem.querySelector(
        `defs>${href} path:not([data-intersect-ignore=true])`
      )
    : null;
  const defSvgCircleElement:
    | SVGCircleElement
    | SVGEllipseElement
    | SVGPolygonElement
    | null =
    !defSvgPathElement && !defSvgPathElement
      ? viewWrapperElem.querySelector(
          `defs>${href} circle:not([data-intersect-ignore=true]), defs>${href} ellipse:not([data-intersect-ignore=true]), defs>${href} polygon:not([data-intersect-ignore=true])`
        )
      : null;

  if (defSvgRectElement) {
    // it's a rectangle
    response = {
      ...response,
      ...getRotatedRectIntersect(
        defSvgRectElement,
        src,
        trg,
        includesArrow,
        viewWrapperElem
      ),
    };
  } else if (defSvgPathElement) {
    // it's a complex path
    response = {
      ...response,
      ...getPathIntersect(
        defSvgPathElement,
        src,
        trg,
        includesArrow,
        viewWrapperElem
      ),
    };
  } else {
    // it's a circle or some other type
    response = {
      ...response,
      ...getCircleIntersect(
        defSvgCircleElement,
        src,
        trg,
        includesArrow,
        viewWrapperElem
      ),
    };
  }

  return response;
}

export function getPathDescription(
  edge: any,
  sourceNode: ITargetPosition | null,
  targetNode: ITargetPosition,
  nodeKey: string,
  nodeSize: number,
  viewWrapperElem: React.RefObject<HTMLDivElement>
) {
  const trgX = targetNode && targetNode.x ? targetNode.x : 0;
  const trgY = targetNode && targetNode.y ? targetNode.y : 0;
  const srcX = sourceNode && sourceNode.x ? sourceNode.x : 0;
  const srcY = sourceNode && sourceNode.y ? sourceNode.y : 0;

  // To calculate the offset for a specific node we use that node as the third parameter
  // and the accompanying node as the second parameter, representing where the line
  // comes from and where it's going to. Don't think of a line as a one-way arrow, but rather
  // a connection between two points. In this case, to obtain the offsets for the src we
  // write trg first, then src second. Vice versa to get the offsets for trg.
  const srcOff = calculateOffset(
    nodeSize || 0,
    targetNode,
    sourceNode,
    nodeKey,
    false,
    viewWrapperElem
  );
  const trgOff = calculateOffset(
    nodeSize || 0,
    sourceNode,
    targetNode,
    nodeKey,
    true,
    viewWrapperElem
  );

  const linePoints = [
    {
      x: srcX - srcOff.xOff,
      y: srcY - srcOff.yOff,
    },
    {
      x: trgX - trgOff.xOff,
      y: trgY - trgOff.yOff,
    },
  ];

  return getLine(linePoints);
}

export function getTheta(pt1?: ITargetPosition | null, pt2?: ITargetPosition) {
  const xComp = (pt2?.x || 0) - (pt1?.x || 0);
  const yComp = (pt2?.y || 0) - (pt1?.y || 0);
  const theta = Math.atan2(yComp, xComp);

  return theta;
}

export function getArrowSize(viewWrapperElem: HTMLDivElement) {
  const defEndArrowElement: any = viewWrapperElem.querySelector(
    `defs>marker>.arrow`
  );

  const arrowRect = defEndArrowElement.getBoundingClientRect();
  const size = {
    bottom: arrowRect.bottom,
    top: arrowRect.top,
    // Firefox doesn't calculate width and height, so we need to pull
    // from the attributes.
    height: arrowRect.height || defEndArrowElement.getAttribute('height'),
    width: arrowRect.width || defEndArrowElement.getAttribute('width'),
    left: arrowRect.left,
    right: arrowRect.right,
    y: arrowRect.y,
    x: arrowRect.x,
  };

  return size;
}

export function getEdgeHandleRotation(
  negate: any = false,
  sourceNode: ITargetPosition | null,
  targetNode: ITargetPosition
): [string, boolean] {
  let rotated = false;
  const src = sourceNode;
  const trg = targetNode;
  let theta = (getTheta(src, trg) * 180) / Math.PI;

  if (negate) {
    theta = -theta;
  }

  if (theta > 90 || theta < -90) {
    theta = theta + 180;
    rotated = true;
  }

  return [`rotate(${theta})`, rotated];
}

export function getEdgeOffsetHandleTranslation(edgeHandleSize: number) {
  const offset = -(edgeHandleSize || 0) / 2;

  return `translate(${offset}, ${offset})`;
}

export function getEdgeHandleTranslation(pathDescription: string) {
  let parsedPathDescription = pathDescription;

  parsedPathDescription = parsedPathDescription.replace(/^M/, '');
  parsedPathDescription = parsedPathDescription.replace(/L/, ',');
  const pathDescriptionArr = parsedPathDescription.split(',');

  // [0] = src x, [1] = src y
  // [2] = trg x, [3] = trg y
  const diffX =
    parseFloat(pathDescriptionArr[2]) - parseFloat(pathDescriptionArr[0]);
  const diffY =
    parseFloat(pathDescriptionArr[3]) - parseFloat(pathDescriptionArr[1]);
  const x = parseFloat(pathDescriptionArr[0]) + diffX / 2;
  const y = parseFloat(pathDescriptionArr[1]) + diffY / 2;

  return `translate(${x}, ${y})`;
}

export function getEdgeHandleTransformation(
  edgeHandleTranslation: string,
  edgeHandleOffsetTranslation: string,
  edgeHandleRotation: [string, boolean],
  rotateEdgeHandle: boolean
) {
  const translation = edgeHandleTranslation;
  const rotation = rotateEdgeHandle ? edgeHandleRotation[0] : '';
  const offset = edgeHandleOffsetTranslation;

  return `${translation} ${rotation} ${offset}`;
}
