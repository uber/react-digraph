// @flow

import * as React from 'react';
import GraphUtils from '../../utilities/graph-util';

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
