// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createStore from './store.js';
import app from './components/app';
import { logPanel as log } from '../utils/log';

(function main() {
  const store = createStore({ logging: true });
  connectToPageViaBackground();

  const reduxApp = React.createElement(
    Provider,
    { store },
    React.createElement(app)
  );
  ReactDOM.render(reduxApp, document.querySelector('#app'));
})();

log('sending connect');
// Create a connection to the background page

function connectToPageViaBackground() {
  return new Promise(resolve => {
    const background = browser.runtime.connect({
      name: 'panel-' + browser.devtools.inspectedWindow.tabId,
    });

    background.onMessage.addListener(message => {
      log('found message', message);
      if (typeof message === 'object' && message.type === 'PORTS_PAIRED') {
        resolve(background);
      }
    });
  });
}
