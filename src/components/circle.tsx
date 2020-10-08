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

type ICircleProps = {
  gridSpacing?: number;
  gridDotSize?: number;
};

class Circle extends React.Component<ICircleProps> {
  static defaultProps = {
    gridDotSize: 2,
    gridSpacing: 36,
  };

  render() {
    const { gridSpacing, gridDotSize } = this.props;

    return (
      <circle
        className="circle"
        cx={(gridSpacing || 0) / 2}
        cy={(gridSpacing || 0) / 2}
        r={gridDotSize}
      />
    );
  }
}

export default Circle;
