const co = require("co");
const test = require("tape");
const $ = require("../src/selectors");
const actions = require("../src/actions/element-rules");
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

  const styleSheets = $.styleSheets(store.getState());

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

  const rules = $.matchedRules(store.getState());
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

  const declarationID = $.matchedRules(state)
    .getIn([0, "declarations", 0, "id"]);

  const {
    styleSheet,
    rule,
    declaration
  } = $.declarationHeirarchy(state, declarationID);

  // The initial state is not being edited.
  t.equal($.isEditingName(state), false,
    "The name is not being editing");
  t.equal($.isEditingValue(state), false,
    "The value is not being editing");
  t.is($.editingDeclaration(state), null,
    "No declaration is being editing");
  t.is($.editingRule(state), null,
    "No rule is being editing");
  t.is($.editingStyleSheet(state), null,
    "No styleSheet is being editing");

  store.dispatch(actions.editDeclarationName(rule, declaration));
  state = store.getState();

  // Now edit the name.
  t.equal($.isEditingName(state), true,
    "The name is not being editing");
  t.equal($.isEditingValue(state), false,
    "The value is not being editing");
  t.is($.editingDeclaration(state), declaration,
    "No declaration is being editing");
  t.is($.editingRule(state), rule,
    "No rule is being editing");
  t.is($.editingStyleSheet(state), styleSheet,
    "No styleSheet is being editing");

  store.dispatch(actions.editDeclarationValue(rule, declaration));
  state = store.getState();

  // Now edit the value.
  t.equal($.isEditingName(state), false,
    "The name is not being editing");
  t.equal($.isEditingValue(state), true,
    "The value is not being editing");
  t.is($.editingDeclaration(state), declaration,
    "No declaration is being editing");
  t.is($.editingRule(state), rule,
    "No rule is being editing");
  t.is($.editingStyleSheet(state), styleSheet,
    "No styleSheet is being editing");

  store.dispatch(actions.stopEditingDeclaration());
  state = store.getState();

  // Back to not editing anything.
  t.equal($.isEditingName(state), false,
    "The name is not being editing");
  t.equal($.isEditingValue(state), false,
    "The value is not being editing");
  t.is($.editingDeclaration(state), null,
    "No declaration is being editing");
  t.is($.editingRule(state), null,
    "No rule is being editing");
  t.is($.editingStyleSheet(state), null,
    "No styleSheet is being editing");
  t.end();
});

test("actions.setDeclarationName - basic rewriting", tt => {
  // Setup the state we want.
  const store = twoStyleSheetsStore();
  const {disableMock} = twoStyleSheetsMock(store);
  let originalID, originalRule, originalDeclaration, originalStyleSheet;

  tt.test(" - The declaration is in an initial state.", t => {
    originalRule = $.ruleFromSelector(store.getState(), ".page-container > *");
    originalDeclaration = originalRule.getIn(["declarations", 1]);
    originalID = originalDeclaration.get("id");
    originalStyleSheet = $.styleSheets(store.getState()).get(0);

    assertDeclaration(t, originalDeclaration, originalID, "width", "50px",
      "The declaration starts out with the correct initial values.");

    t.equals(originalStyleSheet.get("text"), styleSheetText1,
      "The original stylesheet stored text is unaltered.");
    t.equals(originalStyleSheet.get("cssStyleSheet").ownerNode.innerHTML, styleSheetText1,
      "The original stylesheet element's contents are unaltered.");

    t.end();
  });

  tt.test(" - Update a declaration value.", co.wrap(function*(t) {
    let updateQueue = $.updateQueue(store.getState());
    store.dispatch(actions.setDeclarationValue(updateQueue, originalID, "1000em"));

    // Wait for this update queue to be processed
    yield $.updateQueue(store.getState());

    const pageContainerRule = $.ruleFromSelector(
      store.getState(), ".page-container > *");
    const widthDeclaration = pageContainerRule.getIn(["declarations", 1]);
    const styleSheet = $.styleSheets(store.getState()).get(0);
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

  tt.end();
});
