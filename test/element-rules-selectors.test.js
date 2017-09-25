const { styleSheetText1, styleSheetText2 } = require('./fixtures/style-sheets');
const { twoStyleSheetsStore } = require('./fixtures/stores');
const $ = require('../src/selectors');
const state = twoStyleSheetsStore().getState();

describe('$.styleSheets', function() {
  const styleSheets = $.styleSheets(state);
  it('has two style sheets in the store', function() {
    expect(styleSheets.size).toBe(2);
    expect(styleSheets.getIn([0, 'text'])).toBe(styleSheetText1);
    expect(styleSheets.getIn([1, 'text'])).toBe(styleSheetText2);
  });
});

describe('$.allRules', () => {
  const rules = $.allRules(state);
  it('has five rules in the store', function() {
    expect(rules.size).toBe(5);
  });
  it('has rules in the proper order', function() {
    expect(rules.map(r => r.get('selector')).toJS()).toEqual([
      '.page-container',
      '.page-container > *',
      '.red-box',
      '.blue-box',
      'body',
    ]);
  });
});

describe('$.rule', () => {
  const rule = $.rule(state, 'rule-2');
  it('has a certain shaped rule', function() {
    expect(rule.get('selector')).toBe('.red-box');
    expect(rule.getIn(['declarations', 0, 'name'])).toBe('background-color');
    expect(rule.getIn(['declarations', 0, 'value'])).toBe('#f00');
    expect(rule.get('declarations').size).toBe(1);
  });
});

describe('$.styleSheet', () => {
  it('has some stylesheets', function() {
    const styleSheet1 = $.styleSheet(state, 'stylesheet-0');
    expect(styleSheet1.get('text')).toBe(styleSheetText1);
    const styleSheet2 = $.styleSheet(state, 'stylesheet-1');
    expect(styleSheet2.get('text')).toBe(styleSheetText2);
  });
});

describe('$.declaration', () => {
  it('has some declarations', function() {
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
});

describe('$.declarationHeirarchy', () => {
  it('provides a heirarchy', function() {
    const { styleSheet, rule, declaration } = $.declarationHeirarchy(
      state,
      'declaration-8'
    );

    expect(styleSheet.get('id')).toBe('stylesheet-0');
    expect(declaration.get('id')).toBe('declaration-8');
    expect(rule.get('id')).toBe('rule-1');
  });
});

describe('$.declarationKeyPath', () => {
  const expectedKeyPath = ['styleSheets', 0, 'rules', 1, 'declarations', 2];
  let actualKeyPath = $.declarationKeyPath(
    state,
    'declaration-8',
    'rule-1',
    'stylesheet-0'
  );
  it('The key path was fetched when providing the stylesheet, rule and declaration ID.', () => {
    expect(expectedKeyPath).toEqual(actualKeyPath.toJS());
  });

  it('The key path was fetched when providing the rule and declaration ID.', () => {
    actualKeyPath = $.declarationKeyPath(state, 'declaration-8', 'rule-1');
    expect(expectedKeyPath).toEqual(actualKeyPath.toJS());
  });

  it('The key path was fetched when providing the declaration ID.', () => {
    actualKeyPath = $.declarationKeyPath(state, 'declaration-8');
    expect(expectedKeyPath).toEqual(actualKeyPath.toJS());
  });
});

describe('$.styleSheetIndex', () => {
  it('can be accessed by an index', function() {
    const styleSheet1 = $.styleSheet(state, 'stylesheet-0');
    const styleSheet2 = $.styleSheet(state, 'stylesheet-1');
    expect($.styleSheetIndex(state, styleSheet1)).toBe(0);
    expect($.styleSheetIndex(state, styleSheet2)).toBe(1);
  });
});
