import * as React from 'react';
import debounce from 'debounce';

import QuestionEditor from './question-editor';

class NodeEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = { newIndex: '' };
    const { onChangeIndex } = this.props.nodeHandlers;

    this.onChangeIndex = debounce(onChangeIndex, 250);
  }

  getIndex = props => {
    const { children } = props;

    return children && children.gnode && children.gnode.question.index;
  };

  componentDidUpdate(prevProps) {
    const index = this.getIndex(this.props);
    const prevIndex = this.getIndex(prevProps);

    if (index && index !== prevIndex) {
      this.setState({ newIndex: index });
    }
  }

  onChangeNewIndex = newIndex => {
    this.setState({ newIndex });
    this.onChangeIndex(newIndex);
  };

  rollbackNewIndex = newIndex => this.setState({ newIndex });

  render() {
    const { children, nodeHandlers } = this.props;
    const { questionHandlers, onMakeFirst } = nodeHandlers;
    const { newIndex } = this.state;

    const node = children;
    const question = node.gnode.question;

    return (
      <div id="nodeEditor" className="someNodeEditor">
        <h1>{question.index}</h1>
        <form onSubmit={e => e.preventDefault()} className="someNodeEditor">
          {node.first ? (
            <label>First flow node.</label>
          ) : (
            <label>
              Click to make this node the first of the flow:
              <input
                name="first"
                type="button"
                value="Make first"
                onClick={onMakeFirst}
              />
            </label>
          )}
          <label>
            Index:
            <input
              type="text"
              name="index"
              value={newIndex}
              onChange={e => this.onChangeNewIndex(e.target.value)}
              onBlur={() => this.rollbackNewIndex(question.index)}
            />
          </label>
          <QuestionEditor questionHandlers={questionHandlers}>
            {node}
          </QuestionEditor>
        </form>
      </div>
    );
  }
}

export default NodeEditor;
