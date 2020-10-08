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
import type { INode } from './node';

type INodeTextProps = {
  data: INode;
  nodeTypes: any; // TODO: create a nodeTypes interface
  isSelected: boolean;
  maxTitleChars: number;
};

class NodeText extends React.Component<INodeTextProps> {
  getTypeText(data: INode, nodeTypes: any) {
    if (data.type && nodeTypes[data.type]) {
      return nodeTypes[data.type].typeText;
    } else if (nodeTypes.emptyNode) {
      return nodeTypes.emptyNode.typeText;
    } else {
      return null;
    }
  }

  render() {
    const { data, nodeTypes, isSelected, maxTitleChars } = this.props;
    const lineOffset = 18;
    const title = data.title;
    const className = GraphUtils.classNames('node-text', {
      selected: isSelected,
    });
    const typeText = this.getTypeText(data, nodeTypes);

    return (
      <text className={className} textAnchor="middle">
        {!!typeText && <tspan opacity="0.5">{typeText}</tspan>}
        {title && (
          <tspan x={0} dy={lineOffset} fontSize="10px">
            {title.length > maxTitleChars
              ? title.substr(0, maxTitleChars)
              : title}
          </tspan>
        )}
        {title && <title>{title}</title>}
      </text>
    );
  }
}

export default NodeText;
