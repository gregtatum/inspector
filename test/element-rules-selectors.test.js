const { styleSheetText1, styleSheetText2 } = require('./fixtures/style-sheets');
const { twoStyleSheetsStore } = require('./fixtures/stores');
const $ = require('../src/selectors');
const state = twoStyleSheetsStore().getState();

test('$.styleSheets', () => {
  const styleSheets = $.styleSheets(state);
  expect(styleSheets.size).toBe(2);
  expect(styleSheets.getIn([0, 'text'])).toBe(styleSheetText1);
  expect(styleSheets.getIn([1, 'text'])).toBe(styleSheetText2);
});

test('$.allRules', () => {
  const rules = $.allRules(state);
  expect(rules.size).toBe(5);
  const ruleSelectors = rules.map(r => r.get('selector')).toJS();
  t.deepEquals(
    ruleSelectors,
    ['.page-container', '.page-container > *', '.red-box', '.blue-box', 'body'],
    'The rules follow in the proper order.'
  );
});

test('$.rule', () => {
  const rule = $.rule(state, 'rule-2');
  expect(rule.get('selector')).toBe('.red-box');
  expect(rule.getIn(['declarations', 0, 'name'])).toBe('background-color');
  expect(rule.getIn(['declarations', 0, 'value'])).toBe('#f00');
  expect(rule.get('declarations').size).toBe(1);
});

test('$.styleSheet', () => {
  const styleSheet1 = $.styleSheet(state, 'stylesheet-0');
  expect(styleSheet1.get('text')).toBe(styleSheetText1);
  const styleSheet2 = $.styleSheet(state, 'stylesheet-1');
  expect(styleSheet2.get('text')).toBe(styleSheetText2);
});

test('$.declaration', () => {
  const declaration = $.declaration(
    state,
    'declaration-8',
    'rule-1',
    'stylesheet-0'
  );
  expect(declaration.get('id')).toBe('declaration-8');
  expect(declaration.get('name')).toBe('height');
  expect(declaration.get('value')).toBe('50px');

  const declaration2 = $.declaration(state, 'declaration-8', 'rule-1');
  expect(declaration2).toBe(declaration);

  const declaration3 = $.declaration(state, 'declaration-8');
  expect(declaration3).toBe(declaration);
});

test('$.declarationHeirarchy', () => {
  const { styleSheet, rule, declaration } = $.declarationHeirarchy(
    state,
    'declaration-8'
  );

  expect(styleSheet.get('id')).toBe('stylesheet-0');
  expect(declaration.get('id')).toBe('declaration-8');
  expect(rule.get('id')).toBe('rule-1');
});

test('$.declarationKeyPath', () => {
  const expectedKeyPath = ['styleSheets', 0, 'rules', 1, 'declarations', 2];
  let actualKeyPath = $.declarationKeyPath(
    state,
    'declaration-8',
    'rule-1',
    'stylesheet-0'
  );
  t.deepEquals(
    expectedKeyPath,
    actualKeyPath.toJS(),
    'The key path was fetched when providing the stylesheet, rule and declaration ID.'
  );

  actualKeyPath = $.declarationKeyPath(state, 'declaration-8', 'rule-1');
  t.deepEquals(
    expectedKeyPath,
    actualKeyPath.toJS(),
    'The key path was fetched when providing the rule and declaration ID.'
  );

  actualKeyPath = $.declarationKeyPath(state, 'declaration-8');
  t.deepEquals(
    expectedKeyPath,
    actualKeyPath.toJS(),
    'The key path was fetched when providing the declaration ID.'
  );
});

test('$.styleSheetIndex', () => {
  const styleSheet1 = $.styleSheet(state, 'stylesheet-0');
  const styleSheet2 = $.styleSheet(state, 'stylesheet-1');
  expect($.styleSheetIndex(state, styleSheet1)).toBe(0);
  expect($.styleSheetIndex(state, styleSheet2)).toBe(1);
});
