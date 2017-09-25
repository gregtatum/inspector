const { getCSSLexer } = require('../src/parser/css-lexer');
const { skipWhitespace } = require('../src/parser/parsing-utils');
const {
  parseSingleRule,
  parseDeclarations,
  parseSingleDeclaration,
  // TODO:
  // parseStyleSheet,
  // parseRules,
  // parseMediaQuery,
  // parseMediaQueryCondition,
} = require('../src/parser/');

describe('parseSingleRule', () => {
  const text = '.red-box { margin-top: 0px; }';
  const lexer = getCSSLexer(text);
  const token = lexer.nextToken();
  const rule = parseSingleRule(token, lexer);

  ruleMatches(rule, {
    selector: '.red-box',
    whitespaceAfterSelector: ' ',
    whitespaceBeforeSelector: '',
    declarations: [
      {
        text: 'margin-top: 0px;',
        name: 'margin-top',
        value: '0px',
      },
    ],
  });
});

describe('parseSingleRule', () => {
  const text = `
    .red-box {
      margin-top: 0px;
    }
  `;
  const lexer = getCSSLexer(text);
  const token = lexer.nextToken();
  const rule = parseSingleRule(token, lexer);

  ruleMatches(rule, {
    selector: '.red-box',
    whitespaceAfterSelector: ' ',
    whitespaceBeforeSelector: '\n    ',
    declarations: [
      {
        text: 'margin-top: 0px;',
        name: 'margin-top',
        value: '0px',
      },
    ],
  });
});

describe("parseSingleDeclaration - 'margin:;'", () => {
  const text = 'margin:;';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: text.trim(),
    name: 'margin',
    value: '',
    whitespaceBeforeName: '',
    whitespaceAfterName: '',
    whitespaceBeforeValue: '',
    whitespaceAfterValue: '',
  });
});

describe("parseSingleDeclaration - ' margin  :   ;    '", () => {
  const text = ' margin  :   ;    ';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: text.trim(),
    name: 'margin',
    value: '',
    whitespaceBeforeName: ' ',
    whitespaceAfterName: '  ',
    whitespaceBeforeValue: '   ',
    whitespaceAfterValue: '',
  });
});

describe("parseSingleDeclaration - 'margin:'", () => {
  const text = 'margin:';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: text.trim(),
    name: 'margin',
    value: '',
    whitespaceBeforeName: '',
    whitespaceAfterName: '',
    whitespaceBeforeValue: '',
    whitespaceAfterValue: '',
  });
});

describe("parseSingleDeclaration - 'margin:1em'", () => {
  const text = 'margin:1em';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: text.trim(),
    name: 'margin',
    value: '1em',
    whitespaceBeforeName: '',
    whitespaceAfterName: '',
    whitespaceBeforeValue: '',
    whitespaceAfterValue: '',
  });
});

describe("parseSingleDeclaration - 'margin:1em'", () => {
  const text = 'margin:1em   ;';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: text.trim(),
    name: 'margin',
    value: '1em',
    whitespaceBeforeName: '',
    whitespaceAfterName: '',
    whitespaceBeforeValue: '',
    whitespaceAfterValue: '   ',
  });
});

describe("parseSingleDeclaration - 'margin:1em'", () => {
  const text = 'margin;1em:';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  expect(declaration).toBe(null);
});

describe("parseSingleDeclaration - 'margin:}'", () => {
  const text = 'margin:}';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: 'margin:',
    name: 'margin',
    value: '',
    whitespaceBeforeName: '',
    whitespaceAfterName: '',
    whitespaceBeforeValue: '',
    whitespaceAfterValue: '',
  });
});

describe('parseSingleDeclaration - Value with spaces.', () => {
  const text = ' margin-top  :   0px    ;';
  const lexer = getCSSLexer(' margin-top  :   0px    ;');
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: text.trim(),
    name: 'margin-top',
    value: '0px',
    whitespaceBeforeName: ' ',
    whitespaceAfterName: '  ',
    whitespaceBeforeValue: '   ',
    whitespaceAfterValue: '    ',
  });
});

describe('parseSingleDeclaration - " margin-top  :   0px    ;"', () => {
  const text = ' margin-top  :   0px    ;';
  const lexer = getCSSLexer(' margin-top  :   0px    ;');
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: text.trim(),
    name: 'margin-top',
    value: '0px',
    whitespaceBeforeName: ' ',
    whitespaceAfterName: '  ',
    whitespaceBeforeValue: '   ',
    whitespaceAfterValue: '    ',
  });
});

describe('parseSingleDeclaration - "margin:0px 1em"', () => {
  const text = 'margin: 0px 1em';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: text.trim(),
    name: 'margin',
    value: '0px 1em',
    whitespaceBeforeName: '',
    whitespaceAfterName: '',
    whitespaceBeforeValue: ' ',
    whitespaceAfterValue: '',
  });
});

describe('parseSingleDeclaration - "margin:0px 1em }"', () => {
  const text = 'margin: 0px 1em }';
  const lexer = getCSSLexer(text);
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(declaration, {
    text: 'margin: 0px 1em',
    name: 'margin',
    value: '0px 1em',
    whitespaceBeforeName: '',
    whitespaceAfterName: '',
    whitespaceBeforeValue: ' ',
    whitespaceAfterValue: '',
  });
});

describe('parseSingleDeclaration - Invalid value', () => {
  const lexer = getCSSLexer('margin0px 1em; }');
  const { token, whitespaceToken } = skipWhitespace(lexer);
  const { declaration } = parseSingleDeclaration(token, whitespaceToken, lexer);

  expect(declaration).toBe(null);
});

describe('parseDeclarations', () => {
  const { declarations } = parseDeclarations(
    getCSSLexer(`
    margin: 100px;
    background-image: url(https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg);
    transform: translate(10px,100px), scale(0.9)
  `)
  );

  declarationMatches(declarations[0], {
    text: 'margin: 100px;',
    name: 'margin',
    value: '100px',
  });

  declarationMatches(declarations[1], {
    text:
      'background-image: url(https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg);',
    name: 'background-image',
    value: 'url(https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg)',
  });

  declarationMatches(declarations[2], {
    text: 'transform: translate(10px,100px), scale(0.9)',
    name: 'transform',
    value: 'translate(10px,100px), scale(0.9)',
  });
});

function declarationMatches(declaration, obj) {
  expect(true).toBeTruthy();
  expect(declaration.text).toBe(obj.text);
  expect(declaration.name).toBe(obj.name);
  expect(declaration.value).toBe(obj.value);

  if ('whitespaceBeforeName' in obj) {
    expect(declaration.whitespace.beforeName).toBe(obj.whitespaceBeforeName);
    expect(declaration.whitespace.afterName).toBe(obj.whitespaceAfterName);
    expect(declaration.whitespace.beforeValue).toBe(obj.whitespaceBeforeValue);
    expect(declaration.whitespace.afterValue).toBe(obj.whitespaceAfterValue);
  }
}

function ruleMatches(rule, obj) {
  expect(true).toBeTruthy();
  expect(rule.selector).toBe(obj.selector);

  if ('whitespaceBeforeSelector' in obj) {
    expect(rule.whitespace.beforeSelector).toBe(obj.whitespaceBeforeSelector);
    expect(rule.whitespace.afterSelector).toBe(obj.whitespaceAfterSelector);
  }

  if ('declarations' in obj) {
    expect(rule.declarations.length).toBe(obj.declarations.length);

    obj.declarations.forEach((declaration, i) => {
      declarationMatches(rule.declarations[i], declaration);
    });
  }
}
