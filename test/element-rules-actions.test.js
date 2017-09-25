const co = require('co');
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

test('actions.addStyleSheet', () => {
  const store = blankStore();
  store.dispatch(actions.addStyleSheet(mockCssStyleSheet1));
  store.dispatch(actions.addStyleSheet(mockCssStyleSheet2));

  const styleSheets = $.styleSheets(store.getState());

  expect(styleSheets.size).toBe(2);
  expect(styleSheets.getIn([0, 'text'])).toBe(styleSheetText1);
  expect(styleSheets.getIn([1, 'text'])).toBe(styleSheetText2);
});

test('actions.setFocusedElement', () => {
  const store = twoStyleSheetsStore();
  store.dispatch(actions.setFocusedElement(mockElement));

  const rules = $.matchedRules(store.getState());
  const selectorNames = rules.map(rule => rule.get('selector')).toJS();

  expect(selectorNames.includes(matchedSelector1)).toBeTruthy();
  expect(selectorNames.includes(matchedSelector2)).toBeTruthy();
  expect(selectorNames.includes(matchedSelector3)).toBeTruthy();
  expect(selectorNames.length).toBe(3);
});

test('actions.editDeclarationName/editDeclarationValue/stopEditingDeclaration', () => {
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

  // The initial state is not being edited.
  expect($.isEditingName(state)).toBe(false);
  expect($.isEditingValue(state)).toBe(false);
  expect($.editingDeclaration(state)).toBe(null);
  expect($.editingRule(state)).toBe(null);
  expect($.editingStyleSheet(state)).toBe(null);

  store.dispatch(actions.editDeclarationName(rule, declaration));
  state = store.getState();

  // Now edit the name.
  expect($.isEditingName(state)).toBe(true);
  expect($.isEditingValue(state)).toBe(false);
  expect($.editingDeclaration(state)).toBe(declaration);
  expect($.editingRule(state)).toBe(rule);
  expect($.editingStyleSheet(state)).toBe(styleSheet);

  store.dispatch(actions.editDeclarationValue(rule, declaration));
  state = store.getState();

  // Now edit the value.
  expect($.isEditingName(state)).toBe(false);
  expect($.isEditingValue(state)).toBe(true);
  expect($.editingDeclaration(state)).toBe(declaration);
  expect($.editingRule(state)).toBe(rule);
  expect($.editingStyleSheet(state)).toBe(styleSheet);

  store.dispatch(actions.stopEditingDeclaration());
  state = store.getState();

  // Back to not editing anything.
  expect($.isEditingName(state)).toBe(false);
  expect($.isEditingValue(state)).toBe(false);
  expect($.editingDeclaration(state)).toBe(null);
  expect($.editingRule(state)).toBe(null);
  expect($.editingStyleSheet(state)).toBe(null);
});

test('actions.setDeclarationName - basic rewriting', () => {
  // Setup the state we want.
  const store = twoStyleSheetsStore();
  const { disableMock } = twoStyleSheetsMock(store);
  let originalID, originalRule, originalDeclaration, originalStyleSheet;

  tt.test(' - The declaration is in an initial state.', t => {
    originalRule = $.ruleFromSelector(store.getState(), '.page-container > *');
    originalDeclaration = originalRule.getIn(['declarations', 1]);
    originalID = originalDeclaration.get('id');
    originalStyleSheet = $.styleSheets(store.getState()).get(0);

    assertDeclaration(
      t,
      originalDeclaration,
      originalID,
      'width',
      '50px',
      'The declaration starts out with the correct initial values.'
    );

    expect(originalStyleSheet.get('text')).toBe(styleSheetText1);
    expect(originalStyleSheet.get('cssStyleSheet').ownerNode.innerHTML).toBe(styleSheetText1);
  });

  tt.test(
    ' - Update a declaration value.',
    co.wrap(function*(t) {
      const updateQueue = $.updateQueue(store.getState());
      store.dispatch(
        actions.setDeclarationValue(updateQueue, originalID, '1000em')
      );

      // Wait for this update queue to be processed
      yield $.updateQueue(store.getState());

      const pageContainerRule = $.ruleFromSelector(
        store.getState(),
        '.page-container > *'
      );
      const widthDeclaration = pageContainerRule.getIn(['declarations', 1]);
      const styleSheet = $.styleSheets(store.getState()).get(0);
      const text = styleSheetText1.replace('width: 50px;', 'width: 1000em;');

      assertDeclaration(
        t,
        widthDeclaration,
        originalID,
        'width',
        '1000em',
        'The declaration value was updated.'
      );

      expect(styleSheet.get('text')).toBe(text);
      expect(styleSheet.get('cssStyleSheet').ownerNode.innerHTML).toBe(text);

      disableMock();
    })
  );

  tt.end();
});
