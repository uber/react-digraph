// @flow

import { type IEdge } from '../../components/edge';
import { type INode } from '../../components/node';

export type IGraphInput = {
  nodes: INode[],
  edges: IEdge[],
};

export default class Transformer {
  /**
   * Converts an input from the specified type to IGraphInput type.
   * @param input
   * @returns IGraphInput
   */
  static transform(input: any): IGraphInput {
    return {
      edges: [],
      nodes: [],
    };
  }

  /**
   * Converts a graphInput to the specified transformer type.
   * @param graphInput
   * @returns any
   */
  static revert(graphInput: IGraphInput): any {
    return graphInput;
  }
}
