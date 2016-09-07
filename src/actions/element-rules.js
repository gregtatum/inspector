const {actions} = require('../constants');

function addPageStyleSheet() {
  const styleEl = document.querySelector("#page-style");
  const styleSheet = [...document.styleSheets].find(sheet => sheet.ownerNode === styleEl)
  return addStyleSheet(styleSheet);
}

function addStyleSheet (styleSheet) {
  return { type: actions.ADD_STYLE_SHEET, styleSheet };
}

function setFocusedElement(element) {
  return { type: actions.SET_FOCUSED_ELEMENT, element };
}

function focusOnRedBox() {
  return setFocusedElement(document.querySelector('.page-container .red-box'));
}

function editDeclarationName(rule, declaration) {
  return { type: actions.EDIT_DECLARATION_NAME, rule, declaration };
}

function editDeclarationValue(rule, declaration) {
  return { type: actions.EDIT_DECLARATION_VALUE, rule, declaration };
}

function setDeclarationName(rule, declaration, name) {
  return { type: actions.UPDATE_DECLARATION, rule, declaration, update: {name} };
}

function setDeclarationValue(rule, declaration, value) {
  return { type: actions.UPDATE_DECLARATION, rule, declaration, update: {value} };
}

function stopEditingDeclaration() {
  return { type: actions.STOP_EDITING_DECLARATION };
}

function tabThroughDeclarations(direction) {
  return { type: actions.TAB_THROUGH_DECLARATIONS, direction };
}


module.exports = {
  addPageStyleSheet,
  addStyleSheet,
  setFocusedElement,
  focusOnRedBox,
  editDeclarationName,
  editDeclarationValue,
  stopEditingDeclaration,
  tabThroughDeclarations,
  setDeclarationName,
  setDeclarationValue,
}
