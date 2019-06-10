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
import GraphUtils from '../components/graph-util';

type ISidebarProps = {
  children: any,
  direction: 'left' | 'right' | 'up' | 'down',
  size: number | string,
};

type ISidebarState = {
  sidebarClass?: string | null,
};

const sidebarClass = {
  CLOSED: 'closed',
  OPEN: 'open',
};

const directionOpposites = {
  down: 'up',
  left: 'right',
  right: 'left',
  up: 'down',
};

export default class Sidebar extends React.Component<
  ISidebarProps,
  ISidebarState
> {
  static defaultProps = {
    direction: 'left',
    size: '130px',
  };

  constructor(props: ISidebarProps) {
    super(props);
    this.state = {
      sidebarClass: sidebarClass.OPEN,
    };
  }

  toggleContainer = () => {
    const originalValue = this.state.sidebarClass;
    let newValue = sidebarClass.CLOSED;

    if (originalValue === newValue) {
      newValue = sidebarClass.OPEN;
    }

    this.setState({
      sidebarClass: newValue,
    });
  };

  getContainerClasses(): string {
    const classes = ['sidebar-main-container'];

    classes.push(this.state.sidebarClass || '');

    return GraphUtils.classNames(classes);
  }

  getContainerStyle(size: number | string, direction: string) {
    if (direction === 'up' || direction === 'down') {
      return { height: `${size}`, maxHeight: `${size}` };
    }

    return { width: `${size}`, maxWidth: `${size}` };
  }

  getArrowIconClasses(direction: string): string {
    const classes = ['icon'];

    if (this.state.sidebarClass === sidebarClass.CLOSED) {
      classes.push(`icon_${directionOpposites[direction]}-arrow`);
    } else {
      classes.push(`icon_${direction}-arrow`);
    }

    return GraphUtils.classNames(classes);
  }

  renderToggleBar(direction: string) {
    return (
      <div className="sidebar-toggle-bar" onClick={this.toggleContainer}>
        <i className={this.getArrowIconClasses(direction)} />
      </div>
    );
  }

  render() {
    const { children, direction, size } = this.props;
    const sidebarClassName = GraphUtils.classNames('sidebar', direction);

    return (
      <div className={sidebarClassName}>
        <div
          className={this.getContainerClasses()}
          style={this.getContainerStyle(size, direction)}
        >
          {children}
        </div>
        <div className="sidebar-toggle-bar" onClick={this.toggleContainer}>
          <i className={this.getArrowIconClasses(direction)} />
        </div>
      </div>
    );
  }
}
