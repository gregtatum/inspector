function styleSheetFromRule(styleSheets, rule) {
  return styleSheets.find(styleSheet => {
    return styleSheet.get("rules").find(idMatcher(rule.get("id")));
  });
}

function getRule(styleSheets, ruleID) {
  if (!ruleID) {
    return null;
  }

  for (let styleSheet of styleSheets) {
    const rule = styleSheet.get("rules").find(idMatcher(ruleID));
    if (rule) {
      return rule;
    }
  }
  throw new Error(`Rule could not be found for "${ruleID}".`);
}

function getRuleDeclaration(styleSheets, ruleDeclarationIDs) {
  if (!ruleDeclarationIDs) {
    return null;
  }
  const ruleID = ruleDeclarationIDs.get("rule");
  const declarationID = ruleDeclarationIDs.get("declaration");

  const rule = getRule(styleSheets, ruleID);
  const declaration = rule.get("declarations").find(idMatcher(declarationID));

  if (!declaration) {
    throw new Error(`Declaration could not be found for "${declarationID}".`);
  }
  return {rule, declaration};
}

function getStyleSheetRuleDeclaration(styleSheets, declarationID) {
  for (let styleSheet of styleSheets) {
    for (let rule of styleSheet.get("rules")) {
      for (let declaration of rule.get("declarations")) {
        if (declaration.get("id") === declarationID) {
          return {styleSheet, rule, declaration};
        }
      }
    }
  }
  throw new Error(`The declaration "${declarationID}" could not be found.`);
}

function getDeclaration(styleSheets, declarationID) {
  for (let styleSheet of styleSheets) {
    for (let rule of styleSheet.get("rules")) {
      for (let declaration of rule.get("declarations")) {
        if (declaration.get("id") === declarationID) {
          return declaration;
        }
      }
    }
  }
  throw new Error(`The declaration "${declarationID}" could not be found.`);
}

function idMatcher(id) {
  return item => item.get("id") === id;
}

module.exports = {
  getRule,
  getRuleDeclaration,
  styleSheetFromRule,
  getStyleSheetRuleDeclaration,
  getDeclaration,
  idMatcher
};
