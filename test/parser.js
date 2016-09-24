const test = require("tape");
const {getCSSLexer} = require("../src/parser/css-lexer");
const {skipWhitespace} = require("../src/parser/parsing-utils");
const {
  parseSingleRule,
  parseDeclarations,
  parseSingleDeclaration,
  // TODO:
  // parseStyleSheet,
  // parseRules,
  // parseMediaQuery,
  // parseMediaQueryCondition,
} = require("../src/parser/");

test("parseSingleRule", t => {
  const text = ".red-box { margin-top: 0px; }";
  const lexer = getCSSLexer(text);
  const token = lexer.nextToken();
  const rule = parseSingleRule(token, lexer);

  ruleMatches(t, rule, {
    selector: ".red-box",
    whitespaceAfterSelector: " ",
    whitespaceBeforeSelector: "",
    declarations: [
      {
        text: "margin-top: 0px;",
        name: "margin-top",
        value: "0px"
      }
    ]
  });
  t.end();
});

test("parseSingleRule", t => {
  const text = `
    .red-box {
      margin-top: 0px;
    }
  `;
  const lexer = getCSSLexer(text);
  const token = lexer.nextToken();
  const rule = parseSingleRule(token, lexer);

  ruleMatches(t, rule, {
    selector: ".red-box",
    whitespaceAfterSelector: " ",
    whitespaceBeforeSelector: "\n    ",
    declarations: [
      {
        text: "margin-top: 0px;",
        name: "margin-top",
        value: "0px"
      }
    ]
  });

  t.end();
});

test("parseSingleDeclaration - 'margin:;'", t => {
  const text = "margin:;";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: text.trim(),
    name: "margin",
    value: "",
    whitespaceBeforeName: "",
    whitespaceAfterName: "",
    whitespaceBeforeValue: "",
    whitespaceAfterValue: "",
  });
  t.end();
});

test("parseSingleDeclaration - ' margin  :   ;    '", t => {
  const text = " margin  :   ;    ";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: text.trim(),
    name: "margin",
    value: "",
    whitespaceBeforeName: " ",
    whitespaceAfterName: "  ",
    whitespaceBeforeValue: "   ",
    whitespaceAfterValue: "",
  });

  t.end();
});

test("parseSingleDeclaration - 'margin:'", t => {
  const text = "margin:";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: text.trim(),
    name: "margin",
    value: "",
    whitespaceBeforeName: "",
    whitespaceAfterName: "",
    whitespaceBeforeValue: "",
    whitespaceAfterValue: "",
  });
  t.end();
});

test("parseSingleDeclaration - 'margin:1em'", t => {
  const text = "margin:1em";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: text.trim(),
    name: "margin",
    value: "1em",
    whitespaceBeforeName: "",
    whitespaceAfterName: "",
    whitespaceBeforeValue: "",
    whitespaceAfterValue: "",
  });
  t.end();
});

test("parseSingleDeclaration - 'margin:1em'", t => {
  const text = "margin:1em   ;";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: text.trim(),
    name: "margin",
    value: "1em",
    whitespaceBeforeName: "",
    whitespaceAfterName: "",
    whitespaceBeforeValue: "",
    whitespaceAfterValue: "   ",
  });
  t.end();
});

test("parseSingleDeclaration - 'margin:1em'", t => {
  const text = "margin;1em:";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  t.equal(declaration, null, "Invalid declarations return null");
  t.end();
});

test("parseSingleDeclaration - 'margin:}'", t => {
  const text = "margin:}";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: "margin:",
    name: "margin",
    value: "",
    whitespaceBeforeName: "",
    whitespaceAfterName: "",
    whitespaceBeforeValue: "",
    whitespaceAfterValue: "",
  });
  t.end();
});

test("parseSingleDeclaration - Value with spaces.", t => {
  const text = " margin-top  :   0px    ;";
  const lexer = getCSSLexer(" margin-top  :   0px    ;");
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: text.trim(),
    name: "margin-top",
    value: "0px",
    whitespaceBeforeName: " ",
    whitespaceAfterName: "  ",
    whitespaceBeforeValue: "   ",
    whitespaceAfterValue: "    ",
  });
  t.end();
});

