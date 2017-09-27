// @flow
import { logContent as log } from '../utils/log';
import type {
  MessageResponse,
  ContentToPanel,
  PanelToContent,
} from '../types/messaging';

log('loaded');

function getStyleSheets(): string[] {
  return [...document.styleSheets].map(
    ({ ownerNode }) => (ownerNode: Object).innerHTML
  );
}

(async () => {
  const message = await createMessagingInterface();
  message.sendStyleSheets(getStyleSheets());
})();

async function createMessagingInterface() {
  const panel = await connectToPanelViaBackground();
  return {
    sendStyleSheets(styleSheets: string[]) {
      panel.postMessage({ type: 'SEND_STYLESHEETS', styleSheets });
    },
  };
}

async function connectToPanelViaBackground() {
  log('trying to connnect to background script');
  const background = browser.runtime.connect({
    name: 'INSPECTOR_EXT_CONNECTION_CONTENT',
  });

  await new Promise(resolve => {
    background.onMessage.addListener(message => {
      log('found message', message);
      if (typeof message === 'object' && message.type === 'PORTS_PAIRED') {
        resolve();
      }
    });
  });

  // The background script relays our messages to the devtools panel.
  return background;
}
