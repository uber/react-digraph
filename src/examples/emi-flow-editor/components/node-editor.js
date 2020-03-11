import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import debounce from 'debounce';

import MultiEdgeEditor from './multi-edge-editor';
import AnswerEditor from './answer-editor';
import FaqEditor from './faq-editor';

class NodeEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = { newIndex: '' };
    const { onChangeIndex } = this.props.questionHandlers;

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
    const {
      children,
      faqMode,
      questionHandlers,
      aiHandlers,
      serverHandlers,
      edgeHandlers,
      faqHandlers,
    } = this.props;
    const {
      onChangeImmediateNext,
      onMakeFirst,
      onChangeTextArea,
    } = questionHandlers;
    const { newIndex } = this.state;

    if (!children && !faqMode) {
      return (
        <div id="nodeEditor" className="someNodeEditor">
          <h1>Select a node or an edge, or click on FAQ...</h1>
        </div>
      );
    }

    if (faqMode) {
      return <FaqEditor faqHandlers={faqHandlers} />;
    }

    if (children.source) {
      return (
        <div id="nodeEditor">
          <MultiEdgeEditor edgeHandlers={edgeHandlers}>
            {children}
          </MultiEdgeEditor>
        </div>
      );
    }

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
          <label>
            Text:
            <TextareaAutosize
              value={question.text}
              onChange={e => onChangeTextArea('text', e.target.value)}
            />
          </label>
          <label>
            Immediate next:
            <input
              name="immediateNext"
              type="checkbox"
              checked={question.immediateNext}
              onChange={e => onChangeImmediateNext(e.target.checked)}
            />
          </label>
          {!question.immediateNext && (
            <AnswerEditor
              questionHandlers={questionHandlers}
              aiHandlers={aiHandlers}
              serverHandlers={serverHandlers}
            >
              {children}
            </AnswerEditor>
          )}
        </form>
      </div>
    );
  }
}

export default NodeEditor;
