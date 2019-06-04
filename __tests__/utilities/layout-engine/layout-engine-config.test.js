// @flow
import * as React from "react";

import { LayoutEngines } from "../../../src/utilities/layout-engine/layout-engine-config";

describe("LayoutEngineConfig", () => {
  let output = null;

  describe("class", () => {
    it("is defined", () => {
      expect(LayoutEngines).toBeDefined();
      expect(LayoutEngines.None).toBeDefined();
      expect(LayoutEngines.SnapToGrid).toBeDefined();
      expect(LayoutEngines.VerticalTree).toBeDefined();
      expect(LayoutEngines.HorizontalTree).toBeDefined();
    });
  });
});
