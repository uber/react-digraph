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

import * as React from 'react';
import GraphUtils from '../utilities/graph-util';
import { type INode } from './node';

type INodeTextProps = {
  data: INode,
  nodeTypes: any, // TODO: create a nodeTypes interface
  isSelected: boolean,
  maxTitleChars: number,
};

const re = new RegExp('.{1,50}', 'g');

function getLines(text, isSelected) {
  const lines = text.split('::next::');

  if (!isSelected) {
    return lines.map(line => line.substr(0, 30));
  } else {
    return lines.map(line => line.match(re)).flat();
  }
}

class NodeText extends React.Component<INodeTextProps> {
  // getTypeText(data: INode, nodeTypes: any) {
  //   if (data.type && nodeTypes[data.type]) {
  //     return nodeTypes[data.type].typeText;
  //   } else if (nodeTypes.emptyNode) {
  //     return nodeTypes.emptyNode.typeText;
  //   } else {
  //     return null;
  //   }
  // }

  constructor(props) {
    super(props);
    this.gTag = React.createRef();
    this.bkgRect = React.createRef();
  }

  componentDidUpdate() {
    const rect = this.bkgRect.current;
    const g = this.gTag.current;
    const X_MARGIN = 25;
    const Y_MARGIN = 25;

    if (this.props.isSelected) {
      g.removeChild(rect);
      const SVGRect = g.getBBox();

      rect.setAttribute('x', (parseInt(SVGRect.x) - X_MARGIN).toString());
      rect.setAttribute('y', (parseInt(SVGRect.y) - Y_MARGIN).toString());

      rect.setAttribute(
        'width',
        (parseInt(SVGRect.width) + X_MARGIN * 2).toString()
      );
      rect.setAttribute(
        'height',
        (parseInt(SVGRect.height) + Y_MARGIN * 2).toString()
      );
      rect.setAttribute('fill-opacity', '0.9');
      g.insertBefore(rect, g.firstChild);
    } else {
      rect.setAttribute('fill-opacity', '0');
    }
  }

  render() {
    const { data, isSelected, maxTitleChars } = this.props;
    const textOffset = 20;
    const lineGap = 25;
    const title = data.title;
    const text = data.text || ' ';
    const className = GraphUtils.classNames('node-text', {
      selected: isSelected,
    });
    // const typeText = this.getTypeText(data, nodeTypes);

    return (
      <g ref={this.gTag}>
        <rect fill="lavender" rx="15" ref={this.bkgRect} />
        <text className={className} textAnchor="middle">
          <tspan opacity="1" fontSize="20px" dy={-textOffset}>
            {title.length > maxTitleChars ? title.substr(0, 30) : title}
          </tspan>
        </text>
        {getLines(text, isSelected).map((line, index) => (
          <text
            className={className}
            textAnchor="middle"
            key={line.substr(0, 10)}
          >
            <tspan
              opacity="1"
              dy={textOffset + lineGap * index}
              fontSize="20px"
            >
              {line}
            </tspan>
          </text>
        ))}
      </g>
    );
  }
}

export default NodeText;
