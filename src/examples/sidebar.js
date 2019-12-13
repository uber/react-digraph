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

type ISidebarProps = {
  children: any,
  direction: 'left' | 'right' | 'up' | 'down',
  size: number | string,
  locked: boolean,
  onLockChanged: () => void,
};

type ISidebarState = {
  sidebarClass?: string | null,
  sidebarRatio: number,
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
      sidebarRatio: 0.3,
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

  changeSidebarRatio = e => {
    this.setState({ sidebarRatio: e.target.value });
  };

  getLockClasses = () => {
    const classes = ['lock'];

    classes.push(this.props.locked ? 'closed' : 'open');

    return GraphUtils.classNames(classes);
  };

  renderToggleBar(direction: string) {
    return (
      <div className="sidebar-toggle-bar" onClick={this.toggleContainer}>
        <i className={this.getArrowIconClasses(direction)} />
      </div>
    );
  }

  render() {
    const { children, direction, size, onLockChanged } = this.props;
    const { sidebarRatio } = this.state;
    const sidebarClassName = GraphUtils.classNames('sidebar', direction);

    const grow = Math.pow(10, sidebarRatio) - 1;
    const sidebarStyle = {
      'flex-grow': grow.toString(),
    };

    return (
      <div className={sidebarClassName} style={sidebarStyle}>
        <div
          className={this.getContainerClasses()}
          style={this.getContainerStyle(size, direction)}
        >
          {children}
        </div>
        <div className="slider-wrapper">
          <span>-</span>
          <input
            type="range"
            className="slider"
            min="0"
            max="1"
            value={sidebarRatio}
            onChange={this.changeSidebarRatio}
            step="0.001"
          />
          <span>+</span>
        </div>
        <svg
          className={this.getLockClasses()}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          onClick={onLockChanged}
        >
          <path d="M17 9.761v-4.761c0-2.761-2.238-5-5-5-2.763 0-5 2.239-5 5v4.761c-1.827 1.466-3 3.714-3 6.239 0 4.418 3.582 8 8 8s8-3.582 8-8c0-2.525-1.173-4.773-3-6.239zm-8-4.761c0-1.654 1.346-3 3-3s3 1.346 3 3v3.587c-.927-.376-1.938-.587-3-.587s-2.073.211-3 .587v-3.587zm3 17c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zm2-6c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z" />
        </svg>
        <div className="sidebar-toggle-bar" onClick={this.toggleContainer}>
          <i className={this.getArrowIconClasses(direction)} />
        </div>
      </div>
    );
  }
}
