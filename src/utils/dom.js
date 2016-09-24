/**
 * This file provides an interface for interacting with the DOM. In a headless
 * environment the DOM may not be there, so provide a way to test code headlessly
 * that touches the DOM. The enableMock function allows the test to stub out what
 * the DOM should return.
 */

let mock;

/**
 * This enables the mocking behavior of the DOM. It returns the object that
 * can then be faked. Call disableMock() when done.
 * @returns {Object}
 */
function enableMock() {
  mock = {
    styleSheets: [],
    querySelector: () => {},
    matchMedia: () => {}
  };

  return mock;
}

function disableMock() {
  mock = undefined;
}

function functionMocker(object, fnName) {
  return function mockedFunction() {
    if (mock) {
      return mock[fnName].apply(mock, arguments);
    }
    return object[fnName].apply(object, arguments);
  };
}

function getStyleSheets() {
  if (mock) {
    return mock.styleSheets;
  }
  return [...document.styleSheets];
}

const globalDocument = typeof document === "object" ? document : undefined;
const globalWindow = typeof window === "object" ? window : undefined;

module.exports = {
  enableMock,
  disableMock,
  getStyleSheets,
  querySelector: functionMocker(globalDocument, "querySelector"),
  matchMedia: functionMocker(globalWindow, "matchMedia"),
};
