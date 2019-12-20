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
    const { children, direction, onLockChanged } = this.props;
    const sidebarClassName = GraphUtils.classNames('sidebar', direction);

    return (
      <div className={sidebarClassName}>
        <div id="textEditorDiv" className={this.getContainerClasses()}>
          {children}
        </div>
        <div id="editorBottomBar">
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
          <div id="empty"></div>
          <svg
            version="1.1"
            id="resizeIcon"
            width="25"
            height="25"
            viewBox="0 0 300.373 300.373"
          >
            <g fill="white">
              <g>
                <path
                  d="M279.893,136.533c-11.293,0-20.48,9.187-20.48,20.48v102.4h-102.4c-11.293,0-20.48,9.187-20.48,20.48
                  s9.187,20.48,20.48,20.48h136.533c3.773,0,6.827-3.057,6.827-6.827V157.013C300.373,145.72,291.186,136.533,279.893,136.533z
                   M286.72,286.72H157.013c-3.767,0-6.827-3.062-6.827-6.827s3.06-6.827,6.827-6.827H266.24c3.773,0,6.827-3.057,6.827-6.827
                  V157.013c0-3.765,3.06-6.827,6.827-6.827s6.827,3.062,6.827,6.827V286.72z"
                />
              </g>
            </g>
            <g fill="white">
              <g>
                <path
                  d="M211.627,68.267c-11.293,0-20.48,9.187-20.48,20.48v102.4h-102.4c-11.293,0-20.48,9.187-20.48,20.48
                  s9.187,20.48,20.48,20.48H225.28c3.773,0,6.827-3.057,6.827-6.827V88.747C232.107,77.454,222.92,68.267,211.627,68.267z
                   M218.453,218.453H88.747c-3.767,0-6.827-3.062-6.827-6.827s3.06-6.827,6.827-6.827h109.227c3.773,0,6.827-3.057,6.827-6.827
                  V88.747c0-3.765,3.06-6.827,6.827-6.827s6.827,3.062,6.827,6.827V218.453z"
                />
              </g>
            </g>
            <g fill="white">
              <g>
                <path
                  d="M143.36,0c-11.293,0-20.48,9.187-20.48,20.48v102.4H20.48C9.187,122.88,0,132.067,0,143.36s9.187,20.48,20.48,20.48
                  h136.533c3.773,0,6.827-3.057,6.827-6.827V20.48C163.84,9.187,154.653,0,143.36,0z M150.187,150.187H20.48
                  c-3.767,0-6.827-3.062-6.827-6.827s3.06-6.827,6.827-6.827h109.227c3.773,0,6.827-3.057,6.827-6.827V20.48
                  c0-3.765,3.06-6.827,6.827-6.827s6.827,3.062,6.827,6.827V150.187z"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    );
  }
}
