function skipWhitespace(lexer) {
  return findToken(lexer, token => token.tokenType !== "whitespace");
}

function findSemicolon(lexer) {
  return findToken(lexer, token => token.tokenType === "symbol" && token.text === ";")
}

function findToken(lexer, condition) {
  while(token = lexer.nextToken()) {
    if (condition(token)) {
      return token;
    }
  }
  return undefined;
}

function getText(lexer, offset) {
  return lexer.mBuffer.substring(...offset)
}

function normalizeTokenText(token) {
  switch (token.tokenType) {
    case "id":
      return "#" + token.text;
      break;
    case "dimension":
      return token.number + token.text;
    case "number":
      return "" + token.number;
    default:
      return token.text;
  }
}

function getSelectorOffset(token) {
  let offsetTweak = 0;
  switch (token.tokenType) {
    case "id":
      return "#" + token.text;
      break;
  }
  return [offsetTweak + token.startOffset, token.endOffset]
}

module.exports = {
  skipWhitespace,
  findSemicolon,
  findToken,
  getText,
  normalizeTokenText,
  getSelectorOffset
}
