/* Assignment in a while condition makes token parsing easier. */
/* eslint-disable no-cond-assign */
function skipWhitespace(lexer, previousToken) {
  return captureWhitespace(
    previousToken,
    findToken(lexer, previousToken, token => token.tokenType !== "whitespace")
  );
}

function captureWhitespace(startingToken, {token, previousToken}) {
  const foundWhitespace = previousToken && previousToken.tokenType === "whitespace";
  return {
    token,
    previousToken: foundWhitespace ? startingToken : previousToken,
    whitespaceToken: foundWhitespace ? previousToken : null
  };
}

function findSemicolon(lexer, previousToken) {
  return findToken(lexer, previousToken, token => {
    return token.tokenType === "symbol" && token.text === ";";
  });
}

function findDeclarationClose(lexer, previousToken) {
  return findTokenCaptureWhitespace(lexer, previousToken, isDeclarationClose);
}

function isDeclarationClose(token) {
  return !token || token.tokenType === "symbol" && (
    token.text === ";" || token.text === "}"
  );
}

function findTokenCaptureWhitespace(lexer, previousToken, condition) {
  let whitespaceToken;
  while (true) {
    const token = lexer.nextToken();
    if (!token) {
      return {token, previousToken, whitespaceToken};
    }
    if (token.tokenType === "whitespace") {
      whitespaceToken = token;
      continue;
    }
    if (condition(token)) {
      return {token, previousToken, whitespaceToken};
    }
    previousToken = token;
  }
}

function findToken(lexer, previousToken, condition) {
  while (true) {
    const token = lexer.nextToken();
    if (!token) {
      return {token, previousToken};
    }
    if (condition(token)) {
      return {token, previousToken};
    }
    previousToken = token;
  }
}

function getOffsetText(lexer, offset) {
  return lexer.mBuffer.substring(...offset);
}

function getTokenText(lexer, token) {
  if (!token) {
    return "";
  }
  const {startOffset, endOffset} = token;
  return lexer.mBuffer.substring(startOffset, endOffset);
}

function normalizeTokenText(token) {
  switch (token.tokenType) {
    case "id":
      return "#" + token.text;
    case "dimension":
      return token.number + token.text;
    case "number":
      return "" + token.number;
    default:
      return token.text || "";
  }
}

function getSelectorOffset(token) {
  let offsetTweak = 0;
  switch (token.tokenType) {
    case "id":
      return "#" + token.text;
  }
  return [offsetTweak + token.startOffset, token.endOffset];
}

const matchEndingSpacesOrTabs = /[ \t]*$/;
const matchAllSpaces = /^[ ]+$/;
const matchAllTabs = /^[ ]+$/;
const SPACE = " ";
const TWO_SPACES = "    ";
const FOUR_SPACES = "    ";
const TAB = "	";

function determineIndentionStrategy(rule) {
  let selectorIndent = rule.whitespace.beforeSelector.match(matchEndingSpacesOrTabs);
  selectorIndent = selectorIndent ? selectorIndent[0] : "";
  const firstDeclaration = rule.declarations[0];

  let indentationUnit = TWO_SPACES;
  let declarationIndent = indentationUnit;

  if (firstDeclaration) {
    declarationIndent = firstDeclaration.whitespace.beforeName
                                                       .match(matchEndingSpacesOrTabs);
    declarationIndent = declarationIndent ? declarationIndent[0] : "";

    const selectorIsSpaces = matchAllSpaces.test(selectorIndent);
    const selectorIsTabs = matchAllTabs.test(selectorIndent);
    const declarationIsSpaces = matchAllSpaces.test(declarationIndent);
    const declarationIsTabs = matchAllTabs.test(declarationIndent);

    if (selectorIsSpaces && declarationIsSpaces) {
      indentationUnit = indentationDifference(selectorIndent, declarationIndent, SPACE);
    } else if (selectorIsTabs && declarationIsTabs) {
      indentationUnit = indentationDifference(selectorIndent, declarationIndent, TAB);
    } else {
      const unit = declarationIndent[declarationIndent.length - 1] === TAB
        ? TAB
        : SPACE;

      const minimum = unit === TAB ? 1 : 2;

      // Figure out the relative indentation level of the declarations.
      indentationUnit = indentationDifference(
        declarationIndent.replace(TAB, FOUR_SPACES),
        selectorIndent.replace(TAB, FOUR_SPACES),
        unit, minimum);
    }
  }

  return {
    selector: selectorIndent,
    declaration: declarationIndent,
    indentationUnit
  };
}

function indentationDifference(selectorIndent, declarationIndent, unit, minimum = 0) {
  const number = Math.max(minimum, declarationIndent.length - selectorIndent.length);
  return unit.repeat(number);
}

module.exports = {
  skipWhitespace,
  findSemicolon,
  findToken,
  findDeclarationClose,
  getOffsetText,
  getTokenText,
  normalizeTokenText,
  getSelectorOffset,
  isDeclarationClose,
  determineIndentionStrategy
};
