const {actions: constants} = require("../constants");
const {Map, List, fromJS} = require("immutable");
const {parseStyleSheet, parseDeclarations} = require("../parser");
const {getStyleSheetID, idMatcher} = require("../utils/ids");
const dom = require("../utils/dom");
const selectors = require("../selectors");
const actions = {};

actions.addPageStyleSheet = function() {
  const styleEl = dom.querySelector("#page-style");
  const cssStyleSheet = dom.getStyleSheets().find(
    sheet => sheet.ownerNode === styleEl);
  return actions.addStyleSheet(cssStyleSheet);
};

actions.addStyleSheet = function(cssStyleSheet) {
  // TODO - Handle external stylesheets
  const text = cssStyleSheet.ownerNode.innerHTML;

  const styleSheet = Map({
    id: getStyleSheetID(),
    rules: fromJS(parseStyleSheet(text)),
    cssStyleSheet,
    text,
  });

  return {type: constants.ADD_STYLE_SHEET, styleSheet};
};

actions.setFocusedElement = function(element) {
  return function(dispatch, getState) {
    const rules = selectors.getAllRules(getState());
    const matchedRuleIDs = matchRules(rules, element)
      // Temporary hack to make the stylesheet in the correct order.
      .reverse();

    return dispatch({
      type: constants.SET_FOCUSED_ELEMENT,
      element,
      matchedRuleIDs
    });
  };
};

function matchRules(rules, element) {
  if (!element) {
    return List();
  }
  return rules.reduce((matches, rule) => {
    if (rule.condition) {
      return matchMediaQuery(matches, rule, element);
    }
    return matchCSSRule(matches, rule, element);
  }, List());
}

function matchMediaQuery(matches, rule, element) {
  if (dom.matchMedia(rule.get("condition"))) {
    const childRules = matchRules(rule.get("rules"), element);
    if (childRules) {
      return matches.concat(childRules);
    }
  }
  return matches;
}

function matchCSSRule(matches, rule, element) {
  // Walk up the tree, and see if anything above it matches.
  do {
    if (element.matches(rule.get("selector"))) {
      return matches.push(rule.get("id"));
    }
    element = element.parentElement;
  } while (element);

  return matches;
}

function findNextDeclaration(direction, rules, rule, declaration) {
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
    return findNextDeclaration(direction, rules, nextRule);
  }

  // There are no more declarations to be found. Return null.
  return null;
}

actions.focusOnRedBox = function() {
  return actions.setFocusedElement(dom.querySelector(".page-container .red-box"));
};

actions.editDeclarationName = function(rule, declaration) {
  return function(dispatch, getState) {
    const keyPath = selectors.getDeclarationKeyPath(
      getState(), declaration.get("id"), rule.get("id"));

    return dispatch({
      type: constants.EDIT_DECLARATION_NAME,
      keyPath
    });
  };
};

actions.editDeclarationValue = function(rule, declaration) {
  return function(dispatch, getState) {
    const keyPath = selectors.getDeclarationKeyPath(
      getState(), declaration.get("id"), rule.get("id"));

    return dispatch({
      type: constants.EDIT_DECLARATION_VALUE,
      keyPath
    });
  };
};

actions.pasteDeclarations = function(declaration, text) {
  return function(dispatch, getState) {
    // Select everything first to make the update steps easier to understand.
    const state = getState();
    const declarationID = declaration.get("id");
    const textOffset = declaration.getIn(["offsets", "text"]);
    const {
      styleSheet,
      rule
    } = selectors.getDeclarationHeirarchy(getState(), declarationID);
    const rules = styleSheet.get("rules");
    const ruleIndex = rules.indexOf(rule);
    const declarationIndex = rule.get("declarations").indexOf(declaration);

    let newDeclarations;
    let newRules;

    try {
      newDeclarations = fromJS(parseDeclarations(text));
    } catch (e) {
      return state;
    }

    if (newDeclarations.size === 0) {
      return state;
    }

    // Adjust the offsets to be at the same place as the targeted declaration.
    newDeclarations = newDeclarations.map(newDeclaration => {
      return newDeclaration.update("offset", () => {
        return updateOffsets(newDeclaration, 0, textOffset.get(0));
      });
    });

    // Update the rule offsets.
    newRules = updateRuleOffsets(rules, textOffset, text.length)
      // Splice in the new declarations.
      .updateIn([ruleIndex, "declarations"], declarations => {
        return declarations.splice(declarationIndex, 1, ...newDeclarations);
      });

    const styleSheetIndex = selectors.getStyleSheets(getState()).indexOf(styleSheet);

    dispatch({
      type: constants.REPLACE_STYLESHEET_RULES,
      rules: newRules,
      styleSheetIndex
    });
  };
};

