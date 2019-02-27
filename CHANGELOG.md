**v6.2.0** - Feb 26, 2019
- PR #99 - Avoid creating orphan edges (@iamsoorena) - https://github.com/uber/react-digraph/pull/99
- PR #109 - Only import the expand icon (@rileyhilliard) - https://github.com/uber/react-digraph/pull/109
- PR #107 - Adding webpack-build-analyzer to react-digraph (@rileyhilliard) - https://github.com/uber/react-digraph/pull/107

**v6.0.0** - Jan 7, 2019 - Added mouse event to onCreateNode callback - Contributor: iamsoorena - https://github.com/uber/react-digraph/pull/98

**v5.1.0** - Nov 5, 2018 - Refactor of several APIs to fix race condition caused by using array indices to reference nodes rather than node IDs. Race condition would occur when a service would rewrite the array asynchronously, causing the indices to change. This would cause any node movement or edge changes to break.

**v5.0.6** - Oct 30, 2018 - First official release of v5.0 code. Please note that v4.x code is still present and being worked on, but it eventually be deprecated. Issues should include a version number to indicate to the developer which branch to work on. PRs should be targeted toward the correct branch (master is v5+, v4.x.x is older code).
