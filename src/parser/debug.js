const parseStylesheet = require("./parse-stylesheet");

(function main() {
  const stylesheet = require("./data/stylesheet");
  addToDom(stylesheet);

  console.time("parseStylesheet");
  const rules = parseStylesheet(stylesheet);
  console.timeEnd("parseStylesheet");

  debugOutputRules(rules);

  console.log(rules);
  window.rules = rules;
})();

function debugOutputRules(rules) {
  console.log("-------------------------------------");
  rules.forEach(rule => {
    if (rule.declarations) {
      console.log("CSS Rule:", rule.selector);
      console.table(rule.declarations.map(({name, value}) => ([name, value])));
    } else {
      console.log("CSS Media Query Found", rule.condition);
      debugOutputRules(rule.rules);
    }
  });
}

function addToDom(stylesheet) {
  const pre = document.createElement("pre");
  pre.innerText = stylesheet;
  Object.assign(pre.style, {
    position: "absolute",
    top: "5em",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "2em",
    overflow: "scroll",
    backgroundColor: "#222",
    color: "#ddd",
    margin: 0
  });
  document.body.appendChild(pre);
}
