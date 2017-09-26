// @flow
/* global browser */
console.log('!!! devtools.js');
debugger;
/**
 * Create a panel, and add listeners for panel show/hide events.
 */
browser.devtools.panels
  .create('My Panel', '', 'docs/index.html')
  .then(newPanel => {
    newPanel.onShown.addListener(() => {});
    newPanel.onHidden.addListener(() => {});
  });
