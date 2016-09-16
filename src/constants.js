const actions = Object.freeze({
  SET_FOCUSED_ELEMENT: "set-focused-element",
  ADD_STYLE_SHEET: "add-style-sheet",
  EDIT_DECLARATION_NAME: "edit-declaration-name",
  EDIT_DECLARATION_VALUE: "edit-declaration-value",
  STOP_EDITING_DECLARATION: "stop-editing-declaration",
  TAB_THROUGH_DECLARATIONS: "tab-through-declarations",
  UPDATE_DECLARATION: "update-declaration",
  ADD_TO_UPDATE_QUEUE: "add-to-update-queue",
  UPDATE_STYLESHEET: "update-stylesheet",
  PASTE_DECLARATIONS: "paste-declarations"
});

module.exports = {actions};
