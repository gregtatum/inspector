function styleSheetFromRule(styleSheets, rule) {
  return styleSheets.find(styleSheet => {
    return styleSheet.get("rules").find(idMatcher(rule.get("id")));
  });
}

function findNextDeclaration(direction, rules, rule, declaration) {
  // The declaration can be undefined if the last searched rule did not have
  // any declarations.
  if (declaration) {
    const nextDeclarationIndex = direction + rule.get("declarations").indexOf(declaration);

    if (nextDeclarationIndex >= 0 && nextDeclarationIndex < rule.get("declarations").size) {
      // This rule had more declarations.
      return {
        rule: rule.get("id"),
        declaration: rule.getIn(["declarations", nextDeclarationIndex, "id"])
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
        rule: nextRule.get("id"),
        declaration: nextDeclaration.get("id")
      };
    }
    // No declarations were found on this rule, start searching the next rule recursively.
    return findNextDeclaration(direction, rules, nextRule);
  }

  // There are no more declarations to be found. Return null.
  return null;
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
  findNextDeclaration,
  getRule,
  getRuleDeclaration,
  styleSheetFromRule,
  getStyleSheetRuleDeclaration,
  getDeclaration,
  idMatcher
};
