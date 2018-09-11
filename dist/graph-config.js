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

/*
  Example config for GraphView component
*/
import * as React from 'react';

export const NODE_KEY = 'id'; // Key used to identify nodes

// These keys are arbitrary (but must match the config)
// However, GraphView renders text differently for empty types
// so this has to be passed in if that behavior is desired.
export const EMPTY_TYPE = 'empty'; // Empty node type
export const SPECIAL_TYPE = 'special';
export const SKINNY_TYPE = 'skinny';
export const SPECIAL_CHILD_SUBTYPE = 'specialChild';
export const EMPTY_EDGE_TYPE = 'emptyEdge';
export const SPECIAL_EDGE_TYPE = 'specialEdge';

export const nodeTypes = [EMPTY_TYPE, SPECIAL_TYPE, SKINNY_TYPE];
export const edgeTypes = [EMPTY_EDGE_TYPE, SPECIAL_EDGE_TYPE];

const EmptyShape = (
  <symbol viewBox="0 0 100 100" id="empty">
    <circle cx="50" cy="50" r="45" />
  </symbol>
);

const SpecialShape = (
  <symbol viewBox="0 0 100 100" id="special">
    <rect transform="translate(50) rotate(45)" width="70" height="70" />
  </symbol>
);

const SkinnyShape = (
  <symbol viewBox="0 0 70 35" id="skinny">
    <rect width="70" height="40" />
  </symbol>
);

const SpecialChildShape = (
  <symbol viewBox="0 0 100 100" id="specialChild">
    <rect x="2.5" y="0" width="95" height="97.5" fill="rgba(30, 144, 255, 0.12)" />
  </symbol>
);

const EmptyEdgeShape = (
  <symbol viewBox="0 0 50 50" id="emptyEdge">
    <circle cx="25" cy="25" r="8" fill="currentColor" />
  </symbol>
);

const SpecialEdgeShape = (
  <symbol viewBox="0 0 50 50" id="specialEdge">
    <rect transform="rotate(45)" x="27.5" y="-7.5" width="15" height="15" fill="currentColor" />
  </symbol>
);

export default {
  EdgeTypes: {
    emptyEdge: {
      shape: EmptyEdgeShape,
      shapeId: '#emptyEdge'
    },
    specialEdge: {
      shape: SpecialEdgeShape,
      shapeId: '#specialEdge'
    }
  },
  NodeSubtypes: {
    specialChild: {
      shape: SpecialChildShape,
      shapeId: '#specialChild'
    }
  },
  NodeTypes: {
    empty: {
      shape: EmptyShape,
      shapeId: '#empty',
      typeText: 'None'
    },
    special: {
      shape: SpecialShape,
      shapeId: '#special',
      typeText: 'Special'
    },
    skinny: {
      shape: SkinnyShape,
      shapeId: '#skinny',
      typeText: 'Skinny'
    }
  }
};
