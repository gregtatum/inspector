// @flow
import { logBackground as log } from '../utils/log';
import type { ContentToPanel, PanelToContent } from '../types/messaging';
import type { Port, MessageSender } from '../types/browser';

log('loaded');

init();
function init() {
  const ports = {};

  browser.runtime.onConnect.addListener(function(port: Port) {
    log('connection request from:', port.name, port);
    const panelPrefix = 'panel-';
    let tabId;
    let scriptType;
    if (port.name.startsWith(panelPrefix)) {
      tabId = Number(port.name.slice(panelPrefix.length));
      scriptType = 'panel';
    } else {
      const tab = port.sender ? port.sender.tab : null;
      if (!tab) {
        throw new Error(
          'Expected a content script message with an associated tab.'
        );
      }
      tabId = tab.id;
      scriptType = 'content';
    }
    log('found tab id:', tabId, scriptType);
    let portPair = ports[tabId];
    if (!portPair) {
      portPair = {};
      ports[tabId] = portPair;
    }
    portPair[scriptType] = port;

    log('portPair', portPair);
    if (portPair.content !== undefined && portPair.panel !== undefined) {
      log('pairing ports');
      // Both sides have now connected.
      connectPorts(portPair.content, portPair.panel);
    }
  });
}

function connectPorts(content, panel) {
  function handleContentToPanel(msg) {
    log('panel to content', msg);
    panel.postMessage(msg);
  }
  function handlePanelToContent(msg) {
    log('content to panel', msg);
    content.postMessage(msg);
  }
  function disconect() {
    log('disconnect');
    content.onMessage.removeListener(handleContentToPanel);
    panel.onMessage.removeListener(handlePanelToContent);
    content.disconnect();
    panel.disconnect();
  }
  content.onMessage.addListener(handleContentToPanel);
  panel.onMessage.addListener(handlePanelToContent);
  content.onDisconnect.addListener(disconect);
  panel.onDisconnect.addListener(disconect);
  content.postMessage({ type: 'PORTS_PAIRED' });
  panel.postMessage({ type: 'PORTS_PAIRED' });
}
