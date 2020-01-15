import * as React from 'react';

class FaqEditor extends React.Component {
  render() {
    const { faqHandlers } = this.props;
    const { onEnableFaqs, getFaqs } = faqHandlers;
    const faq = getFaqs();

    return (
      <div id="faqEditor" className="someNodeEditor">
        <h1>FAQs</h1>
        <label>
          Enable FAQs:
          <input
            name="faqsEnabled"
            type="checkbox"
            checked={faq ? true : false}
            onChange={e => onEnableFaqs(e.target.checked)}
          />
        </label>
      </div>
    );
  }
}

export default FaqEditor;
