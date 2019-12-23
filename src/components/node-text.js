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

const MAX_WIDTH = 20;
const LINE_GAP = 25;

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
    this.re = new RegExp(`.{1,${MAX_WIDTH}}`, 'g');
  }

  getWrappedLines = text => {
    const lines = text.split('::next::');

    return lines.map(line => line.match(this.re)).flat();
  };

  render() {
    const { data, isSelected } = this.props;
    const title = data.gnode.question.index;
    const text = data.gnode.question.text || ' ';
    const className = GraphUtils.classNames('node-text', {
      selected: isSelected,
    });
    // const typeText = this.getTypeText(data, nodeTypes);
    const titleLines = this.getWrappedLines(title);
    const titleFirstDy = -1 * ((titleLines.length - 1) / 2) * LINE_GAP;
    // const textLines = this.getWrappedLines(text);
    // const textFirstDy = -1 * ((textLines.length - 1) / 2) * LINE_GAP;

    return (
      <g>
        {titleLines.map((line, index) => (
          <text
            className={className}
            textAnchor="middle"
            dominantBaseline="middle"
            key={line.substr(0, 10)}
          >
            <tspan fontSize="30px" dy={titleFirstDy + LINE_GAP * index}>
              {line}
            </tspan>
          </text>
        ))}
        {/*isSelected && textLines.map((line, index) => (
            <text
              className={className}
              textAnchor="middle"
              dominantBaseline="middle"
              key={line.substr(0, 10)}
            >
              <tspan
                dy={textFirstDy + LINE_GAP * index}
                fontSize="20px"
              >
                {line}
              </tspan>
            </text>
          ))
        */}
      </g>
    );
  }
}

export default NodeText;
