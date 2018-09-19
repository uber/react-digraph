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
import * as React from 'react';
import * as lineIntersect from 'line-intersect';
import { intersect, shape } from 'svg-intersections';
import { Point2D } from 'kld-affine';
import GraphUtils from './graph-util';
import { type INode } from './node';

export type IEdge = {
  source: string | null;
  target: string;
  type?: string;
  handleText?: string;
  [key: string]: any;
};

export type ITargetPosition = {
  x: number,
  y: number
};

type IEdgeProps = {
  data: IEdge;
  edgeTypes: any; // TODO: create an edgeTypes interface
  edgeHandleSize?: number;
  nodeSize?: number;
  sourceNode: INode | null;
  targetNode: INode | ITargetPosition;
  isSelected: boolean;
  nodeKey: string;
};

class Edge extends React.Component<IEdgeProps> {
  static defaultProps = {
    edgeHandleSize: 50,
    isSelected: false
  };

  static getMidpoint(pt1: any, pt2: any) {
    const x = (pt2.x + pt1.x) / 2;
    const y = (pt2.y + pt1.y) / 2;
    return { x, y };
  }

  static getTheta(pt1: any, pt2: any) {
    const xComp = pt2.x - pt1.x;
    const yComp = pt2.y - pt1.y;
    const theta = Math.atan2(yComp, xComp);
    return theta;
  }

  static getDegrees (radians: number) {
    return radians * (180 / Math.PI);
  }

  static getRadians(degrees: number) {
    return (degrees / 180) * Math.PI;
  }

  static getDistance(pt1: any, pt2: any) {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
  }

