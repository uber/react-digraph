// @flow

import * as React from 'react';
import { shallow } from 'enzyme';
import NodeShape from '../../src/components/node-shape';

describe('NodeShape component', () => {
  let output;
  let nodeData;
  let nodeTypes;
  let nodeSubtypes;

  beforeEach(() => {
    nodeData = {
      uuid: '1',
      title: 'Test',
      type: 'emptyNode',
      x: 5,
      y: 10,
    };

    nodeTypes = {
      emptyNode: {
        shapeId: '#test',
      },
    };

    nodeSubtypes = {};

    output = shallow(
      <NodeShape
        data={nodeData}
        nodeTypes={nodeTypes}
        nodeSubtypes={nodeSubtypes}
        nodeKey="uuid"
        nodeSize={100}
      />
    );
  });

  it('renders', () => {
    const g = output.find('g');
    const use = g.find('use');
    const nodeSubtypeShape = g.find('.subtype-shape');

    expect(g.props().width).toEqual(100);
    expect(g.props().height).toEqual(100);
    expect(use.length).toEqual(1);
    expect(use.props()).toEqual({
      className: 'node',
      height: 100,
      href: '#test',
      width: 100,
      x: -50,
      y: -50,
      xmlns: 'http://www.w3.org/2000/svg',
    });
    expect(nodeSubtypeShape.length).toEqual(0);
  });

  it('returns a node shape with a subtype', () => {
    nodeData.subtype = 'fake';
    nodeSubtypes.fake = {
      shapeId: '#blah',
    };
    output = shallow(
      <NodeShape
        data={nodeData}
        nodeTypes={nodeTypes}
        nodeSubtypes={nodeSubtypes}
        nodeKey="uuid"
        nodeSize={100}
      />
    );

    const nodeSubtypeShape = output.find('.subtype-shape');

    expect(nodeSubtypeShape.length).toEqual(1);
    expect(nodeSubtypeShape.props()).toEqual({
      className: 'subtype-shape',
      height: 100,
      href: '#blah',
      width: 100,
      x: -50,
      y: -50,
      xmlns: 'http://www.w3.org/2000/svg',
    });
  });
});
