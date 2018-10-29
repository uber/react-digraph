import GV, {
  Edge,
  Node,
  GraphUtils,
  BwdlTransformer,
  GraphView
} from '../src/';

describe('Imports', () => {
  it('has all of the exports', () => {
    expect(GV).toBeDefined();
    expect(Edge).toBeDefined();
    expect(Node).toBeDefined();
    expect(GraphUtils).toBeDefined();
    expect(BwdlTransformer).toBeDefined();
    expect(GV).toEqual(GraphView);
  });
});
