/* Assignment in a while condition makes token parsing easier. */
/* eslint-disable no-cond-assign */

const {getCSSLexer} = require("./css-lexer");

const {
  skipWhitespace,
  findSemicolon,
  findDeclarationClose,
  getOffsetText,
  getTokenText,
  normalizeTokenText,
  isDeclarationClose,
  determineIndentionStrategy,
} = require("./parsing-utils");

const {
  createMediaQueryRule,
  createRule,
  createDeclaration
} = require("./css-structs");

/**
 * This file collects all of the functions that parse a stylesheet's text into a
 * data structure. The data structure is made up of objects from ./css-structs.js.
 */
function parseStyleSheet(styleSheetText) {
  const lexer = getCSSLexer(styleSheetText);
  return parseRules(lexer);
}

function parseRules(lexer) {
  const rules = [];

  while (true) {
    const {token} = skipWhitespace(lexer);
    if (!token) {
      break;
    }

    // This is a media query
    if (token.tokenType === "at") {
      if (token.text == "media") {
        rules.push(parseMediaQuery(token, lexer));
      } else {
        // Skip until the next semi-colon for cases like `@charset "UTF-8";`
        findSemicolon(lexer);
      }
      continue;
    }

    // End of a media query, bail out on this loop.
    if (token.tokenType === "symbol" && token.text === "}") {
      break;
    }

    // A new rule was found
    if (token.tokenType === "ident" ||
        token.tokenType === "id" ||
        token.tokenType === "symbol") {
      rules.push(parseSingleRule(token, lexer));
    }
  }
  return rules;
}

function parseSingleRule(token, lexer) {
  const rule = createRule(token);
  token = parseSelector(token, lexer, rule);

  // Bail out if the next token isn't "{".
  if (!token || token.text !== "{") {
    return token;
  }

  const {declarations} = parseDeclarations(lexer);
  rule.declarations = declarations;
  rule.offsets.text[1] = token.endOffset;
  rule.indentation = determineIndentionStrategy(rule);
  return rule;
}

function parseSelector(token, lexer, rule) {
  let previousToken = token;
  let firstRun = true;
  let whitespaceToken;

  while (true) {
    {
      const results = skipWhitespace(lexer, previousToken);
      whitespaceToken = results.whitespaceToken;
      token = results.token;
    }
    if (!token) {
      break;
    }
    const {tokenType, text, endOffset} = token;

    if (tokenType === "symbol") {
      if (text === "{") {
        rule.whitespace.afterSelector = getTokenText(lexer, whitespaceToken);
        break;
      }
    }
    if (tokenType === "ident" || tokenType === "id" || tokenType === "symbol") {
      const spacer = (
          token.text === "," ||
          token.text === ":" ||
          previousToken.text === ":" ||
          previousToken.text === "." ||
          previousToken.tokenType === "whitespace"
        ) ? "" : " ";
      rule.selector = rule.selector + spacer + normalizeTokenText(token);
      rule.offsets.selector[1] = endOffset;
      if (firstRun) {
        rule.whitespace.beforeSelector = getTokenText(lexer, whitespaceToken);
      }
    }
    previousToken = token;
    firstRun = false;
  }
  // Return the opening bracket token.
  return token;
}

function parseDeclarations(lexer, previousToken) {
  const declarations = [];
  let token, whitespaceToken;

  while (true) {
    {
      const results = skipWhitespace(lexer, previousToken);
      token = results.token;
      whitespaceToken = results.whitespaceToken;
    }
    if (!token || (token.text === "}" && token.tokenType === "symbol")) {
      break;
    }
    if (token.tokenType === "ident") {
      const {
        declaration,
        previousToken: prevToken
      } = parseSingleDeclaration(token, whitespaceToken, lexer);

      if (declaration) {
        declarations.push(declaration);
      } else if (prevToken.text !== "}") {
        // Uh oh, no declaration was found. This means there was probably a problem.
        findDeclarationClose(lexer);
      }
      // TODO, handle comments here
    } else if (token.tokenType === "comment") {
      // TODO
    } else {
      throw new Error("Unable to parse declarations");
    }
  }
  return {declarations, previousToken: token};
}

