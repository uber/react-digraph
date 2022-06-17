// @flow

// import { type IGraphViewProps } from '../../components/graph-view';
import { type IGraphViewProps } from '../../components/graph-view-props';
import { type INode } from '../../components/node';

export type IPosition = {
  x: number,
  y: number,
  [key: string]: any,
};

export default class LayoutEngine {
  graphViewProps: IGraphViewProps;
  constructor(graphViewProps: IGraphViewProps) {
    this.graphViewProps = graphViewProps;
  }

  calculatePosition(node: IPosition) {
    return node;
  }

  adjustNodes(nodes: INode[], nodesMap?: any): INode[] {
    let node = null;

    for (let i = 0; i < nodes.length; i++) {
      node = nodes[i];
      const position = this.calculatePosition({
        x: node.x || 0,
        y: node.y || 0,
      });

      node.x = position.x;
      node.y = position.y;
    }

    return nodes;
  }

  getPositionForNode(node: IPosition): IPosition {
    return this.calculatePosition(node);
  }
}
