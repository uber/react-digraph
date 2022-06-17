// @flow

import None from './none';
import SnapToGrid from './snap-to-grid';
import VerticalTree from './vertical-tree';
import HorizontalTree from './horizontal-tree';

export type LayoutEngine = None | SnapToGrid | VerticalTree | HorizontalTree;

export const LayoutEngines = {
  None,
  SnapToGrid,
  VerticalTree,
  HorizontalTree,
};
