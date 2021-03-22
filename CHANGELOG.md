**8.0.0-alpha** - March 22, 2021
**Multiselect and Map conversion**
Version 8.0.0-alpha is a refactor to use Maps instead of arrays for the input nodes and edges. Users will be required to refactor their code. See the commits below for examples from the examples website folder.
The 8.0.0-alpha version should be considered unstable and may undergo changes.

- PR #293 - commit 303b4917ec4b4971007c8fc442c266ff73022752 (origin/Issue_178_Select_Multiple_Nodes)
Author: Allan Bogh <ajbogh@uber.com>
Date:   Fri Jan 8 10:44:19 2021 -0800

    - 178 - Added multiselect ability using the allowMultiSelect property
    - Added more details to the README.
    - If allowMultiSelect is enabled then always use the onSelectNodes instead of onSelectNode.

- PR #297 - commit f208b7155a99be41de7640d21630e63a22b4a7fb (origin/Multiple_select_bugfixes)
Author: Allan Bogh <ajbogh@uber.com>
Date:   Wed Feb 3 10:31:31 2021 -0800

    Fixed various bugs with the multi-select feature and changed to using Maps.

**7.0.0** - August 5, 2020
- PR #247 - Updated types, function definitions, and optional properties. (@ajbogh) - https://github.com/uber/react-digraph/pull/247
- PR #246 - Fix #240 - cannot delete nodes with multiple graphs. (@ajbogh) - https://github.com/uber/react-digraph/pull/246
- PR #239 - Fix eslint src. (@Djazouli) - https://github.com/uber/react-digraph/pull/239
- PR #236 - on contextmenu event and create handle (@chiayenhung) - https://github.com/uber/react-digraph/pull/236
- PR #234 - Fixed #219. Can now render multiple graphs at the same time. (@ajbogh) - https://github.com/uber/react-digraph/pull/234
- PR #233 - Paste selected node at current mouse position. (@thinkty) - https://github.com/uber/react-digraph/pull/233
- PR #221 - Add "canSwapEdge" (@AxessLab) - https://github.com/uber/react-digraph/pull/221
- PR #220 - typings: add arg "event" to onSelectNode (@Rui1009) - https://github.com/uber/react-digraph/pull/220


**v6.7.0** - May 12, 2020
- PR #218 - Fixed edge rendering for Firefox and cleaned up code (@ajbogh) - https://github.com/uber/react-digraph/pull/218
- PR #214 - resolve #212 (@maekawataiki) - https://github.com/uber/react-digraph/pull/214
- PR #206 - add HorizontalTree to LayoutEngineType (@kazchimo) - https://github.com/uber/react-digraph/pull/206
- PR #202 - chore: update docs (@timhwang21) - https://github.com/uber/react-digraph/pull/202
- PR #198 - typings: initialBBox set to optional to match docs (@Vampiro) - https://github.com/uber/react-digraph/pull/198
- PR #187 - Fix tests (@ajbogh) - https://github.com/uber/react-digraph/pull/187
- PR #185 - new props README for HorizontalTree (@chiayenhung) - https://github.com/uber/react-digraph/pull/185


**v6.6.0** - January 8, 2020
- PR #184 - Horizontal tree (@chiayenhung) - https://github.com/uber/react-digraph/pull/184
- PR #185 - new props README for HorizontalTree (@chiayenhung) - https://github.com/uber/react-digraph/pull/185

**v6.5.0** - August 7, 2019
- PR #148 - Asynchronous Fast rendering
- PR #157 - Added data-intersect-ignore property to node SVG to prevent intersection calculaton from selecting the wrong element.
- PR #159 - Resolved #158 - Add tooltip for edges

**v6.4.0** - July 11, 2019
- PR #145 - Fix 'Cannot read property 'getBBox' of null' error when remounting  (@ksnyder9801) - https://github.com/uber/react-digraph/pull/145
- PR #139 - Added eslint rules and fixed code. (@ajbogh) - https://github.com/uber/react-digraph/pull/139
- PR #136 - Add horizontal layotu engine (@wfriebel) - https://github.com/uber/react-digraph/pull/136
- PR #134 - Resolved #114 - maxTitleChars property is not being used (@thesuperhomie) - https://github.com/uber/react-digraph/pull/134
- PR #131 - Fix expected params in handleDragEnd test (@ksnyder9801) - https://github.com/uber/react-digraph/pull/131


**v6.3.0** - May 21, 2019
- PR #130 - Added code to return the d3 event on node selection (@ajbogh) - https://github.com/uber/react-digraph/pull/130
- PR #129 - Add panToNode/panToEdge imperative methods (@ksnyder9801) - https://github.com/uber/react-digraph/pull/129

**v6.2.0** - Feb 26, 2019
- PR #99 - Avoid creating orphan edges (@iamsoorena) - https://github.com/uber/react-digraph/pull/99
- PR #109 - Only import the expand icon (@rileyhilliard) - https://github.com/uber/react-digraph/pull/109
- PR #107 - Adding webpack-build-analyzer to react-digraph (@rileyhilliard) - https://github.com/uber/react-digraph/pull/107

**v6.0.0** - Jan 7, 2019 - Added mouse event to onCreateNode callback - Contributor: iamsoorena - https://github.com/uber/react-digraph/pull/98

**v5.1.0** - Nov 5, 2018 - Refactor of several APIs to fix race condition caused by using array indices to reference nodes rather than node IDs. Race condition would occur when a service would rewrite the array asynchronously, causing the indices to change. This would cause any node movement or edge changes to break.

**v5.0.6** - Oct 30, 2018 - First official release of v5.0 code. Please note that v4.x code is still present and being worked on, but it eventually be deprecated. Issues should include a version number to indicate to the developer which branch to work on. PRs should be targeted toward the correct branch (master is v5+, v4.x.x is older code).
