function styleSheetFromRule(styleSheets, rule) {
  return styleSheets.find(styleSheet => {
    return styleSheet.rules.find(ruleB => ruleB.id === rule.id);
  });
}

function findNextDeclaration(direction, rules, rule, declaration) {
  // The declaration can be undefined if the last searched rule did not have
  // any declarations.
  if (declaration) {
    const nextDeclarationIndex = direction + rule.declarations.indexOf(declaration);

    if (nextDeclarationIndex >= 0 && nextDeclarationIndex < rule.declarations.length) {
      // This rule had more declarations.
      return {
        rule: rule.id,
        declaration: rule.declarations[nextDeclarationIndex].id
      }
    }
  }

  // No more declarations could be found with the current rule, find the next
  // rule and continue searching there.
  const nextRuleIndex = direction + rules.indexOf(rule);

  if (nextRuleIndex >= 0 && nextRuleIndex < rules.length) {
    const nextRule = rules[nextRuleIndex];
    const nextDeclaration = direction === 1
      ? nextRule.declarations[0]
      : nextRule.declarations[nextRule.declarations.length - 1];

    if (nextDeclaration) {
      return {
        rule: nextRule.id,
        declaration: nextDeclaration.id
      }
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
    const rule = styleSheet.rules.find(rule => rule.id === ruleID)
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
  const {
    rule: ruleID,
    declaration: declarationID
  } = ruleDeclarationIDs;

  const rule = getRule(styleSheets, ruleID);
  const declaration = rule.declarations.find(declaration => declaration.id === declarationID);

  if (!declaration) {
    throw new Error(`Declaration could not be found for "${declarationID}".`);
  }
  return {rule, declaration};
}

module.exports = {
  findNextDeclaration,
  getRule,
  getRuleDeclaration,
  styleSheetFromRule,
}
