const createStore = require('../../src/store');
const { addStyleSheet } = require('../../src/actions/element-rules');
const { mockCssStyleSheet } = require('../utils');
const { styleSheetText1, styleSheetText2 } = require('./style-sheets');
const dom = require('../../src/utils/dom');
const $ = require('../../src/selectors');

module.exports = {
  twoStyleSheetsStore: function() {
    const store = createStore();
    store.dispatch(addStyleSheet(mockCssStyleSheet(styleSheetText1)));
    store.dispatch(addStyleSheet(mockCssStyleSheet(styleSheetText2)));
    return store;
  },
  twoStyleSheetsMock: function(store) {
    const mock = dom.enableMock();
    mock.styleSheets = $.styleSheets(store.getState())
      .map(styleSheet => styleSheet.get('cssStyleSheet'))
      .toJS();
    return { mock, disableMock: dom.disableMock };
  },
  blankStore: createStore,
};
