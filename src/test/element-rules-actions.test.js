const $ = require('../src/selectors');
const actions = require('../src/actions/element-rules');
const { assertDeclaration } = require('./utils');
const {
  twoStyleSheetsStore,
  twoStyleSheetsMock,
  blankStore,
} = require('./fixtures/stores');
const {
  matchedSelector1,
  matchedSelector2,
  matchedSelector3,
  mockElement,
} = require('./fixtures/element');
const {
  styleSheetText1,
  styleSheetText2,
  mockCssStyleSheet1,
  mockCssStyleSheet2,
} = require('./fixtures/style-sheets');

describe('actions.addStyleSheet', () => {
  it('can add two stylesheets', function() {
    const store = blankStore();
    store.dispatch(actions.addStyleSheet(mockCssStyleSheet1));
    store.dispatch(actions.addStyleSheet(mockCssStyleSheet2));

    const styleSheets = $.styleSheets(store.getState());

    expect(styleSheets.size).toBe(2);
    expect(styleSheets.getIn([0, 'text'])).toBe(styleSheetText1);
    expect(styleSheets.getIn([1, 'text'])).toBe(styleSheetText2);
  });
});

describe('actions.setFocusedElement', () => {
  it('can set a focused element', function() {
    const store = twoStyleSheetsStore();
    store.dispatch(actions.setFocusedElement(mockElement));

    const rules = $.matchedRules(store.getState());
    const selectorNames = rules.map(rule => rule.get('selector')).toJS();

    expect(selectorNames.includes(matchedSelector1)).toBeTruthy();
    expect(selectorNames.includes(matchedSelector2)).toBeTruthy();
    expect(selectorNames.includes(matchedSelector3)).toBeTruthy();
    expect(selectorNames.length).toBe(3);
  });
});

describe('actions.editDeclarationName/editDeclarationValue/stopEditingDeclaration', () => {
  const store = twoStyleSheetsStore();
  let state;
  store.dispatch(actions.setFocusedElement(mockElement));
  state = store.getState();

  const declarationID = $.matchedRules(state).getIn([
    0,
    'declarations',
    0,
    'id',
  ]);

  const { styleSheet, rule, declaration } = $.declarationHeirarchy(
    state,
    declarationID
  );

  it('has an initial state of not being edited', function() {
    expect($.isEditingName(state)).toBe(false);
    expect($.isEditingValue(state)).toBe(false);
    expect($.editingDeclaration(state)).toBe(null);
    expect($.editingRule(state)).toBe(null);
    expect($.editingStyleSheet(state)).toBe(null);
  });

  it('can edit the name.', function() {
    store.dispatch(actions.editDeclarationName(rule, declaration));
    state = store.getState();

    expect($.isEditingName(state)).toBe(true);
    expect($.isEditingValue(state)).toBe(false);
    expect($.editingDeclaration(state)).toBe(declaration);
    expect($.editingRule(state)).toBe(rule);
    expect($.editingStyleSheet(state)).toBe(styleSheet);
  });

  it('can edit the value', function() {
    store.dispatch(actions.editDeclarationValue(rule, declaration));
    state = store.getState();

    // Now edit the value.
    expect($.isEditingName(state)).toBe(false);
    expect($.isEditingValue(state)).toBe(true);
    expect($.editingDeclaration(state)).toBe(declaration);
    expect($.editingRule(state)).toBe(rule);
    expect($.editingStyleSheet(state)).toBe(styleSheet);
  });

  it('goes back to not editing anything', function() {
    store.dispatch(actions.stopEditingDeclaration());
    state = store.getState();

    // Back to not editing anything.
    expect($.isEditingName(state)).toBe(false);
    expect($.isEditingValue(state)).toBe(false);
    expect($.editingDeclaration(state)).toBe(null);
    expect($.editingRule(state)).toBe(null);
    expect($.editingStyleSheet(state)).toBe(null);
  });
});

// TODO - This test should break up its assertions into separate tests.
// It's a little racy as-is.
describe('actions.setDeclarationName - basic rewriting', async () => {
  // Setup the state we want.
  const store = twoStyleSheetsStore();
  const { disableMock } = twoStyleSheetsMock(store);
  const originalRule = $.ruleFromSelector(
    store.getState(),
    '.page-container > *'
  );
  const originalDeclaration = originalRule.getIn(['declarations', 1]);
  const originalID = originalDeclaration.get('id');
  const originalStyleSheet = $.styleSheets(store.getState()).get(0);

  assertDeclaration(
    originalDeclaration,
    originalID,
    'width',
    '50px',
    'The declaration starts out with the correct initial values.'
  );

  const originalTextOnDom = originalStyleSheet.get('cssStyleSheet').ownerNode
    .innerHTML;

  it('has the stylesheet text in the store', function() {
    expect(originalStyleSheet.get('text')).toBe(styleSheetText1);
  });
  it('has the stylesheet unmodified on the DOM', function() {
    expect(originalTextOnDom).toBe(styleSheetText1);
  });

  const updateQueue = $.updateQueue(store.getState());
  store.dispatch(
    actions.setDeclarationValue(updateQueue, originalID, '1000em')
  );

  // Wait for this update queue to be processed
  await $.updateQueue(store.getState());

  const pageContainerRule = $.ruleFromSelector(
    store.getState(),
    '.page-container > *'
  );
  const widthDeclaration = pageContainerRule.getIn(['declarations', 1]);
  const styleSheet = $.styleSheets(store.getState()).get(0);

  assertDeclaration(
    widthDeclaration,
    originalID,
    'width',
    '1000em',
    'The declaration value was updated.'
  );

  const modifiedDomText = styleSheet.get('cssStyleSheet').ownerNode.innerHTML;
  it('has rewritten the stylesheets and node', function() {
    const rewrittenText = styleSheetText1.replace(
      'width: 50px;',
      'width: 1000em;'
    );
    expect(styleSheet.get('text')).toBe(rewrittenText);
    expect(modifiedDomText).toBe(rewrittenText);
  });

  disableMock();
});
