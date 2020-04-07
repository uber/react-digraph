import * as React from 'react';
import debounce from 'debounce';

class IndexInput extends React.Component {
  constructor(props) {
    super(props);

    const { onChangeIndex, children } = this.props;

    this.state = { newIndex: children };
    this.onChangeIndex = debounce(onChangeIndex, 250);
  }

  componentDidUpdate(prevProps) {
    const index = this.props.children;
    const prevIndex = prevProps.children;

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

    return (
      <label>
        Index:
        <input
          type="text"
          name="index"
          value={newIndex}
          onChange={e => this.onChangeNewIndex(e.target.value)}
          onBlur={() => this.rollbackNewIndex(children)}
        />
      </label>
    );
  }
}

export default IndexInput;
