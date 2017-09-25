const test = require('tape');
const { styleSheetText1, styleSheetText2 } = require('./fixtures/style-sheets');
const { twoStyleSheetsStore } = require('./fixtures/stores');
const $ = require('../src/selectors');
const state = twoStyleSheetsStore().getState();

test('$.styleSheets', t => {
  const styleSheets = $.styleSheets(state);
  t.equal(styleSheets.size, 2, 'Found 2 stylesheets');
  t.equal(
    styleSheets.getIn([0, 'text']),
    styleSheetText1,
    'StyleSheet 1 has the proper text.'
  );
  t.equal(
    styleSheets.getIn([1, 'text']),
    styleSheetText2,
    'StyleSheet 2 has the proper text.'
  );
  t.end();
});

test('$.allRules', t => {
  const rules = $.allRules(state);
  t.equal(rules.size, 5, 'Found 5 rules');
  const ruleSelectors = rules.map(r => r.get('selector')).toJS();
  t.deepEquals(
    ruleSelectors,
    ['.page-container', '.page-container > *', '.red-box', '.blue-box', 'body'],
    'The rules follow in the proper order.'
  );
  t.end();
});

test('$.rule', t => {
  const rule = $.rule(state, 'rule-2');
  t.equal(rule.get('selector'), '.red-box', 'Got the .red-box rule.');
  t.equal(
    rule.getIn(['declarations', 0, 'name']),
    'background-color',
    'The declaration key matches'
  );
  t.equal(
    rule.getIn(['declarations', 0, 'value']),
    '#f00',
    'The declaration value matches'
  );
  t.equal(rule.get('declarations').size, 1, 'The rule only has 1 declaration.');
  t.end();
});

test('$.styleSheet', t => {
  const styleSheet1 = $.styleSheet(state, 'stylesheet-0');
  t.equal(
    styleSheet1.get('text'),
    styleSheetText1,
    'stylesheet-0 was made from styleSheetText1'
  );
  const styleSheet2 = $.styleSheet(state, 'stylesheet-1');
  t.equal(
    styleSheet2.get('text'),
    styleSheetText2,
    'stylesheet-1 was made from styleSheetText2'
  );
  t.end();
});

test('$.declaration', t => {
  const declaration = $.declaration(
    state,
    'declaration-8',
    'rule-1',
    'stylesheet-0'
  );
  t.equal(
    declaration.get('id'),
    'declaration-8',
    'Declaration 8 was fetched when providing the stylesheet, rule and declaration ID.'
  );
  t.equal(
    declaration.get('name'),
    'height',
    "The declaration's name is height."
  );
  t.equal(declaration.get('value'), '50px', "The declaration's value is 50px.");

  const declaration2 = $.declaration(state, 'declaration-8', 'rule-1');
  t.equal(
    declaration2,
    declaration,
    'Declaration 8 was fetched when providing the rule and declaration ID.'
  );

  const declaration3 = $.declaration(state, 'declaration-8');
  t.equal(
    declaration3,
    declaration,
    'Declaration 8 was fetched when providing the declaration ID.'
  );

  t.end();
});

test('$.declarationHeirarchy', t => {
  const { styleSheet, rule, declaration } = $.declarationHeirarchy(
    state,
    'declaration-8'
  );

  t.equal(styleSheet.get('id'), 'stylesheet-0', 'Fetched the stylesheet.');
  t.equal(declaration.get('id'), 'declaration-8', 'Fetched the declaration.');
  t.equal(rule.get('id'), 'rule-1', 'Fetched the rule.');
  t.end();
});

test('$.declarationKeyPath', t => {
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

  t.end();
});

test('$.styleSheetIndex', t => {
  const styleSheet1 = $.styleSheet(state, 'stylesheet-0');
  const styleSheet2 = $.styleSheet(state, 'stylesheet-1');
  t.equals(
    $.styleSheetIndex(state, styleSheet1),
    0,
    'The first stylesheet has index 0'
  );
  t.equals(
    $.styleSheetIndex(state, styleSheet2),
    1,
    'The second stylesheet has index 1'
  );
  t.end();
});
