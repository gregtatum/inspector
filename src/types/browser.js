// @flow
export type Browser = {
  devtools: {
    panels: {
      create: (string, string, string) => Promise<ExtensionPanel>,
    },
  },
  runtime: {
    connect: (?string | ?RuntimeConnectOptions) => Port,
    onConnect: EventListener<(Port) => void>,
    sendMessage: (mixed, ?(mixed) => mixed) => void,
  },
};

export type RuntimeConnectOptions = {
  // Extension ID
  name?: string,
  includeTlsChannelId?: boolean,
};

export type EventListener<T> = {
  addListener: T => {},
  removeListener: T => {},
};

export type Port = {
  name: string,
  disconnect: () => void,
  error?: { message: string },
  onDisconnect: EventListener<(?Port) => void>,
  onMessage: EventListener<(*) => void>,
  sender?: MessageSender,
  postMessage: mixed => {},
};

export type Tab = {
  id: number,
  index: number,
  windowId: number,
  highlighted: boolean,
  active: boolean,
  pinned: boolean,
  status: string, // e.g. 'complete',
  discarded: boolean,
  incognito: boolean,
  width: number,
  height: number,
  lastAccessed: number, // milliseconds?
  audible: boolean,
  mutedInfo: {
    muted: boolean,
  },
  isArticle: boolean,
};

export type MessageSender = {
  // TODO
  id?: string, // e.g. "a214702480d499ccf57d38d3b6032d01ef8ce225"
  tab?: Tab,
  frameId?: number,
  url?: string, // e.g. "file:///Users/gregorytatum/Desktop/html/divs.html"
  tlsChannelId?: string,
  contextId?: string, // e.g. "0-9",
  envType?: string, //e.g. "content_child",
  extensionId?: string,
};

export type ExtensionPanel = {
  onShown: { addListener: ((mixed) => mixed) => void },
  onHidden: { addListener: ((mixed) => mixed) => void },
};
