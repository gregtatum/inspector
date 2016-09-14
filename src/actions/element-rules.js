const {actions} = require('../constants');

function addPageStyleSheet() {
  const styleEl = document.querySelector("#page-style");
  const styleSheet = [...document.styleSheets].find(sheet => sheet.ownerNode === styleEl)
  return addStyleSheet(styleSheet);
}

function addStyleSheet (styleSheet) {
  // TODO - Handle external stylesheets
  const text = styleSheet.ownerNode.innerText;
  return { type: actions.ADD_STYLE_SHEET, styleSheet, text };
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

function pasteDeclarations(declaration, text) {
  return { type: actions.PASTE_DECLARATIONS, declaration, text };
}

// function setDeclarationName(rule, declaration, name) {
//   return { type: actions.UPDATE_DECLARATION, rule, declaration, update: {name} };
// }
//
// function setDeclarationValue(rule, declaration, value) {
//   return { type: actions.UPDATE_DECLARATION, rule, declaration, update: {value} };
// }

function stopEditingDeclaration() {
  return { type: actions.STOP_EDITING_DECLARATION };
}

function tabThroughDeclarations(direction) {
  return { type: actions.TAB_THROUGH_DECLARATIONS, direction };
}

function setDeclarationName(updateQueue, declaration, value) {
  return function(dispatch) {
    updateDeclaration(dispatch, updateQueue, declaration.id, "name", value)
  }
}

function setDeclarationValue(updateQueue, declaration, value) {
  return function(dispatch) {
    updateDeclaration(dispatch, updateQueue, declaration.id, "value", value)
  }
}

function updateDeclaration(dispatch, updateQueue, declarationID, key, value) {
  const nextQueue = updateQueue.then(
    () => {
      dispatch({ type: actions.UPDATE_DECLARATION, declarationID, key, value });
    },
    (error) => {
      console.error("Update declaration promise rejected", error);
    }
  );

  dispatch({ type: actions.ADD_TO_UPDATE_QUEUE, updateQueue: nextQueue });
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
  pasteDeclarations,
}
