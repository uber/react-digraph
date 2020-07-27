// @flow

import {
  EMPTY_EDGE_TYPE,
  EMPTY_TYPE,
  POLY_TYPE,
  SPECIAL_CHILD_SUBTYPE,
  SPECIAL_EDGE_TYPE,
  SPECIAL_TYPE,
  SKINNY_TYPE,
} from './graph-config'; // Configures node/edge types

export default {
  edges: [
    {
      handleText: '5',
      source: 'start1',
      target: 'a1',
      type: SPECIAL_EDGE_TYPE,
    },
    {
      handleText: '5',
      source: 'a1',
      target: 'a2',
      type: SPECIAL_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a2',
      target: 'a4',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a1',
      target: 'a3',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a3',
      target: 'a4',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a1',
      target: 'a5',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a4',
      target: 'a1',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '54',
      source: 'a1',
      target: 'a6',
      type: EMPTY_EDGE_TYPE,
    },
    {
      handleText: '24',
      source: 'a1',
      target: 'a7',
      type: EMPTY_EDGE_TYPE,
    },
  ],
  nodes: [
    {
      id: 'start1',
      title: 'Start (0)',
      type: SPECIAL_TYPE,
    },
    {
      id: 'a1',
      title: 'Node A (1)',
      type: SPECIAL_TYPE,
      x: 258.3976135253906,
      y: 331.9783248901367,
    },
    {
      id: 'a2',
      subtype: SPECIAL_CHILD_SUBTYPE,
      title: 'Node B (2)',
      type: EMPTY_TYPE,
      x: 593.9393920898438,
      y: 260.6060791015625,
    },
    {
      id: 'a3',
      title: 'Node C (3)',
      type: EMPTY_TYPE,
      x: 237.5757598876953,
      y: 61.81818389892578,
    },
    {
      id: 'a4',
      title: 'Node D (4)',
      type: EMPTY_TYPE,
      x: 600.5757598876953,
      y: 600.81818389892578,
    },
    {
      id: 'a5',
      title: 'Node E (5)',
      type: null,
      x: 50.5757598876953,
      y: 500.81818389892578,
    },
    {
      id: 'a6',
      title: 'Node E (6)',
      type: SKINNY_TYPE,
      x: 300,
      y: 600,
    },
    {
      id: 'a7',
      title: 'Node F (7)',
      type: POLY_TYPE,
      x: 0,
      y: 300,
    },
  ],
};
