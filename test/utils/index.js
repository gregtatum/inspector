function CSSStyleSheet(innerHTML) {
  this.ownerNode = {innerHTML};
}

function mockCssStyleSheet(text) {
  return new CSSStyleSheet(text);
}

// Helper to assert a declaration looks like we want.
function assertDeclaration(t, declaration, id, name, value, preamble) {
  t.equal(declaration.get("id"), id,
    `${preamble} The id matches the initial id.`);
  t.equal(declaration.get("name"), name,
    `${preamble} The name matches "${name}".`);
  t.equal(declaration.get("value"), value,
    `${preamble} The value matches "${value}".`);
}

module.exports = {mockCssStyleSheet, assertDeclaration};
