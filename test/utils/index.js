function CSSStyleSheet(innerHTML) {
  this.ownerNode = { innerHTML };
}

function mockCssStyleSheet(text) {
  return new CSSStyleSheet(text);
}

// Helper to assert a declaration looks like we want.
function assertDeclaration(declaration, id, name, value, preamble) {
  it(`${preamble} The id matches the initial id.`, function() {
    expect(declaration.get('id')).toEqual(id);
  });
  it(`${preamble} The name matches "${name}".`, function() {
    expect(declaration.get('name')).toEqual(name);
  });
  it(`${preamble} The value matches "${value}".`, function() {
    expect(declaration.get('value')).toEqual(value);
  });
}

module.exports = { mockCssStyleSheet, assertDeclaration };
