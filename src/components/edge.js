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
};

class Edge extends React.Component<IEdgeProps> {
  static defaultProps = {
    edgeHandleSize: 70,
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

  static calculateOffset(nodeSize: any, src: any, trg: any) {
    const off = nodeSize / 2; // from the center of the node to the perimeter
    const theta = Edge.getTheta(src, trg);

    const xOff = off * Math.cos(theta);
    const yOff = off * Math.sin(theta);
    return { xOff, yOff };
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
    const src = this.props.sourceNode;
    const trg = this.props.targetNode;

    const origin = Edge.getMidpoint(src, trg);
    const x = origin.x;
    const y = origin.y;

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

    const off = Edge.calculateOffset(this.props.nodeSize || 0, src, trg);
    const { xOff, yOff } = off;
    return Edge.lineFunction([
      {
        x: src.x + xOff,
        y: src.y + yOff
      },
      {
        x: trg.x - xOff,
        y: trg.y - yOff
      }
    ]);
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
