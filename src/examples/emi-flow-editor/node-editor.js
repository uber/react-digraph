// Helper styles for demo
import * as React from 'react';

class NodeEditor extends React.Component {
  render() {
    const { children, onChangeIndex } = this.props;
    const node = children;

    if (!node) {
      return (
        <div>
          <h1>Select a node...</h1>
        </div>
      );
    }

    return (
      <div>
        <h1>{node.title}</h1>
        <form onSubmit={e => e.preventDefault()}>
          Index:
          <input
            type="text"
            name="index"
            value={node.index}
            onChange={onChangeIndex}
          />
        </form>
      </div>
    );
  }
}

export default NodeEditor;
