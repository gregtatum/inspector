// @flow

export type ContentToPanel = {
  type: 'SEND_STYLESHEETS',
  styleSheets: string[],
};

export type PanelToContent = { type: 'INITIAL_CONNECT' };
