import * as React from 'react';
import Select from 'react-select';

import { langItems } from '../empathy.js';
import { selectTheme, getSimpleItem } from './common';

class ModuleImportEditor extends React.Component {
  render() {
    return (
      <div id="moduleImportEditor" className="rightEditor">
        <label>
          Module:
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={getSimpleItem(null)}
            onChange={() => null}
            options={langItems}
            isSearchable={true}
          />
        </label>
      </div>
    );
  }
}

export default ModuleImportEditor;
