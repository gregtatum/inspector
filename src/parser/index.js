/* Assignment in a while condition makes token parsing easier. */
/* eslint-disable no-cond-assign */

const {getCSSLexer} = require("./css-lexer");

const {
  skipWhitespace,
  findSemicolon,
  getText,
  normalizeTokenText,
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

function parseOnlyDeclarations(declarationsText) {
  const lexer = getCSSLexer("{" + declarationsText + "}");
  const [declarations] = parseDeclarations(lexer.nextToken(), lexer);
  return declarations;
}

function parseRules(lexer) {
  const rules = [];
  let token;

  while (token = skipWhitespace(lexer)) {
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
  [rule.declarations, token] = parseDeclarations(token, lexer);
  rule.offsets.text[1] = token.endOffset;
  return rule;
}

function parseSelector(token, lexer, rule) {
  let prevToken = token;

  while (token = skipWhitespace(lexer)) {
    const {tokenType, text, endOffset} = token;

    if (tokenType === "symbol") {
      if (text === "{") {
        break;
      }
    }
    if (tokenType === "ident" || tokenType === "id" || tokenType === "symbol") {
      const spacer = (
          token.text === "," ||
          token.text === ":" ||
          prevToken.text === ":" ||
          prevToken.text === "."
        ) ? "" : " ";
      rule.selector += spacer + normalizeTokenText(token);
      rule.offsets.selector[1] = endOffset;
    }
    prevToken = token;
  }
  // Return the opening bracket token.
  return token;
}

function parseDeclarations(token, lexer) {
  const declarations = [];
  // Bail out if the next token isn't "{".
  if (!token || token.text !== "{") {
    return token;
  }
  token = skipWhitespace(lexer);
  while (token.text !== "}" && token.tokenType !== "symbol") {
    if (token.tokenType === "ident") {
      declarations.push(parseSingleDeclaration(token, lexer));
    } else if (token.tokenType === "comment") {
      // TODO
    } else {
      throw new Error("Unable to parse declarations");
    }
    token = skipWhitespace(lexer);
  }
  return [declarations, token];
}

function parseSingleDeclaration(token, lexer) {
  const declaration = createDeclaration(token);
  const colon = skipWhitespace(lexer);
  if (colon.tokenType !== "symbol" || colon.text !== ":") {
    throw new Error("Unable to parse a declaration");
  }
  const valueStart = skipWhitespace(lexer);
  const valueEnd = findSemicolon(lexer);
  if (!valueStart || !valueEnd) {
    throw new Error("Unable to parse declaration");
  }
  declaration.offsets.text[1] = valueEnd.endOffset;
  const valueOffset = declaration.offsets.value;
  valueOffset[0] = valueStart.startOffset;
  valueOffset[1] = valueEnd.startOffset;
  declaration.value = getText(lexer, valueOffset);
  return declaration;
}

function parseMediaQuery(token, lexer) {
  const mediaQueryRule = createMediaQueryRule();
  mediaQueryRule.condition = parseMediaQueryCondition(token, lexer);
  mediaQueryRule.rules = parseRules(lexer);
  return mediaQueryRule;
}

function parseMediaQueryCondition(token, lexer) {
  let condition = "@media";
  let prevToken = token;
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
        prevToken.text === "("
      ) ? "" : " ";
      condition += spacer + normalizeTokenText(token);
    }
    prevToken = token;
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
  parseOnlyDeclarations
};
