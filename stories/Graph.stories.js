import React from 'react';
import Graph from '../src/examples/graph';

export const GraphExample = () => (
    <Graph />
);

GraphExample.story = {
  name: 'example',
};

export default {
  title: 'Graph',
  component: GraphExample,
};
