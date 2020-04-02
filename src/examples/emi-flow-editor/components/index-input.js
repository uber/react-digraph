import * as React from 'react';
import debounce from 'debounce';

class IndexInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = { newIndex: '' };
    const { onChangeIndex } = this.props;

    this.onChangeIndex = debounce(onChangeIndex, 250);
  }

  getIndex = props => {
    const { children } = props;

    return children.index;
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
    const { children } = this.props;
    const { newIndex } = this.state;

    const question = children;

    return (
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
    );
  }
}

export default IndexInput;