  static lineFunction(srcTrgDataArray: any) {
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

  static getArrowSize() {
    const defEndArrowElement: any = document.querySelector(`defs>marker>.arrow`);
    return defEndArrowElement.getBoundingClientRect();
  }

  static getDefaultIntersectResponse() {
    return {
      xOff: 0,
      yOff: 0,
      intersect: {
        type: 'none',
        point: {
          x: 0,
          y: 0
        }
      }
    };
  }

  static getRectIntersect(defSvgRectElement: any, src: any, trg: any, nodeSize: number) {
    const response = Edge.getDefaultIntersectResponse();
    const arrowSize = Edge.getArrowSize();
    const clientRect = defSvgRectElement.getBoundingClientRect();

    const w = clientRect.width;
    const h = clientRect.height;

    const top = trg.y - h / 2;
    const bottom = trg.y + h / 2;
    const left = trg.x - w / 2;
    const right = trg.x + w / 2;

    const topIntersect = lineIntersect.checkIntersection(src.x, src.y, trg.x, trg.y, left, top, right, top);
    const rightIntersect = lineIntersect.checkIntersection(src.x, src.y, trg.x, trg.y, right, top, right, bottom);
    const bottomIntersect = lineIntersect.checkIntersection(src.x, src.y, trg.x, trg.y, left, bottom, right, bottom);
    const leftIntersect = lineIntersect.checkIntersection(src.x, src.y, trg.x, trg.y, left, top, left, bottom);

    const multiplier = (nodeSize / w) / 2;

    if (topIntersect.type !== 'none' && topIntersect.point != null) {
      // intersects the top line at topIntersect.point{x, y}
      response.xOff = trg.x - topIntersect.point.x;
      response.yOff = trg.y - topIntersect.point.y + arrowSize.height; // + h / 2 ;
      response.intersect = topIntersect.point;
    } else if (rightIntersect.type !== 'none' && rightIntersect.point != null) {
      response.xOff = trg.x - rightIntersect.point.x - arrowSize.height; // - w / 2 - arrowSize.height / 1.5
      response.yOff = trg.y - rightIntersect.point.y;
      response.intersect = rightIntersect.point;
    } else if (bottomIntersect.type !== 'none' && bottomIntersect.point != null) {
      response.xOff = trg.x - bottomIntersect.point.x;
      response.yOff = trg.y - bottomIntersect.point.y - arrowSize.height; // - h / 2 - arrowSize.height / 1.5
      response.intersect = bottomIntersect.point;
    } else if (leftIntersect.type !== 'none' && leftIntersect.point != null) {
      response.xOff = trg.x - leftIntersect.point.x + arrowSize.height; // + w / 2 + arrowSize.height / 1.5
      response.yOff = trg.y - leftIntersect.point.y;
      response.intersect = leftIntersect.point;
    }
    // otherwise no intersection, do nothing and treat it like a circle.
    return response;
  }

  static getPathIntersect(defSvgPathElement: any, src: any, trg: any, nodeSize: number) {
    const response = Edge.getDefaultIntersectResponse();
    const arrowSize = Edge.getArrowSize();
    // get the rectangular area around path
    const clientRect = defSvgPathElement.getBoundingClientRect();

    const w = clientRect.width;
    const h = clientRect.height;

    // calculate the positions of each corner relative to the trg position
    const top = trg.y - h / 2;
    const left = trg.x - w / 2;

    // modify the d property to add top and left to the x and y positions
    let d = defSvgPathElement.getAttribute('d');
    if (!/^M/.test(d)) {
      // doesn't look like what we expect.
      // TODO: add more use cases than simple moveTo commands
      return;
    }

    d = d.replace(/^M /, '');
    let dArr = d.split(' ');
    dArr = dArr.map((val, index) => {
      // items % 2 are x positions
      let isEnd = false;
      if (/Z$/.test(val)) {
        val = val.replace(/Z$/, '');
        isEnd = true;
      }
      if (index % 2 === 0) {
        return (parseFloat(val) + left) + (isEnd ? 'Z' : '');
      }
      return (parseFloat(val) + top) + (isEnd ? 'Z' : '');
    });

    console.log(intersect(
      shape('path', { d: 'M '+dArr.join(' ') }),
      shape('line', { x1: src.x, y1: src.y, x2: trg.x, y2: trg.y })
    ));

    const pathIntersect = intersect(
      shape('path', { d: 'M ' + dArr.join(' ') }),
      shape('line', { x1: src.x, y1: src.y, x2: trg.x, y2: trg.y })
    );

    if (pathIntersect.points.length > 0) {
      response.xOff = trg.x - pathIntersect.points[0].x;
      response.yOff = trg.y - pathIntersect.points[0].y + arrowSize.height; // + h / 2 ;
      response.intersect = pathIntersect.points[0];
    }
  }

  static calculateOffset(nodeSize: any, src: any, trg: any, nodeKey: string) {
    let response = {
      xOff: 0,
      yOff: 0,
      intersect: null
    };
    const theta = Edge.getTheta(src, trg);
    const slope = (src.y - trg.y) / (src.x - trg.x);

    let off = nodeSize / 2; // from the center of the node to the perimeter
    response.xOff = off * Math.cos(theta);
    response.yOff = off * Math.sin(theta);

    const srcNode = document.querySelector(`#node-${src[nodeKey]} use.node`);
    const trgNode = document.querySelector(`#node-${trg[nodeKey]} use.node`);


    // the test for trgNode.getAttributeNS makes sure we really have a node and not some other type of object
    if (trgNode && trgNode.getAttributeNS) {
      const xlinkHref = trgNode.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (xlinkHref) {
        const defSvgRectElement: any = document.querySelector(`defs>${xlinkHref} rect:not([transform])`);
        const defSvgPathElement: any = document.querySelector(`defs>${xlinkHref} path`);

        if (defSvgRectElement) {
          // it's a rectangle
          response = {
            ...response,
            ...Edge.getRectIntersect(defSvgRectElement, src, trg, nodeSize)
          }
        } else if (defSvgPathElement) {
          // it's a complex path
          response = {
            ...response,
            ...Edge.getPathIntersect(defSvgPathElement, src, trg, nodeSize)
          }
        }
      }
    }

    return response;
  }

  static getXlinkHref(edgeTypes: any, data: any) {
    if (data.type && edgeTypes[data.type]) {
      return edgeTypes[data.type].shapeId;
    } else if (edgeTypes.emptyEdge) {
      return edgeTypes.emptyEdge.shapeId;
    }
    return null;
  }

  edgeOverlayRef;

  constructor(props: IEdgeProps) {
    super(props);
    this.edgeOverlayRef = React.createRef();
  }

  getEdgeHandleTranslation = () => {
    const { nodeSize, nodeKey, sourceNode, targetNode, data } = this.props;

    let pathDescription = this.getPathDescription(data);

    pathDescription = pathDescription.replace(/^M/, '');
    pathDescription = pathDescription.replace(/L/, ',');
    const pathDescriptionArr = pathDescription.split(',');

    // [0] = src x, [1] = src y
    // [2] = trg x, [3] = trg y
    const diffX = parseFloat(pathDescriptionArr[2]) - parseFloat(pathDescriptionArr[0]);
    const diffY = parseFloat(pathDescriptionArr[3]) - parseFloat(pathDescriptionArr[1]);
    const x = parseFloat(pathDescriptionArr[0]) + diffX / 2;
    const y = parseFloat(pathDescriptionArr[1]) + diffY / 2;

    return `translate(${x}, ${y})`;
  }

  getEdgeHandleOffsetTranslation = () => {
    const offset = -(this.props.edgeHandleSize || 0) / 2;
    return `translate(${offset}, ${offset})`;
  }

  getEdgeHandleRotation = (negate: any = false) => {
    const src = this.props.sourceNode;
    const trg = this.props.targetNode;
    let theta = Edge.getTheta(src, trg) * 180 / Math.PI;
    if (negate) {
      theta = -theta;
    }
    return `rotate(${theta})`;
  }

  getEdgeHandleTransformation = () => {
    const translation = this.getEdgeHandleTranslation();
    const rotation = this.getEdgeHandleRotation();
    const offset = this.getEdgeHandleOffsetTranslation();
    return `${translation} ${rotation} ${offset}`;
  }

  getPathDescription(edge: any) {
    const src = this.props.sourceNode || {};
    const trg = this.props.targetNode;
    const { nodeKey, nodeSize } = this.props;

    // To calculate the offset for a specific node we use that node as the third parameter
    // and the accompanying node as the second parameter, representing where the line
    // comes from and where it's going to. Don't think of a line as a one-way arrow, but rather
    // a connection between two points. In this case, to obtain the offsets for the src we
    // write trg first, then src second. Vice versa to get the offsets for trg.
    const srcOff = Edge.calculateOffset(nodeSize || 0, trg, src, nodeKey);
    const trgOff = Edge.calculateOffset(nodeSize || 0, src, trg, nodeKey);

    const linePoints = [
      {
        x: src.x - srcOff.xOff,
        y: src.y - srcOff.yOff
      },
      {
        x: trg.x - trgOff.xOff,
        y: trg.y - trgOff.yOff
      }
    ];

    return Edge.lineFunction(linePoints);
  }

  renderHandleText(data: any) {
    return (
      <text
        className="edge-text"
        textAnchor="middle"
        alignmentBaseline="central"
        transform={`${this.getEdgeHandleTranslation()}`}
      >
        {data.handleText}
      </text>
    );
  }

  render() {
    const { data, edgeTypes, edgeHandleSize } = this.props;
    const id = `${data.source || ''}_${data.target}`;
    const className = GraphUtils.classNames('edge', {
      selected: this.props.isSelected
    });

    return (
      <g className="edge-container" data-source={data.source} data-target={data.target}>
        <g className={className}>
          <path className="edge-path" d={this.getPathDescription(data) || undefined} />
            <use
              xlinkHref={Edge.getXlinkHref(edgeTypes, data)}
              width={edgeHandleSize}
              height={edgeHandleSize}
              transform={`${this.getEdgeHandleTransformation()}`}
            />
            {data.handleText && this.renderHandleText(data)}
        </g>
        <g className="edge-mouse-handler">
          <path
            className="edge-overlay-path"
            ref={this.edgeOverlayRef}
            id={id}
            data-source={data.source}
            data-target={data.target}
            d={this.getPathDescription(data) || undefined}
          />
        </g>
      </g>
    );
  }
}

export default Edge;
