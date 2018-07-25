
// @flow

// TODO: This is disabled because layout-engine has an import loop that shouldn't cause a problem
// but Flowtype doesn't like it, so I can't run the Jest tests. Hopefully we can figure it out.
// LayoutEngine =imports> GraphView =imports> LayoutEngineConfig =imports> None =typeof> LayoutEngine

import * as React from 'react';

import LayoutEngine from '../../../src/utilities/layout-engine/layout-engine';

describe('LayoutEngine', () => {
  let output = null;

  describe('class', () => {
    it('is defined', () => {
      expect(LayoutEngine).toBeDefined();
    });
  });
});

// describe('LayoutEngine', () => {
//   it('does nothing', () => {
//     // this does nothing
//   });
// });