actions.stopEditingDeclaration = function() {
  return {type: constants.STOP_EDITING_DECLARATION};
};

actions.tabThroughDeclarations = function(direction) {
  return function(dispatch, getState) {
    const isEditingName = selectors.getIsEditingName(getState());
    const isEditingValue = selectors.getIsEditingValue(getState());
    const matchedRules = selectors.getMatchedRules(getState());
    const declaration = selectors.getEditingDeclaration(getState());
    const rule = selectors.getEditingRule(getState());
    const type = constants.TAB_THROUGH_DECLARATIONS;

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
    const next = findNextDeclaration(direction, matchedRules, rule, declaration);
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
};

actions.setDeclarationName = function(updateQueue, declarationID, value) {
  return actions.updateDeclaration(updateQueue, declarationID, "name", value);
};

actions.setDeclarationValue = function(updateQueue, declarationID, value) {
  return actions.updateDeclaration(updateQueue, declarationID, "value", value);
};

actions.updateDeclaration = function(updateQueue, declarationID, key, value) {
  return function(dispatch, getState) {
    const nextQueue = updateQueue.then(
      () => {
        const {styleSheet, rule, declaration} =
          selectors.getDeclarationHeirarchy(getState(), declarationID);
        const styleSheetIndex = selectors.getStyleSheetIndex(getState(), styleSheet);

        // Update the rules.
        const offset = declaration.get("offsets").get(key);
        const text = replaceTextInOffset(styleSheet.get("text"), value, offset);
        const offsetRules = updateRuleOffsets(styleSheet.get("rules"), offset,
                                              value.length);
        const rules = updateDeclarationInRules(offsetRules, rule.get("id"),
                                               declarationID, key, value);

        // Update the stylesheet.
        // TODO - Handle external stylesheets.
        let cssStyleSheet = styleSheet.get("cssStyleSheet");
        const cssStyleSheetIndex = dom.getStyleSheets().indexOf(cssStyleSheet);
        cssStyleSheet.ownerNode.innerHTML = text;
        cssStyleSheet = dom.getStyleSheets()[cssStyleSheetIndex];

        dispatch({
          type: constants.UPDATE_DECLARATION,
          styleSheetIndex,
          text,
          rules,
          cssStyleSheet,
        });
      },
      (error) => {
        console.error("Update declaration promise rejected", error);
      }
    );

    dispatch({type: constants.ADD_TO_UPDATE_QUEUE, updateQueue: nextQueue});
  };
};

function replaceTextInOffset(text, value, offset) {
  return (
    text.substring(0, offset.get(0)) +
    value +
    text.substring(offset.get(1), text.length)
  );
}

function updateRuleOffsets(rules, originalOffset, length) {
  const start = originalOffset.get(0);
  const end = originalOffset.get(1);
  const changeInLength = length - (end - start);

  return rules.map(rule => rule.merge({
    offsets: updateOffsets(rule, start, changeInLength),
    declarations: rule.get("declarations").map(declaration => {
      return declaration.merge({
        offsets: updateOffsets(declaration, start, changeInLength)
      });
    }),
  }));
}

function updateOffsets(object, start, changeInLength) {
  return object.get("offsets").map(offset => {
    return updateOffset(offset, start, changeInLength);
  });
}

function updateOffset(offset, start, changeInLength) {
  const offset0 = offset.get(0);
  const offset1 = offset.get(1);
  if (offset0 > start || offset1 > start) {
    return List([
      offset0 > start ? offset0 + changeInLength : offset0,
      offset1 > start ? offset1 + changeInLength : offset1
    ]);
  }
  return offset;
}

function updateDeclarationInRules(rules, ruleID, declarationID, key, value) {
  const ruleIndex = rules.findIndex(idMatcher(ruleID));
  const declarationIndex = rules
    .get(ruleIndex)
    .get("declarations")
    .findIndex(idMatcher(declarationID));

  const keyPath = [ruleIndex, "declarations", declarationIndex, key];

  return rules.setIn(keyPath, value);
}

module.exports = actions;
