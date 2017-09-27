// @flow
/* global browser */
import { logDevtools as log } from '../utils/log';
log('loaded');

/**
 * Create a panel, and add listeners for panel show/hide events.
 */
browser.devtools.panels
  .create('My Panel', '', 'docs/index.html')
  .then(newPanel => {
    newPanel.onShown.addListener(() => {});
    newPanel.onHidden.addListener(() => {});
  });
