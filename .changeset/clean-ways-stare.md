---
"fritz": major
---

Add new lifecycle methods

This change adds new lifecycle methods, `getSnapshotBeforeUpdate` and `componentDidUpdate`.

It also removes `componentWillReceiveProps` and `componentWillUpdate`.

The latter two are deprecated in both React and Preact. There is no reason for us to keep them.