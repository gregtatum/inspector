const {actions} = require("../constants");
const {Map, List, fromJS} = require("immutable");
const {parseStyleSheet, parseOnlyDeclarations} = require("../parser");
const {getStyleSheetID} = require("../utils/ids");
const selectors = require("../selectors");

function addPageStyleSheet() {
  const styleEl = document.querySelector("#page-style");
  const cssStyleSheet = [...document.styleSheets].find(
    sheet => sheet.ownerNode === styleEl);
  return addStyleSheet(cssStyleSheet);
}

function addStyleSheet(cssStyleSheet) {
  // TODO - Handle external stylesheets
  const text = cssStyleSheet.ownerNode.innerText;

  const styleSheet = Map({
    id: getStyleSheetID(),
    rules: fromJS(parseStyleSheet(text)),
    cssStyleSheet,
    text,
  });

  return {type: actions.ADD_STYLE_SHEET, styleSheet};
}

function setFocusedElement(element) {
  return function(dispatch, getState) {
    const rules = selectors.getAllRules(getState());
    const matchedRuleIDs = _matchRules(rules, element)
      // Temporary hack to make the stylesheet in the correct order.
      .reverse();

    return dispatch({
      type: actions.SET_FOCUSED_ELEMENT,
      element,
      matchedRuleIDs
    });
  };
}

function _matchRules(rules, element) {
  if (!element) {
    return List();
  }
  return rules.reduce((matches, rule) => {
    if (rule.condition) {
      return _matchMediaQuery(matches, rule, element);
    }
    return _matchCSSRule(matches, rule, element);
  }, List());
}

function _matchMediaQuery(matches, rule, element) {
  if (window.matchMedia(rule.get("condition"))) {
    const childRules = _matchRules(rule.get("rules"), element);
    if (childRules) {
      return matches.concat(childRules);
    }
  }
  return matches;
}

function _matchCSSRule(matches, rule, element) {
  // Walk up the tree, and see if anything above it matches.
  do {
    if (element.matches(rule.get("selector"))) {
      return matches.push(rule.get("id"));
    }
    element = element.parentElement;
  } while (element);

  return matches;
}

function _findNextDeclaration(direction, rules, rule, declaration) {
  // The declaration can be undefined if the last searched rule did not have
  // any declarations.
  if (declaration) {
    const nextIndex = direction + rule.get("declarations").indexOf(declaration);

    if (nextIndex >= 0 && nextIndex < rule.get("declarations").size) {
      // This rule had more declarations.
      return {
        ruleID: rule.get("id"),
        declarationID: rule.getIn(["declarations", nextIndex, "id"])
      };
    }
  }

  // No more declarations could be found with the current rule, find the next
  // rule and continue searching there.
  const nextRuleIndex = direction + rules.indexOf(rule);

  if (nextRuleIndex >= 0 && nextRuleIndex < rules.size) {
    const nextRule = rules.get(nextRuleIndex);
    const nextDeclarations = nextRule.get("declarations");
    const nextDeclaration = direction === 1
      ? nextDeclarations.get(0)
      : nextDeclarations.get(nextDeclarations.size - 1);

    if (nextDeclaration) {
      return {
        ruleID: nextRule.get("id"),
        declarationID: nextDeclaration.get("id")
      };
    }
    // No declarations were found on this rule, start searching the next rule recursively.
    return _findNextDeclaration(direction, rules, nextRule);
  }

  // There are no more declarations to be found. Return null.
  return null;
}

function focusOnRedBox() {
  return setFocusedElement(document.querySelector(".page-container .red-box"));
}

function editDeclarationName(rule, declaration) {
  return function(dispatch, getState) {
    const keyPath = selectors.getDeclarationKeyPath(
      getState(), declaration.get("id"), rule.get("id"));

    return dispatch({
      type: actions.EDIT_DECLARATION_NAME,
      keyPath
    });
  };
}

function editDeclarationValue(rule, declaration) {
  return function(dispatch, getState) {
    const keyPath = selectors.getDeclarationKeyPath(
      getState(), declaration.get("id"), rule.get("id"));

    return dispatch({
      type: actions.EDIT_DECLARATION_VALUE,
      keyPath
    });
  };
}

function pasteDeclarations(declaration, text) {
  return {type: actions.PASTE_DECLARATIONS, declaration, text};
}

function stopEditingDeclaration() {
  return {type: actions.STOP_EDITING_DECLARATION};
}

function tabThroughDeclarations(direction) {
  return function(dispatch, getState) {
    const isEditingName = selectors.getIsEditingName(getState());
    const isEditingValue = selectors.getIsEditingValue(getState());
    const matchedRules = selectors.getMatchedRules(getState());
    const declaration = selectors.getEditingDeclaration(getState());
    const rule = selectors.getEditingRule(getState());
    const type = actions.TAB_THROUGH_DECLARATIONS;

    // Assert that the state is correct for this type of action.
    console.assert(isEditingName !== isEditingValue, "Is editing either name or value.");
    console.assert(Boolean(declaration), "Is editing a declaration.");

    // The declaration won't change, so flip editing the name and value.
    if ((direction === 1 && isEditingName) || (direction === -1 && isEditingValue)) {
      return dispatch({
        type,
        keyPath: selectors.getEditingDeclarationKeyPath(getState()),
        isEditingName: !isEditingName,
        isEditingValue: !isEditingValue,
      });
    }

    // The declaration is different, find the next in the proper direction.
    const next = _findNextDeclaration(direction, matchedRules, rule, declaration);
    const hasNext = Boolean(next);
    const keyPath = hasNext
      ? selectors.getDeclarationKeyPath(getState(), next.declarationID, next.ruleID)
      : null;

    return dispatch({
      type,
      keyPath: keyPath,
      isEditingName: !isEditingName && hasNext,
      isEditingValue: !isEditingValue && hasNext,
    });
  };
}

function setDeclarationName(updateQueue, declaration, value) {
  return function(dispatch) {
    updateDeclaration(dispatch, updateQueue, declaration.get("id"), "name", value);
  };
}

function setDeclarationValue(updateQueue, declaration, value) {
  return function(dispatch) {
    updateDeclaration(dispatch, updateQueue, declaration.get("id"), "value", value);
  };
}

function updateDeclaration(dispatch, updateQueue, declarationID, key, value) {
  const nextQueue = updateQueue.then(
    () => {
      dispatch({type: actions.UPDATE_DECLARATION, declarationID, key, value});
    },
    (error) => {
      console.error("Update declaration promise rejected", error);
    }
  );

  dispatch({type: actions.ADD_TO_UPDATE_QUEUE, updateQueue: nextQueue});
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
};
