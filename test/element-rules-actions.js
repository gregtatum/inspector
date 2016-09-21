const co = require("co");
const test = require("tape");
const $ = require("../src/selectors");
const actions = require("../src/actions/element-rules");
const dom = require("../src/utils/dom");
const {assertDeclaration} = require("./utils");
const {twoStyleSheetsStore, twoStyleSheetsMock, blankStore} = require("./fixtures/stores");
const {
  matchedSelector1,
  matchedSelector2,
  matchedSelector3,
  mockElement
} = require("./fixtures/element");
const {
  styleSheetText1,
  styleSheetText2,
  mockCssStyleSheet1,
  mockCssStyleSheet2,
} = require("./fixtures/style-sheets");

test("actions.addStyleSheet", t => {
  const store = blankStore();
  store.dispatch(actions.addStyleSheet(mockCssStyleSheet1));
  store.dispatch(actions.addStyleSheet(mockCssStyleSheet2));

  const styleSheets = $.getStyleSheets(store.getState());

  t.equal(styleSheets.size, 2, "Found 2 stylesheets");
  t.equal(styleSheets.getIn([0, "text"]), styleSheetText1,
          "StyleSheet 1 has the proper text.");
  t.equal(styleSheets.getIn([1, "text"]), styleSheetText2,
          "StyleSheet 2 has the proper text.");
  t.end();
});

test("actions.setFocusedElement", t => {
  const store = twoStyleSheetsStore();
  store.dispatch(actions.setFocusedElement(mockElement));

  const rules = $.getMatchedRules(store.getState());
  const selectorNames = rules.map(rule => rule.get("selector")).toJS();

  t.assert(selectorNames.includes(matchedSelector1), "First selector was matched.");
  t.assert(selectorNames.includes(matchedSelector2), "Second selector was matched.");
  t.assert(selectorNames.includes(matchedSelector3), "Third selector was matched.");
  t.equal(selectorNames.length, 3, "Three selectors were found.");
  t.end();
});

test("actions.editDeclarationName/editDeclarationValue/stopEditingDeclaration", t => {
  const store = twoStyleSheetsStore();
  let state;

  store.dispatch(actions.setFocusedElement(mockElement));
  state = store.getState();

  const declarationID = $.getMatchedRules(state)
    .getIn([0, "declarations", 0, "id"]);

  const {
    styleSheet,
    rule,
    declaration
  } = $.getDeclarationHeirarchy(state, declarationID);

  // The initial state is not being edited.
  t.equal($.getIsEditingName(state), false,
    "The name is not being editing");
  t.equal($.getIsEditingValue(state), false,
    "The value is not being editing");
  t.is($.getEditingDeclaration(state), null,
    "No declaration is being editing");
  t.is($.getEditingRule(state), null,
    "No rule is being editing");
  t.is($.getEditingStyleSheet(state), null,
    "No styleSheet is being editing");

  store.dispatch(actions.editDeclarationName(rule, declaration));
  state = store.getState();

  // Now edit the name.
  t.equal($.getIsEditingName(state), true,
    "The name is not being editing");
  t.equal($.getIsEditingValue(state), false,
    "The value is not being editing");
  t.is($.getEditingDeclaration(state), declaration,
    "No declaration is being editing");
  t.is($.getEditingRule(state), rule,
    "No rule is being editing");
  t.is($.getEditingStyleSheet(state), styleSheet,
    "No styleSheet is being editing");

  store.dispatch(actions.editDeclarationValue(rule, declaration));
  state = store.getState();

  // Now edit the value.
  t.equal($.getIsEditingName(state), false,
    "The name is not being editing");
  t.equal($.getIsEditingValue(state), true,
    "The value is not being editing");
  t.is($.getEditingDeclaration(state), declaration,
    "No declaration is being editing");
  t.is($.getEditingRule(state), rule,
    "No rule is being editing");
  t.is($.getEditingStyleSheet(state), styleSheet,
    "No styleSheet is being editing");

  store.dispatch(actions.stopEditingDeclaration());
  state = store.getState();

  // Back to not editing anything.
  t.equal($.getIsEditingName(state), false,
    "The name is not being editing");
  t.equal($.getIsEditingValue(state), false,
    "The value is not being editing");
  t.is($.getEditingDeclaration(state), null,
    "No declaration is being editing");
  t.is($.getEditingRule(state), null,
    "No rule is being editing");
  t.is($.getEditingStyleSheet(state), null,
    "No styleSheet is being editing");
  t.end();
});

test("actions.setDeclarationName - basic rewriting", t => {
  // Setup the state we want.
  const store = twoStyleSheetsStore();
  const {disableMock} = twoStyleSheetsMock(store);
  let originalID, originalRule, originalDeclaration;

  t.test(" - The declaration is in an initial state.", t => {
    originalRule = $.findRuleBySelector(store.getState(), ".page-container > *");
    originalDeclaration = originalRule.getIn(["declarations", 1]);
    originalID = originalDeclaration.get("id");
    originalStyleSheet = $.getStyleSheets(store.getState()).get(0);

    assertDeclaration(t, originalDeclaration, originalID, "width", "50px",
      "The declaration starts out with the correct initial values.");

    t.equals(originalStyleSheet.get("text"), styleSheetText1,
      "The original stylesheet stored text is unaltered.");
    t.equals(originalStyleSheet.get("cssStyleSheet").ownerNode.innerHTML, styleSheetText1,
      "The original stylesheet element's contents are unaltered.");

    t.end();
  });

  t.test(" - Update a declaration value.", co.wrap(function*(t) {
    let updateQueue = $.getUpdateQueue(store.getState());
    store.dispatch(actions.setDeclarationValue(updateQueue, originalID, "1000em"));

    // Wait for this update queue to be processed
    yield $.getUpdateQueue(store.getState());

    const pageContainerRule = $.findRuleBySelector(store.getState(), ".page-container > *");
    const widthDeclaration = pageContainerRule.getIn(["declarations", 1]);
    const styleSheet = $.getStyleSheets(store.getState()).get(0);
    const text = styleSheetText1.replace("width: 50px;", "width: 1000em;");

    assertDeclaration(t, widthDeclaration, originalID, "width", "1000em",
      "The declaration value was updated.");

    t.equals(styleSheet.get("text"), text,
      "The stylesheet stored text was altered.");
    t.equals(styleSheet.get("cssStyleSheet").ownerNode.innerHTML, text,
      "The original stylesheet element's contents were altered.");

    disableMock();
    t.end();
  }));

  t.end();
});
