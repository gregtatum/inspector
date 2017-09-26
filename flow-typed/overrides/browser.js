// @flow
declare class Browser {
  devtools: {
    panels: DevToolsPanel,
  },
}

type DevToolsPanel = {
  create: (string, string, string) => Promise<ExtensionPanel>,
};

declare var browser: Browser;

type ExtensionPanel = {
  onShown: { addListener: ((mixed) => mixed) => void },
  onHidden: { addListener: ((mixed) => mixed) => void },
};