test("parseSingleDeclaration - \" margin-top  :   0px    ;\"", t => {
  const text = " margin-top  :   0px    ;";
  const lexer = getCSSLexer(" margin-top  :   0px    ;");
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: text.trim(),
    name: "margin-top",
    value: "0px",
    whitespaceBeforeName: " ",
    whitespaceAfterName: "  ",
    whitespaceBeforeValue: "   ",
    whitespaceAfterValue: "    ",
  });
  t.end();
});

test("parseSingleDeclaration - \"margin:0px 1em\"", t => {
  const text = "margin: 0px 1em";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: text.trim(),
    name: "margin",
    value: "0px 1em",
    whitespaceBeforeName: "",
    whitespaceAfterName: "",
    whitespaceBeforeValue: " ",
    whitespaceAfterValue: "",
  });
  t.end();
});

test("parseSingleDeclaration - \"margin:0px 1em }\"", t => {
  const text = "margin: 0px 1em }";
  const lexer = getCSSLexer(text);
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  declarationMatches(t, declaration, {
    text: "margin: 0px 1em",
    name: "margin",
    value: "0px 1em",
    whitespaceBeforeName: "",
    whitespaceAfterName: "",
    whitespaceBeforeValue: " ",
    whitespaceAfterValue: "",
  });
  t.end();
});

test("parseSingleDeclaration - Invalid value", t => {
  const lexer = getCSSLexer("margin0px 1em; }");
  const {token, whitespaceToken} = skipWhitespace(lexer);
  const {declaration} = parseSingleDeclaration(token, whitespaceToken, lexer);

  t.equals(declaration, null,
    "The declaration text captures from the start of the name to the end semicolon.");

  t.end();
});

test("parseDeclarations", t => {
  const {declarations} = parseDeclarations(getCSSLexer(`
    margin: 100px;
    background-image: url(https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg);
    transform: translate(10px,100px), scale(0.9)
  `));

  declarationMatches(t, declarations[0], {
    text: "margin: 100px;",
    name: "margin",
    value: "100px",
  });

  declarationMatches(t, declarations[1], {
    text: "background-image: url(https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg);",
    name: "background-image",
    value: "url(https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg)",
  });

  declarationMatches(t, declarations[2], {
    text: "transform: translate(10px,100px), scale(0.9)",
    name: "transform",
    value: "translate(10px,100px), scale(0.9)",
  });
  t.end();
});

function declarationMatches(t, declaration, obj) {
  t.ok(true, `Testing declaraction "${obj.text}"`);
  t.equals(declaration.text, obj.text,
    "The declaration text captures from the start of the name to the end semicolon.");
  t.equals(declaration.name, obj.name,
    `The name has just the value "${obj.name}".`);
  t.equals(declaration.value, obj.value,
    `Declaration value "${obj.value}" matches.`);

  if ("whitespaceBeforeName" in obj) {
    t.equal(declaration.whitespace.beforeName, obj.whitespaceBeforeName,
      `Whitespace before the name has ${obj.whitespaceBeforeName.length} space(s).`);
    t.equal(declaration.whitespace.afterName, obj.whitespaceAfterName,
      `Whitespace after the name has ${obj.whitespaceAfterName.length} space(s).`);
    t.equal(declaration.whitespace.beforeValue, obj.whitespaceBeforeValue,
      `Whitespace before the value has ${obj.whitespaceBeforeValue.length} space(s).`);
    t.equal(declaration.whitespace.afterValue, obj.whitespaceAfterValue,
      `Whitespace after the value has ${obj.whitespaceAfterValue.length} space(s).`);
  }
}

function ruleMatches(t, rule, obj) {
  t.ok(true, `Testing rule with selector "${obj.selector}"`);
  t.equals(rule.selector, obj.selector,
    "The rule selector is well-formatted.");

  if ("whitespaceBeforeSelector" in obj) {
    t.equal(rule.whitespace.beforeSelector, obj.whitespaceBeforeSelector,
      `Whitespace before the name has ${obj.whitespaceBeforeSelector.length} space(s).`);
    t.equal(rule.whitespace.afterSelector, obj.whitespaceAfterSelector,
      `Whitespace after the name has ${obj.whitespaceAfterSelector.length} space(s).`);
  }

  if ("declarations" in obj) {
    t.equals(rule.declarations.length, obj.declarations.length,
      `The rule has ${obj.declarations.length} declarations.`);

    obj.declarations.forEach((declaration, i) => {
      declarationMatches(t, rule.declarations[i], declaration);
    });
  }
}
