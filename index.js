const parseStylesheet = require('./parse-stylesheet');

;(function main() {
  const stylesheet = require('./data/stylesheet')
  renderStylesheet(stylesheet)

  const rules = parseStylesheet(stylesheet)
  debugOutputRules(rules)
  console.log(rules)
  window.rules = rules;
})();

function debugOutputRules (rules) {
  rules.forEach(rule => {
    if (rule.declarations) {
      console.log(rule.selector)
      console.table(rule.declarations.map(({name, value}) => ([name, value])))
    } else {
      console.log(rule.condition)
      debugOutputRules(rule.rules)
    }
  })
}

function renderStylesheet(stylesheet) {
  const pre = document.createElement('pre')
  pre.innerText = stylesheet;
  Object.assign(pre.style, {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: "1em",
    overflow: "scroll"
  });
  document.body.appendChild(pre);
}
