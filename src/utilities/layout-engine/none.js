// @flow
import LayoutEngine, { type IPosition } from './layout-engine';

class None extends LayoutEngine {
  calculatePosition(node: IPosition) {
    return node;
  }
}

export default None;
