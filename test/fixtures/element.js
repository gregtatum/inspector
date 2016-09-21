const selectorMatcher = (...args) => selector => args.includes(selector);
const matchedSelector1 = ".page-container > *";
const matchedSelector2 = ".red-box";
const matchedSelector3 = "body";

// Define some selector matchers, and see if they are returned.
const mockElement = {
  matches: selectorMatcher(matchedSelector1, matchedSelector2),
  parentElement: {
    matches: selectorMatcher(matchedSelector3)
  }
};

module.exports = {
  matchedSelector1,
  matchedSelector2,
  matchedSelector3,
  mockElement
};
