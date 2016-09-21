const {actions} = require("../constants");
const {List, Map} = require("immutable");

const handlers = {};

const DEFAULT_STATE = Map({
  // DOMNode
  element: null,
  // [ Rule, ... ]
  matchedRuleIDs: List(),
  // [ StyleSheet, ... ]
  styleSheets: List(),
  // { style, rule, declaration }
  editingDeclarationKeyPath: null,
  isEditingName: false,
  isEditingValue: false,
  updateQueue: Promise.resolve()
});

handlers[actions.EDIT_DECLARATION_NAME] = function(state, action) {
  return state.merge({
    editingDeclarationKeyPath: action.keyPath,
    isEditingName: true,
    isEditingValue: false
  });
};

handlers[actions.EDIT_DECLARATION_VALUE] = function(state, action) {
  return state.merge({
    editingDeclarationKeyPath: action.keyPath,
    isEditingName: false,
    isEditingValue: true
  });
};

handlers[actions.STOP_EDITING_DECLARATION] = function(state, action) {
  return state.merge({
    editingDeclarationKeyPath: null,
    isEditingName: false,
    isEditingValue: false
  });
};

handlers[actions.UPDATE_DECLARATION] = function(state, action) {
  // Set the new list of stylesheets.
  const {styleSheetIndex, text, rules, cssStyleSheet} = action;
  return state.mergeIn(
    ["styleSheets", styleSheetIndex],
    {text, rules, cssStyleSheet}
  );
};

handlers[actions.ADD_TO_UPDATE_QUEUE] = function(state, action) {
  const {updateQueue} = action;
  return state.merge({updateQueue});
};

handlers[actions.REPLACE_STYLESHEET_RULES] = function(state, action) {
  return state.setIn(
    ["styleSheets", action.styleSheetIndex, "rules"],
    action.rules
  );
};

handlers[actions.ADD_STYLE_SHEET] = function(state, action) {
  return state.updateIn(
    ["styleSheets"],
    styleSheets => styleSheets.push(action.styleSheet)
  );
};

handlers[actions.SET_FOCUSED_ELEMENT] = function(state, action) {
  const {element, matchedRuleIDs} = action;
  return state.merge({element, matchedRuleIDs});
};

handlers[actions.TAB_THROUGH_DECLARATIONS] = function(state, action) {
  return state.merge({
    isEditingName: action.isEditingName,
    isEditingValue: action.isEditingValue,
    editingDeclarationKeyPath: action.keyPath
  });
};

module.exports = function update(state = DEFAULT_STATE, action) {
  const handle = handlers[action.type];
  if (handle) {
    return handle(state, action);
  }
  return state;
};
