import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import EdgeEditor from './edge-editor';
import AnswerEditor from './answer-editor';

class NodeEditor extends React.Component {
  render() {
    const {
      children,
      onChangeIndex,
      onChangeQuestion,
      onChangeImmediateNext,
      onChangeQuickReplies,
      aiHandlers,
      serverHandlers,
      onMakeFirst,
      onChangeConn,
      onMakeDefaultConn,
      getPrevIndexes,
      getPrevContextVars,
      getIntents,
      onChangeArrayFilterValue,
    } = this.props;

    if (!children) {
      return (
        <div id="nodeEditor" className="someNodeEditor">
          <h1>Select a node or an edge...</h1>
        </div>
      );
    }

    if (children.source) {
      return (
        <div id="nodeEditor">
          <EdgeEditor
            onChangeConn={onChangeConn}
            onMakeDefaultConn={onMakeDefaultConn}
            getPrevIndexes={getPrevIndexes}
            getIntents={getIntents}
            getPrevContextVars={getPrevContextVars}
            onChangeArrayFilterValue={onChangeArrayFilterValue}
          >
            {children}
          </EdgeEditor>
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
              value={question.index}
              onChange={onChangeIndex}
            />
          </label>
          <label>
            Text:
            <TextareaAutosize
              value={question.text}
              onChange={e => onChangeQuestion('text', e.target.value)}
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
              onChangeQuestion={onChangeQuestion}
              onChangeQuickReplies={onChangeQuickReplies}
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