function parseSingleDeclaration(nameToken, whitespaceBeforeName, lexer) {
  // Create the declaration and set the name and basic info
  const declaration = createDeclaration();

  let {
    token: colon,
    whitespaceToken: whitespaceAfterName
  } = skipWhitespace(lexer);

  // Double check that the colon is correct
  if (colon.tokenType !== "symbol" || colon.text !== ":") {
    return {
      declaration: null,
      previousToken: colon
    };
  }

  const {
    token: valueStartToken,
    whitespaceToken: whitespaceBeforeValue
  } = skipWhitespace(lexer);

  let valueEndToken, valueEndPreviousToken, whitespaceAfterValue;
  if (!isDeclarationClose(valueStartToken)) {
    const result = findDeclarationClose(lexer, valueStartToken);
    valueEndToken = result.token;
    valueEndPreviousToken = result.previousToken;
    whitespaceAfterValue = result.whitespaceToken;
  } else {
    valueEndPreviousToken = colon;
  }

  // This part is a little bit more complicated, but decide where the value's
  // offsets are.
  let valueStartOffset, valueEndOffset;

  // Handle the case of "margin:", the minimum viable declaration to keep.
  if (!valueStartToken) {
    valueStartOffset = colon.endOffset;
    valueEndOffset = colon.endOffset;
  } else if (isDeclarationClose(valueStartToken)) {
    // Handle the cases of "margin:   ;" and "margin:;"
    valueStartOffset = colon.endOffset;
    valueEndOffset = colon.endOffset;
  } else {
    valueStartOffset = valueStartToken.startOffset;

    if (!valueEndToken) {
      // Handle the case of "margin:1em"
      valueEndOffset = valueEndPreviousToken.endOffset;
    } else if (whitespaceAfterValue) {
      // Handle the case of "margin:1em   ;""
      valueEndOffset = whitespaceAfterValue.startOffset;
    } else {
      // Handle the common case of "margin:1em;"
      valueEndOffset = valueEndToken.startOffset;
    }
  }

  // Only capture the ending whitespace if there is a semicolon at the end.
  {
    // Case: "margin: 0em 1em }"}
    const endsInCurly = valueEndToken && valueEndToken.text === "}";
    // Case: "margin: 0em 1em"}
    const noSemicolon = !valueEndToken && valueEndPreviousToken
                        && valueEndPreviousToken.text !== ";";
    if (endsInCurly || noSemicolon) {
      whitespaceAfterValue = null;
    }
  }

  // Figure out the end of the declaration, includes the semi-colon if it's there.
  let textEndOffset;
  if (valueEndToken && valueEndToken.text !== "}") {
    // Handles the case of "margin:1em;"
    textEndOffset = valueEndToken.endOffset;
  } else if (valueStartToken && valueStartToken.text === ";") {
    // Handles the case of "margin:;"
    textEndOffset = valueStartToken.endOffset;
  } else {
    // Handles the case of "margin:1em"
    textEndOffset = valueEndOffset;
  }

  declaration.offsets.text = [nameToken.startOffset, textEndOffset];
  declaration.offsets.name = [nameToken.startOffset, nameToken.endOffset];
  declaration.offsets.value = [valueStartOffset, valueEndOffset];

  declaration.text = getOffsetText(lexer, declaration.offsets.text);
  declaration.name = getOffsetText(lexer, declaration.offsets.name);
  declaration.value = getOffsetText(lexer, declaration.offsets.value);

  declaration.whitespace.beforeName = getTokenText(lexer, whitespaceBeforeName);
  declaration.whitespace.afterName = getTokenText(lexer, whitespaceAfterName);
  declaration.whitespace.beforeValue = getTokenText(lexer, whitespaceBeforeValue);
  declaration.whitespace.afterValue = getTokenText(lexer, whitespaceAfterValue);

  const lastToken = valueEndToken || valueStartToken || colon;

  return {declaration, previousToken: lastToken};
}

function parseMediaQuery(token, lexer) {
  const mediaQueryRule = createMediaQueryRule();
  mediaQueryRule.condition = parseMediaQueryCondition(token, lexer);
  mediaQueryRule.rules = parseRules(lexer);
  return mediaQueryRule;
}

function parseMediaQueryCondition(token, lexer) {
  let condition = "@media";
  let previousToken = token;
  while (token = skipWhitespace(lexer)) {
    const {tokenType, text} = token;

    if (tokenType === "symbol") {
      if (text === "{") {
        break;
      }
    }
    if (tokenType === "ident" || tokenType === "symbol" || tokenType === "dimension") {
      const spacer = (
        token.text === "," ||
        token.text === ":" ||
        token.text === ")" ||
        previousToken.text === "("
      ) ? "" : " ";
      condition += spacer + normalizeTokenText(token);
    }
    previousToken = token;
  }
  return condition;
}

module.exports = {
  parseStyleSheet,
  parseRules,
  parseSingleRule,
  parseSelector,
  parseDeclarations,
  parseSingleDeclaration,
  parseMediaQuery,
  parseMediaQueryCondition,
};
