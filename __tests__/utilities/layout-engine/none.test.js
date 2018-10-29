
// @flow
import * as React from 'react';

import None from '../../../src/utilities/layout-engine/none';

describe('None', () => {
  let output = null;

  describe('class', () => {
    it('is defined', () => {
      expect(None).toBeDefined();
    });

    it('instantiates', () => {
      const blah = new None();
    });
  });
});
